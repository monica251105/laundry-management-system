import { Router } from 'express';
import {
  createOrder,
  getCustomerOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  processPayment
} from '../controllers/orderController';
import { authenticateJWT, authorizeAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Customer
router.post('/', authenticateJWT, authorizeAdmin, createOrder);
router.get('/my', authenticateJWT, getCustomerOrders);
router.put('/:id/cancel', authenticateJWT, cancelOrder);

// Admin
router.get('/all', authenticateJWT, authorizeAdmin, getAllOrders);
router.put('/:id/status', authenticateJWT, authorizeAdmin, updateOrderStatus);
router.put('/:id/pay', authenticateJWT, authorizeAdmin, processPayment);

export default router;
