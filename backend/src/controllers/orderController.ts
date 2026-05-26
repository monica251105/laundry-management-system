import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendOrderFinishedEmail } from '../services/emailService';
import { emitOrderUpdate } from '../services/socketService';
import { getIO } from '../services/socketInstance';

const orderSchema = z.object({
  serviceId: z.number(),
  weight: z.number().positive(),
  notes: z.string().optional(),
  userId: z.number(),
});

const generateInvoiceCode = () => {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = orderSchema.parse(req.body);
    const adminId = req.user?.id;

    if (!adminId) return res.status(401).json({ message: 'Unauthorized' });

    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });

    if (!service) return res.status(404).json({ message: 'Service not found' });

    const totalPrice = service.pricePerKg * validatedData.weight;

    const order = await prisma.order.create({
      data: {
        invoiceCode: generateInvoiceCode(),
        userId: validatedData.userId,
        serviceId: validatedData.serviceId,
        weight: validatedData.weight,
        totalPrice,
        notes: validatedData.notes,
        status: 'MENUNGGU',
      },
      include: { service: true },
    });

    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { service: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: { status },
      include: { user: true },
    });

    const io = getIO();

    // Trigger notification if status is SELESAI
    if (status === 'SELESAI' && !order.emailSent) {
      // Send Email
      const emailResult = await sendOrderFinishedEmail(
        order.user.email,
        order.user.name,
        order.invoiceCode,
        order.totalPrice
      );

      if (emailResult) {
        await prisma.order.update({
          where: { id: order.id },
          data: { emailSent: true },
        });
      }

      // Socket notification
      emitOrderUpdate(io, order.userId, {
        id: order.id,
        invoiceCode: order.invoiceCode,
        status: order.status,
        message: `Laundry ${order.invoiceCode} sudah selesai!`,
      });
    } else {
       // Send generic socket update for other statuses
       emitOrderUpdate(io, order.userId, {
        id: order.id,
        invoiceCode: order.invoiceCode,
        status: order.status,
        message: `Status laundry ${order.invoiceCode} berubah menjadi ${status}`,
      });
    }

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (order.status !== 'MENUNGGU') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: { status: 'DIBATALKAN' },
    });

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    });
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({
      where: { id: parseInt(id as string) },
    });
    res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
