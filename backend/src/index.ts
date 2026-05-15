import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import buildingRoutes from './routes/buildings';
import residentRoutes from './routes/residents';
import paymentRoutes from './routes/payments';
import chargeRoutes from './routes/charges';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/charges', chargeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
