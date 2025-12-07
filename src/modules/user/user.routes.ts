
import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// Tất cả route profile đều yêu cầu đăng nhập
router.get('/me', authMiddleware, UserController.getUser);
router.put('/me', authMiddleware, UserController.updateUser);
router.put('/me/password', authMiddleware, UserController.changePassword);

export default router;
