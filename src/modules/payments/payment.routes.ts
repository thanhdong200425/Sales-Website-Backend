import { Router } from 'express';
import * as paymentController from './payment.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// Route tạo thanh toán (cần authentication)
router.post('/create', authMiddleware, paymentController.createPayment);

// Route tạo đơn hàng COD (cần authentication)
router.post('/create-cod', authMiddleware, paymentController.createCodOrder);

// Route callback từ VNPay (không cần authentication - VNPay sẽ gọi trực tiếp)
router.get('/vnpay-return', paymentController.vnpayReturn);
router.post('/vnpay-ipn', paymentController.vnpayIpn);

export default router;

