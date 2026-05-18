import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string(),
  pricePerKg: z.number().positive(),
  isActive: z.boolean().optional(),
});

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
    });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const validatedData = serviceSchema.parse(req.body);
    const service = await prisma.service.create({
      data: validatedData,
    });
    res.status(201).json(service);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = serviceSchema.partial().parse(req.body);
    const service = await prisma.service.update({
      where: { id: parseInt(id as string) },
      data: validatedData,
    });
    res.json(service);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({
      where: { id: parseInt(id as string) },
    });
    res.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
