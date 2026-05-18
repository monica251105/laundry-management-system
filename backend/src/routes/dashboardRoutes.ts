import { Router } from 'express';
import { getAdminStats, getRevenueReport } from '../controllers/dashboardController';
import { authenticateJWT, authorizeAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/stats', authenticateJWT, authorizeAdmin, getAdminStats);
router.get('/revenue', authenticateJWT, authorizeAdmin, getRevenueReport);

export default router;
