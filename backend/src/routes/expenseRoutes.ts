import { Router } from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController';
import { authenticateJWT, authorizeAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, authorizeAdmin, getExpenses);
router.post('/', authenticateJWT, authorizeAdmin, createExpense);
router.put('/:id', authenticateJWT, authorizeAdmin, updateExpense);
router.delete('/:id', authenticateJWT, authorizeAdmin, deleteExpense);

export default router;
