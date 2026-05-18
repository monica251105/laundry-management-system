import { Router } from 'express';
import { getServices, getAllServices, createService, updateService, deleteService } from '../controllers/serviceController';
import { authenticateJWT, authorizeAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public/Customer: Get active services
router.get('/', getServices);

// Admin: Manage services
router.get('/all', authenticateJWT, authorizeAdmin, getAllServices);
router.post('/', authenticateJWT, authorizeAdmin, createService);
router.put('/:id', authenticateJWT, authorizeAdmin, updateService);
router.delete('/:id', authenticateJWT, authorizeAdmin, deleteService);

export default router;
