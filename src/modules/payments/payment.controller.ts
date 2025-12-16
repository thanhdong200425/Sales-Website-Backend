import { Request, Response } from 'express';
import { vnpayService } from './vnpay.service';
import { prisma } from '../../../prisma/prisma';
import { JwtPayload } from 'jsonwebtoken';

interface UserPayload extends JwtPayload {
  userId: number;
  email: string;
  role?: string;
}

/**
 * Tạo URL thanh toán VNPay
 * POST /api/payments/create
 * Body: { orderId?: number, items: Array, shippingInfo: { customerName, phone, address } }
 */
export const createPayment = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserPayload;
    const { orderId, items, shippingInfo } = req.body;

    if (!user || !user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let order;

    // Nếu có orderId, lấy order hiện có
    if (orderId) {
      order = await prisma.order.findFirst({
        where: {
          id: parseInt(orderId),
          userId: user.userId,
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Kiểm tra trạng thái đơn hàng
      if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
        return res.status(400).json({
          success: false,
          message: 'Order cannot be paid',
        });
      }
    } else {
      // Tạo order mới từ cart items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart items are required',
        });
      }

      if (!shippingInfo || !shippingInfo.customerName || !shippingInfo.address) {
        return res.status(400).json({
          success: false,
          message: 'Shipping information is required',
        });
      }

      // Tính tổng tiền
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { images: { orderBy: { position: 'asc' }, take: 1 } },
        });

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${item.productId} not found`,
          });
        }

        const itemPrice = Number(product.price) * item.quantity;
        totalAmount += itemPrice;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
          color: item.color || product.color,
          size: item.size || product.size,
          image: product.images[0]?.url || null,
        });
      }

      // Tạo order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

      // Tạo order
      order = await prisma.order.create({
        data: {
          orderNumber,
          userId: user.userId,
          customerName: shippingInfo.customerName,
          shippingAddress: shippingInfo.address,
          totalAmount: totalAmount,
          status: 'PENDING',
          items: {
            create: orderItems,
          },
          timeline: {
            create: {
              status: 'Order Placed',
              description: 'Order created and waiting for payment',
            },
          },
        },
        include: {
          items: true,
        },
      });
    }

    // Tạo orderId cho VNPay (format: ORDER_{orderId}_{timestamp})
    const vnpayOrderId = `ORDER_${order.id}_${Date.now()}`;
    // Convert to VND (cents) - giả sử giá đang là USD, nhân với 25000 để chuyển sang VND
    // Bạn có thể điều chỉnh tỷ giá này
    const amount = Math.round(Number(order.totalAmount) * 25000); // 1 USD = 25000 VND
    const orderDescription = `Thanh toan don hang #${order.orderNumber}`;
    const ipAddr = vnpayService.getIpAddress(req);
    const returnUrl = process.env.VNPAY_RETURN_URL || `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/payments/vnpay-return`;

    // Tạo URL thanh toán
    const paymentUrl = vnpayService.createPaymentUrl({
      orderId: vnpayOrderId,
      amount: amount,
      orderDescription: orderDescription,
      ipAddr: ipAddr,
      returnUrl: returnUrl,
    });

    res.status(200).json({
      success: true,
      message: 'Payment URL created successfully',
      data: {
        paymentUrl,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: Number(order.totalAmount),
        amountVND: amount,
      },
    });
  } catch (error) {
    console.error('Error in createPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment URL',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Xử lý callback từ VNPay (Return URL)
 * GET /api/payments/vnpay-return
 */
export const vnpayReturn = async (req: Request, res: Response) => {
  try {
    const verifyResult = vnpayService.verifyReturnUrl(req.query);

    if (verifyResult.isSuccess) {
      // Parse orderId từ vnp_TxnRef
      const vnpTxnRef = req.query.vnp_TxnRef as string;
      const orderIdMatch = vnpTxnRef.match(/ORDER_(\d+)_/);

      if (!orderIdMatch) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?message=Invalid order reference`);
      }

      const orderId = parseInt(orderIdMatch[1]);
      const vnpResponseCode = req.query.vnp_ResponseCode as string;
      const vnpTransactionStatus = req.query.vnp_TransactionStatus as string;
      const vnpTransactionNo = req.query.vnp_TransactionNo as string;

      // Cập nhật trạng thái đơn hàng
      if (vnpResponseCode === '00' && vnpTransactionStatus === '00') {
        // Thanh toán thành công
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
          },
        });

        // Thêm event vào timeline
        await prisma.orderEvent.create({
          data: {
            orderId: orderId,
            status: 'Paid',
            description: `Payment confirmed via VNPay. Transaction ID: ${vnpTransactionNo}`,
          },
        });

        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}`);
      } else {
        // Thanh toán thất bại
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAYMENT_FAILED',
          },
        });

        await prisma.orderEvent.create({
          data: {
            orderId: orderId,
            status: 'Payment Failed',
            description: `Payment failed. Response code: ${vnpResponseCode}`,
          },
        });

        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?orderId=${orderId}&message=${encodeURIComponent(verifyResult.message || 'Payment failed')}`);
      }
    } else {
      // Xác thực thất bại
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?message=${encodeURIComponent(verifyResult.message || 'Payment verification failed')}`);
    }
  } catch (error) {
    console.error('Error in vnpayReturn:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?message=${encodeURIComponent('Payment verification error')}`);
  }
};

/**
 * Xử lý IPN (Instant Payment Notification) từ VNPay
 * POST /api/payments/vnpay-ipn
 */
export const vnpayIpn = async (req: Request, res: Response) => {
  try {
    const verifyResult = vnpayService.verifyReturnUrl(req.query);

    if (verifyResult.isSuccess) {
      const vnpTxnRef = req.query.vnp_TxnRef as string;
      const orderIdMatch = vnpTxnRef.match(/ORDER_(\d+)_/);

      if (orderIdMatch) {
        const orderId = parseInt(orderIdMatch[1]);
        const vnpResponseCode = req.query.vnp_ResponseCode as string;
        const vnpTransactionStatus = req.query.vnp_TransactionStatus as string;
        const vnpTransactionNo = req.query.vnp_TransactionNo as string;

        if (vnpResponseCode === '00' && vnpTransactionStatus === '00') {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
            },
          });

          await prisma.orderEvent.create({
            data: {
              orderId: orderId,
              status: 'Paid',
              description: `Payment confirmed via VNPay IPN. Transaction ID: ${vnpTransactionNo}`,
            },
          });
        }
      }

      res.status(200).json({ RspCode: '00', Message: 'Success' });
    } else {
      res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }
  } catch (error) {
    console.error('Error in vnpayIpn:', error);
    res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

/**
 * Tạo đơn hàng với phương thức thanh toán COD
 * POST /api/payments/create-cod
 * Body: { items: Array, shippingInfo: { customerName, phone, address } }
 */
export const createCodOrder = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserPayload;
    const { items, shippingInfo } = req.body;

    if (!user || !user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required',
      });
    }

    if (!shippingInfo || !shippingInfo.customerName || !shippingInfo.address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping information is required',
      });
    }

    // Tính tổng tiền
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { images: { orderBy: { position: 'asc' }, take: 1 } },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
      }

      const itemPrice = Number(product.price) * item.quantity;
      totalAmount += itemPrice;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        color: item.color || product.color,
        size: item.size || product.size,
        image: product.images[0]?.url || null,
      });
    }

    // Tạo order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    // Tạo order với trạng thái PENDING (chờ giao hàng và thanh toán)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.userId,
        customerName: shippingInfo.customerName,
        shippingAddress: shippingInfo.address,
        totalAmount: totalAmount,
        status: 'PENDING',
        items: {
          create: orderItems,
        },
        timeline: {
          create: {
            status: 'Order Placed',
            description: 'Order created with Cash on Delivery payment method',
          },
        },
      },
      include: {
        items: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: Number(order.totalAmount),
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Error in createCodOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

