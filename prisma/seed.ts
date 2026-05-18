import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@oya.com' },
    update: {},
    create: {
      name: 'Admin Oya',
      email: 'admin@oya.com',
      passwordHash: adminHash,
      role: 'admin',
      phone: '08000000000',
      location: 'Lagos',
    },
  });

  // Create client user
  const clientHash = await bcrypt.hash('client123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'chidi@example.com' },
    update: {},
    create: {
      name: 'Chidi Okafor',
      email: 'chidi@example.com',
      passwordHash: clientHash,
      role: 'client',
      phone: '08012345678',
      location: 'Lagos',
    },
  });

  // Create sabi user 1
  const sabi1Hash = await bcrypt.hash('sabi123', 12);
  const sabi1 = await prisma.user.upsert({
    where: { email: 'ngozi@example.com' },
    update: {},
    create: {
      name: 'Ngozi Eze',
      email: 'ngozi@example.com',
      passwordHash: sabi1Hash,
      role: 'sabi',
      phone: '08087654321',
      location: 'Abuja',
      avatar: 'https://picsum.photos/seed/ngozi/200/200',
    },
  });

  // Create sabi user 2
  const sabi2Hash = await bcrypt.hash('sabi123', 12);
  const sabi2 = await prisma.user.upsert({
    where: { email: 'emeka@example.com' },
    update: {},
    create: {
      name: 'Emeka Obi',
      email: 'emeka@example.com',
      passwordHash: sabi2Hash,
      role: 'sabi',
      phone: '08123456789',
      location: 'Lagos',
      avatar: 'https://picsum.photos/seed/emeka/200/200',
    },
  });

  // Create sabi profiles
  await prisma.sabiProfile.upsert({
    where: { userId: sabi1.id },
    update: {},
    create: {
      userId: sabi1.id,
      skills: 'Plumbing,Pipe Fitting',
      rating: 4.8,
      verified: true,
      hourlyRate: 5000,
      bio: 'Experienced plumber with 10 years of fixing leaks and installing pipes in Abuja.',
      completedJobs: 42,
    },
  });

  await prisma.sabiProfile.upsert({
    where: { userId: sabi2.id },
    update: {},
    create: {
      userId: sabi2.id,
      skills: 'Cleaning,Deep Cleaning',
      rating: 4.5,
      verified: false,
      hourlyRate: 3000,
      bio: 'Meticulous cleaner for homes and offices. I leave your space sparkling.',
      completedJobs: 15,
    },
  });

  // Create sample jobs
  await prisma.job.upsert({
    where: { id: 'j1' },
    update: {},
    create: {
      id: 'j1',
      clientId: client.id,
      sabiId: sabi1.id,
      title: 'Fix leaking sink',
      description: 'The kitchen sink is leaking heavily. Need it fixed ASAP.',
      status: 'completed',
      price: 15000,
      date: new Date('2026-03-20T10:00:00Z'),
    },
  });

  await prisma.job.upsert({
    where: { id: 'j2' },
    update: {},
    create: {
      id: 'j2',
      clientId: client.id,
      sabiId: sabi2.id,
      title: 'Post-construction cleaning',
      description: 'Need a deep clean of a newly renovated 3-bedroom flat.',
      status: 'pending',
      price: 25000,
      date: new Date('2026-03-28T09:00:00Z'),
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log('   Admin: admin@oya.com / admin123');
  console.log('   Client: chidi@example.com / client123');
  console.log('   Sabi 1: ngozi@example.com / sabi123');
  console.log('   Sabi 2: emeka@example.com / sabi123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
