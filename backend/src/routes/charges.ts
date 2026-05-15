import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { buildingId, month, year } = req.query;
    const where: any = {};
    if (req.user!.role === 'MANAGER') where.buildingId = req.user!.buildingId!;
    else if (buildingId) where.buildingId = Number(buildingId);
    if (month) where.month = Number(month);
    if (year) where.year = Number(year);
    const charges = await prisma.charge.findMany({
      where,
      include: { building: { select: { id: true, name: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    res.json(charges);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { buildingId, amount, month, year, description } = req.body;
    const charge = await prisma.charge.create({ data: { buildingId, amount, month, year, description } });
    res.status(201).json(charge);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const charge = await prisma.charge.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.charge.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

export default router;
