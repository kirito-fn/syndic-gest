import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, buildingId, month, year, search } = req.query;
    const where: any = {};
    if (req.user!.role === 'MANAGER') {
      where.resident = { buildingId: req.user!.buildingId! };
    }
    if (buildingId && req.user!.role === 'ADMIN') {
      where.resident = { buildingId: Number(buildingId) };
    }
    if (status) where.status = status;
    if (month) where.month = Number(month);
    if (year) where.year = Number(year);
    if (search) {
      where.resident = {
        ...where.resident,
        OR: [
          { firstName: { contains: String(search) } },
          { lastName: { contains: String(search) } },
          { apartment: { contains: String(search) } },
        ],
      };
    }
    const payments = await prisma.payment.findMany({
      where,
      include: { resident: { include: { building: { select: { id: true, name: true } } } }, logs: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { resident: { lastName: 'asc' } }],
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/declare', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { residentId, months, year, amount, payNow } = req.body;
    const created = [];
    for (const month of months) {
      const data: any = { residentId, month, year, amount, status: payNow ? 'PAID' : 'PENDING' };
      if (payNow) data.paidAt = new Date();
      const payment = await prisma.payment.upsert({
        where: { residentId_month_year: { residentId, month, year } },
        update: {
          amount,
          status: payNow ? 'PAID' : 'PENDING',
          paidAt: payNow ? new Date() : null,
          noPayment: false,
        },
        create: data,
      });
      await prisma.paymentLog.create({
        data: {
          paymentId: payment.id,
          userId: req.user!.id,
          action: payNow ? 'PAID_DIRECT' : 'DECLARED',
          newStatus: payNow ? 'PAID' : 'PENDING',
        },
      });
      created.push(payment);
    }
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Erreur déclaration' });
  }
});

router.post('/:id/verify', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await prisma.payment.update({
      where: { id: Number(req.params.id) },
      data: { status: 'PAID', verifiedAt: new Date() },
    });
    await prisma.paymentLog.create({
      data: { paymentId: payment.id, userId: req.user!.id, action: 'VERIFIED', oldStatus: 'PENDING', newStatus: 'PAID' },
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur vérification' });
  }
});

router.post('/:id/unverify', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await prisma.payment.update({
      where: { id: Number(req.params.id) },
      data: { status: 'PENDING', verifiedAt: null },
    });
    await prisma.paymentLog.create({
      data: { paymentId: payment.id, userId: req.user!.id, action: 'UNVERIFIED', oldStatus: 'PAID', newStatus: 'PENDING' },
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.post('/:id/reset', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await prisma.payment.update({
      where: { id: Number(req.params.id) },
      data: { status: 'UNPAID', paidAt: null, verifiedAt: null, noPayment: false },
    });
    await prisma.paymentLog.create({
      data: { paymentId: payment.id, userId: req.user!.id, action: 'RESET', oldStatus: req.body.oldStatus, newStatus: 'UNPAID', reason: req.body.reason },
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.post('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, reason } = req.body;
    const old = await prisma.payment.findUnique({ where: { id: Number(req.params.id) } });
    const payment = await prisma.payment.update({
      where: { id: Number(req.params.id) },
      data: { status, paidAt: status === 'PAID' ? new Date() : null, verifiedAt: status === 'PAID' ? new Date() : null },
    });
    await prisma.paymentLog.create({
      data: { paymentId: payment.id, userId: req.user!.id, action: 'STATUS_CHANGE', oldStatus: old?.status, newStatus: status, reason },
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.post('/:id/no-payment', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await prisma.payment.update({
      where: { id: Number(req.params.id) },
      data: { noPayment: true, status: 'UNPAID' },
    });
    await prisma.paymentLog.create({
      data: { paymentId: payment.id, userId: req.user!.id, action: 'NO_PAYMENT', newStatus: 'UNPAID', reason: 'Signalé sans paiement' },
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.post('/:id/mark-unpaid', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await prisma.payment.update({
      where: { id: Number(req.params.id) },
      data: { status: 'UNPAID', paidAt: null },
    });
    await prisma.paymentLog.create({
      data: { paymentId: payment.id, userId: req.user!.id, action: 'MARKED_UNPAID', oldStatus: 'PENDING', newStatus: 'UNPAID', reason: 'Marqué impayé par le gestionnaire' },
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

export default router;
