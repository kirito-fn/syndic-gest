import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { buildingId } = req.query;
    const where: any = {};
    if (req.user!.role === 'MANAGER') where.resident = { buildingId: req.user!.buildingId! };
    else if (buildingId) where.resident = { buildingId: Number(buildingId) };
    const logs = await prisma.notificationLog.findMany({
      where,
      include: { resident: { include: { building: { select: { name: true } } } }, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/send', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { residentIds, type, message } = req.body;
    const results = [];
    for (const residentId of residentIds) {
      const resident = await prisma.resident.findUnique({ where: { id: residentId } });
      if (!resident) continue;
      let status = 'SENT';
      let logMessage = message;
      if (type === 'EMAIL') {
        logMessage = `Email envoyé à ${resident.email}: ${message}`;
      } else if (type === 'WHATSAPP') {
        logMessage = `WhatsApp envoyé à ${resident.phone}: ${message}`;
      }
      const log = await prisma.notificationLog.create({
        data: { residentId, userId: req.user!.id, type, message: logMessage, status },
      });
      results.push(log);
    }
    res.json({ count: results.length, notifications: results });
  } catch (error) {
    res.status(500).json({ error: 'Erreur envoi' });
  }
});

router.post('/payment-confirmation/:paymentId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: Number(req.params.paymentId) },
      include: { resident: true },
    });
    if (!payment) return res.status(404).json({ error: 'Paiement introuvable' });
    const msg = `Confirmation de paiement - ${payment.resident.firstName} ${payment.resident.lastName}: ${payment.amount}€ pour ${payment.month}/${payment.year}`;
    await prisma.notificationLog.create({
      data: { residentId: payment.residentId, userId: req.user!.id, type: 'EMAIL', message: msg, status: 'SENT' },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

export default router;
