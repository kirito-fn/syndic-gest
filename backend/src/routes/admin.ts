import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();
const router = Router();

router.get('/managers', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER' },
      include: { building: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(managers);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/managers', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, buildingId } = req.body;
    const hashed = bcrypt.hashSync(password, 10);
    const manager = await prisma.user.create({
      data: { name, email, password: hashed, role: 'MANAGER', buildingId: buildingId || null },
      select: { id: true, name: true, email: true, role: true, buildingId: true },
    });
    res.status(201).json(manager);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Email déjà utilisé' });
    res.status(500).json({ error: 'Erreur' });
  }
});

router.put('/managers/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, buildingId } = req.body;
    const data: any = { name, email, buildingId: buildingId || null };
    if (password) data.password = bcrypt.hashSync(password, 10);
    const manager = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data,
      select: { id: true, name: true, email: true, role: true, buildingId: true },
    });
    res.json(manager);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.delete('/managers/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

router.get('/export', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { month, year, buildingId } = req.query;
    const m = Number(month) || new Date().getMonth() + 1;
    const y = Number(year) || new Date().getFullYear();
    const where: any = { month: m, year: y };
    if (buildingId) where.resident = { buildingId: Number(buildingId) };
    const payments = await prisma.payment.findMany({
      where,
      include: { resident: { include: { building: true } } },
      orderBy: { resident: { buildingId: 'asc' } },
    });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rapport');
    sheet.columns = [
      { header: 'Bâtiment', key: 'building', width: 20 },
      { header: 'Appartement', key: 'apartment', width: 15 },
      { header: 'Nom', key: 'name', width: 25 },
      { header: 'Montant', key: 'amount', width: 12 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'Date paiement', key: 'paidAt', width: 20 },
    ];
    for (const p of payments) {
      sheet.addRow({
        building: p.resident.building.name,
        apartment: p.resident.apartment,
        name: `${p.resident.firstName} ${p.resident.lastName}`,
        amount: p.amount,
        status: p.status === 'PAID' ? 'Payé' : p.status === 'PENDING' ? 'En attente' : 'Impayé',
        paidAt: p.paidAt ? p.paidAt.toISOString().split('T')[0] : '',
      });
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=rapport-${m}-${y}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Erreur export' });
  }
});

export default router;
