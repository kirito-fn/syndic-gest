import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.query;
    const m = month ? Number(month) : new Date().getMonth() + 1;
    const y = year ? Number(year) : new Date().getFullYear();

    const buildingWhere = req.user!.role === 'MANAGER' ? { id: req.user!.buildingId! } : {};
    const residentWhere: any = {};
    if (req.user!.role === 'MANAGER') residentWhere.buildingId = req.user!.buildingId!;
    const paymentWhere: any = { month: m, year: y };
    if (req.user!.role === 'MANAGER') paymentWhere.resident = { buildingId: req.user!.buildingId! };

    const totalResidents = await prisma.resident.count({ where: residentWhere });
    const paidCount = await prisma.payment.count({ where: { ...paymentWhere, status: 'PAID' } });
    const pendingCount = await prisma.payment.count({ where: { ...paymentWhere, status: 'PENDING' } });
    const unpaidCount = await prisma.payment.count({ where: { ...paymentWhere, status: 'UNPAID' } });

    const paidPayments = await prisma.payment.findMany({ where: { ...paymentWhere, status: 'PAID' } });
    const totalCollected = paidPayments.reduce((sum, p) => sum + p.amount, 0);

    const charges = await prisma.charge.findMany({ where: { month: m, year: y, building: buildingWhere } });
    const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0);

    const monthlyData = [];
    for (let i = 1; i <= 12; i++) {
      const p = await prisma.payment.findMany({ where: { month: i, year: y, status: 'PAID', ...(req.user!.role === 'MANAGER' ? { resident: { buildingId: req.user!.buildingId! } } : {}) } });
      monthlyData.push({ month: i, total: p.reduce((s, x) => s + x.amount, 0) });
    }

    const buildings = await prisma.building.findMany({
      where: buildingWhere,
      include: { residents: { include: { payments: { where: { month: m, year: y } } } } },
    });
    const buildingProgress = buildings.map(b => {
      const total = b.residents.length;
      const paid = b.residents.filter(r => r.payments.some(p => p.status === 'PAID')).length;
      return { id: b.id, name: b.name, total, paid, rate: total ? Math.round((paid / total) * 100) : 0 };
    });

    res.json({
      totalResidents,
      paidCount,
      pendingCount,
      unpaidCount,
      totalCollected,
      totalCharges,
      balance: totalCollected - totalCharges,
      monthlyData,
      buildingProgress,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
