import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const customerCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

const customerUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional().nullable(),
  name: z.string().optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
      },
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.user.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        orders: {
          include: { service: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const validatedData = customerCreateSchema.parse(req.body);
    const { email, password, name, phone, address } = validatedData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        address: address || null,
        role: 'CUSTOMER',
      },
    });

    res.status(201).json(customer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = customerUpdateSchema.parse(req.body);
    const { email, password, name, phone, address } = validatedData;

    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== parseInt(id as string)) {
        return res.status(400).json({ message: 'Email sudah digunakan oleh pengguna lain.' });
      }
    }

    const updateData: any = {
      email,
      name,
      phone: phone === undefined ? undefined : (phone || null),
      address: address === undefined ? undefined : (address || null),
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedCustomer = await prisma.user.update({
      where: { id: parseInt(id as string) },
      data: updateData,
    });

    res.json(updatedCustomer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id as string);

    const orderCount = await prisma.order.count({
      where: { userId },
    });

    if (orderCount > 0) {
      return res.status(400).json({ 
        message: 'Tidak dapat menghapus pelanggan yang memiliki riwayat transaksi/pesanan.' 
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'Pelanggan berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

