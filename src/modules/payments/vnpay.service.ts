import { VNPay } from 'vnpay';
import type { VNPayConfig } from 'vnpay/types-only';

class VNPayService {
  private vnpay: VNPay;

  constructor() {
    const config: VNPayConfig = {
      tmnCode: process.env.VNPAY_TMN_CODE || '',
      secureSecret: process.env.VNPAY_SECRET_KEY || '',
      vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
      testMode: process.env.VNPAY_TEST_MODE === 'true',
      hashAlgorithm: 'SHA512',
    };

    this.vnpay = new VNPay(config);
  }

  /**
   * Tạo URL thanh toán VNPay
   * @param orderId - ID đơn hàng
   * @param amount - Số tiền (VND)
   * @param orderDescription - Mô tả đơn hàng
   * @param ipAddr - IP của khách hàng
   * @param returnUrl - URL trả về sau thanh toán
   * @returns URL thanh toán VNPay
   */
  createPaymentUrl(params: {
    orderId: string;
    amount: number;
    orderDescription: string;
    ipAddr: string;
    returnUrl: string;
  }): string {
    const { orderId, amount, orderDescription, ipAddr, returnUrl } = params;

    const paymentUrl = this.vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_Command: 'pay',
      vnp_CreateDate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + '00',
      vnp_CurrCode: 'VND',
      vnp_IpAddr: ipAddr,
      vnp_Locale: 'vn',
      vnp_OrderInfo: orderDescription,
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: orderId,
      vnp_Version: '2.1.0',
    });

    return paymentUrl;
  }

  /**
   * Xác thực kết quả thanh toán từ VNPay
   * @param query - Query parameters từ VNPay callback
   * @returns Kết quả xác thực
   */
  verifyReturnUrl(query: any) {
    return this.vnpay.verifyReturnUrl(query);
  }

  /**
   * Lấy IP address từ request
   */
  getIpAddress(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }
}

export const vnpayService = new VNPayService();

