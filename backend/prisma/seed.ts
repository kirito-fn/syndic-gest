import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@syndic.fr' },
    update: {},
    create: {
      email: 'admin@syndic.fr',
      password: adminPassword,
      name: 'Administrateur',
      role: 'ADMIN',
    },
  });
  console.log('Admin created:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
