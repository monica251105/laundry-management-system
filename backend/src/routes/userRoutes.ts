import express from 'express';
import { 
  getProfile, 
  getAllCustomers, 
  getCustomerDetail,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/userController';
import { authenticateJWT, authorizeAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/profile', authenticateJWT, getProfile);
router.get('/customers', authenticateJWT, authorizeAdmin, getAllCustomers);
router.get('/customers/:id', authenticateJWT, authorizeAdmin, getCustomerDetail);
router.post('/customers', authenticateJWT, authorizeAdmin, createCustomer);
router.put('/customers/:id', authenticateJWT, authorizeAdmin, updateCustomer);
router.delete('/customers/:id', authenticateJWT, authorizeAdmin, deleteCustomer);

export const userRoutes = router;
