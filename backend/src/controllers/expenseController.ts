import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

const expenseSchema = z.object({
  title: z.string(),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string().optional(),
});

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const validatedData = expenseSchema.parse(req.body);
    const expense = await prisma.expense.create({
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
      },
    });
    res.status(201).json(expense);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = expenseSchema.partial().parse(req.body);
    const expense = await prisma.expense.update({
      where: { id: parseInt(id as string) },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
      },
    });
    res.json(expense);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({
      where: { id: parseInt(id as string) },
    });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
