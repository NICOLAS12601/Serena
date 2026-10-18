// Initial data ("day zero"). Run with `pnpm db:seed` (also after `pnpm db:reset`,
// which in Prisma 7 no longer runs the seed by itself).
// Safe to run more than once: it only creates what is missing, never overwrites.
//
// - Always: the single Settings row (defaults from schema.prisma) and the first
//   admin user, from ADMIN_EMAIL / ADMIN_PASSWORD in .env.
// - Development only: sample services and opening hours with FAKE prices.
//   Real business data is entered by Micaela from the admin panel (ADR-006).

import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../src/auth/password.js';
import { PrismaClient } from '../src/generated/prisma/client.js';

try {
  process.loadEnvFile();
} catch {
  // no .env file (production): variables come from the hosting provider
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
});

async function seedSettings() {
  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: {} });
  console.log('✔ Settings row ready');
}

async function seedAdmin() {
  const email = process.env['ADMIN_EMAIL']?.trim().toLowerCase();
  const password = process.env['ADMIN_PASSWORD'];
  if (!email || !password) {
    console.warn('⚠ ADMIN_EMAIL / ADMIN_PASSWORD not set: admin user skipped');
    return;
  }
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`✔ Admin user ${email} already exists (password unchanged)`);
    return;
  }
  await prisma.adminUser.create({
    data: { email, passwordHash: await hashPassword(password) },
  });
  console.log(`✔ Admin user ${email} created`);
}

async function seedSampleData() {
  if ((await prisma.service.count()) === 0) {
    await prisma.service.createMany({
      // Names and descriptions follow Micaela's designs (public copy);
      // prices and most durations are placeholders.
      data: [
        {
          name: 'Encuentro inicial',
          description:
            'Una entrevista para conocerte, un masaje personalizado según lo conversado y, para cerrar, un café o té en un ambiente tranquilo.',
          durationMin: 90,
          price: 1500,
          icon: 'leaf',
          isFirstVisit: true,
          sortOrder: 0,
        },
        {
          name: 'Masaje relajante',
          description:
            'Ayuda a disminuir el estrés, relajar la mente y el cuerpo, mejorar la calidad del descanso y generar una sensación de bienestar general.',
          durationMin: 60,
          price: 1000,
          icon: 'lotus',
          sortOrder: 1,
        },
        {
          name: 'Masaje descontracturante',
          description:
            'Alivia tensiones musculares, reduce contracturas y mejora la movilidad. Ideal para quienes sienten molestias por estrés, malas posturas o actividad física.',
          durationMin: 60,
          price: 1100,
          icon: 'leaf',
          sortOrder: 2,
        },
        {
          name: 'Drenaje linfático',
          description:
            'Estimula la circulación linfática, ayuda a reducir la retención de líquidos y favorece la sensación de liviandad.',
          durationMin: 60,
          price: 1100,
          icon: 'waves',
          sortOrder: 3,
        },
        {
          name: 'Masaje con maderoterapia',
          description:
            'Técnica que utiliza elementos de madera para estimular la circulación, ayudar a modelar, reducir la retención de líquidos y mejorar el tono de la piel.',
          durationMin: 60,
          price: 1200,
          icon: 'wood-roller',
          sortOrder: 4,
        },
      ],
    });
    console.log('✔ Sample services created (placeholder prices)');
  }

  if ((await prisma.weeklySchedule.count()) === 0) {
    const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday
    await prisma.weeklySchedule.createMany({
      data: [
        ...weekdays.map((weekday) => ({
          weekday,
          startMinutes: 9 * 60,
          endMinutes: 13 * 60,
        })),
        ...weekdays.map((weekday) => ({
          weekday,
          startMinutes: 15 * 60,
          endMinutes: 19 * 60,
        })),
        { weekday: 6, startMinutes: 9 * 60, endMinutes: 13 * 60 }, // Saturday morning
      ],
    });
    console.log('✔ Sample opening hours created');
  }
}

async function main() {
  await seedSettings();
  await seedAdmin();
  if (process.env['NODE_ENV'] !== 'production') {
    await seedSampleData();
  }
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
