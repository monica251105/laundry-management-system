import { Request, Response } from 'express';
import prisma from '../config/prisma';

const getStartOfDay = (date: Date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date: Date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    
    let todayStart: Date;
    let todayEnd: Date;

    if (start && end) {
      todayStart = new Date(start as string);
      todayEnd = new Date(end as string);
    } else {
      todayStart = getStartOfDay();
      todayEnd = getEndOfDay();
    }

    const totalOrdersToday = await prisma.order.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const revenueToday = await prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
        paidAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const expensesToday = await prisma.expense.aggregate({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const expensesTodayList = await prisma.expense.findMany({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingOrders = await prisma.order.count({
      where: {
        status: {
          in: ['MENUNGGU', 'DIPROSES', 'CUCI', 'SETRIKA'],
        },
      },
    });

    const totalRevenueToday = revenueToday._sum.totalPrice || 0;
    const totalExpensesToday = expensesToday._sum.amount || 0;

    res.json({
      totalOrdersToday,
      revenueToday: totalRevenueToday,
      expensesToday: totalExpensesToday,
      expensesTodayList,
      netIncomeToday: totalRevenueToday - totalExpensesToday,
      pendingOrders,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;

    const orderWhere: any = {
      paymentStatus: 'PAID',
    };

    const expenseWhere: any = {};

    if (start || end) {
      const dateRange: any = {};
      if (start) {
        const startDate = new Date(start as string);
        startDate.setHours(0,0,0,0);
        dateRange.gte = startDate;
      }
      if (end) {
        const endDate = new Date(end as string);
        endDate.setHours(23, 59, 59, 999);
        dateRange.lte = endDate;
      }
      orderWhere.paidAt = dateRange;
      expenseWhere.date = dateRange;
    } else {
      // Default to today if no dates provided
      const todayStart = getStartOfDay();
      const todayEnd = getEndOfDay();
      const dateRange = { gte: todayStart, lte: todayEnd };
      orderWhere.paidAt = dateRange;
      expenseWhere.date = dateRange;
    }

    const report = await prisma.order.findMany({
      where: orderWhere,
      select: {
        id: true,
        invoiceCode: true,
        totalPrice: true,
        paidAt: true,
      },
      orderBy: { paidAt: 'desc' },
    });

    const expenses = await prisma.expense.findMany({
      where: expenseWhere,
      orderBy: { date: 'desc' },
    });

    const totalRevenue = report.reduce((sum: number, order: any) => sum + order.totalPrice, 0);
    const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);

    res.json({
      report,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
