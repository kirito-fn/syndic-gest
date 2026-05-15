import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const where = req.user!.role === 'ADMIN' ? {} : { id: req.user!.buildingId! };
    const buildings = await prisma.building.findMany({
      where,
      include: { _count: { select: { residents: true } }, users: { select: { id: true, name: true, email: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const building = await prisma.building.findUnique({
      where: { id: Number(req.params.id) },
      include: { residents: { orderBy: { apartment: 'asc' } }, users: { select: { id: true, name: true, email: true } } },
    });
    if (!building) return res.status(404).json({ error: 'Bâtiment introuvable' });
    if (req.user!.role === 'MANAGER' && req.user!.buildingId !== building.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    res.json(building);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, address } = req.body;
    const building = await prisma.building.create({ data: { name, address } });
    res.status(201).json(building);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, address } = req.body;
    const building = await prisma.building.update({
      where: { id: Number(req.params.id) },
      data: { name, address },
    });
    res.json(building);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.resident.deleteMany({ where: { buildingId: id } });
    await prisma.charge.deleteMany({ where: { buildingId: id } });
    await prisma.user.updateMany({ where: { buildingId: id }, data: { buildingId: null } });
    await prisma.building.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
