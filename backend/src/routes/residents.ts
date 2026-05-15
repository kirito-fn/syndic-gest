import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { buildingId, search } = req.query;
    const where: any = {};
    if (req.user!.role === 'MANAGER') {
      where.buildingId = req.user!.buildingId!;
    } else if (buildingId) {
      where.buildingId = Number(buildingId);
    }
    if (search) {
      where.OR = [
        { firstName: { contains: String(search) } },
        { lastName: { contains: String(search) } },
        { apartment: { contains: String(search) } },
      ];
    }
    const residents = await prisma.resident.findMany({
      where,
      include: { building: { select: { id: true, name: true } } },
      orderBy: [{ buildingId: 'asc' }, { apartment: 'asc' }],
    });
    res.json(residents);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const resident = await prisma.resident.findUnique({
      where: { id: Number(req.params.id) },
      include: { building: true, payments: { orderBy: [{ year: 'desc' }, { month: 'desc' }] } },
    });
    if (!resident) return res.status(404).json({ error: 'Résident introuvable' });
    res.json(resident);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (req.user!.role === 'MANAGER') data.buildingId = req.user!.buildingId!;
    const resident = await prisma.resident.create({ data });
    res.status(201).json(resident);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const resident = await prisma.resident.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(resident);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.resident.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/import', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const { buildingId } = req.body;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file!.buffer as any);
    const worksheet = workbook.worksheets[0];
    const residents: any[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const [firstName, lastName, apartment, phone, email] = row.values as string[];
      if (firstName && lastName) {
        residents.push({ buildingId: Number(buildingId), firstName, lastName, apartment: apartment || '', phone: phone || '', email: email || '' });
      }
    });
    for (const r of residents) {
      await prisma.resident.create({ data: r });
    }
    res.json({ count: residents.length });
  } catch (error) {
    res.status(500).json({ error: 'Erreur import' });
  }
});

export default router;
