import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SERVICES: {
  id: string;
  name: string;
  description?: string;
  durationMin: number;
  priceCents: number;
}[] = [
  { id: "svc-regular-haircut", name: "Regular Haircut", durationMin: 30, priceCents: 3500 },
  { id: "svc-haircut-skin-fade", name: "Haircut Skin Fade", durationMin: 35, priceCents: 3500 },
  { id: "svc-skin-fade-and-beard", name: "Skin Fade And Beard", durationMin: 45, priceCents: 4500 },
  { id: "svc-taper-fade-and-beard", name: "Taper Fade & Beard", durationMin: 40, priceCents: 4500 },
  { id: "svc-taper-and-shape-up", name: "Taper & Shape Up", durationMin: 30, priceCents: 3500 },
  { id: "svc-shape-up-and-beard", name: "Shape Up And Beard", durationMin: 25, priceCents: 2500 },
  { id: "svc-line-and-beard-fade", name: "Line & Beard Fade", durationMin: 25, priceCents: 2500 },
  { id: "svc-seniors", name: "Seniors (Ages 60 & Over)", durationMin: 30, priceCents: 3300 },
  { id: "svc-kids", name: "Kids (Age 8 & Under)", durationMin: 25, priceCents: 3000 },
  { id: "svc-kids-skin-fade", name: "Kids Age 8 & Under (Skin Fade)", durationMin: 30, priceCents: 3000 },
  {
    id: "svc-vip-service",
    name: "VIP Service Hair (Hair & Hot Towel Shave)",
    description: "Hot towel, shave, massage.",
    durationMin: 65,
    priceCents: 7000,
  },
  { id: "svc-holiday-beard-haircuts", name: "Holiday Beard Haircuts", durationMin: 45, priceCents: 5000 },
];

const BARBER_NAMES = ["Jeanel", "Raj", "Flaco", "Oswald", "Jeffrey", "Pedro", "Frank"];

// Matches Fresh Style Barbershop's real hours.
// dayOfWeek: 0 = Sunday ... 6 = Saturday (matches JS Date#getDay()).
const WEEKLY_HOURS: { dayOfWeek: number; startTime: string; endTime: string }[] = [
  { dayOfWeek: 0, startTime: "10:00", endTime: "15:00" }, // Sunday
  { dayOfWeek: 1, startTime: "10:00", endTime: "19:00" }, // Monday
  { dayOfWeek: 2, startTime: "10:00", endTime: "19:00" }, // Tuesday
  { dayOfWeek: 3, startTime: "10:00", endTime: "19:00" }, // Wednesday
  { dayOfWeek: 4, startTime: "10:00", endTime: "19:00" }, // Thursday
  { dayOfWeek: 5, startTime: "10:00", endTime: "19:00" }, // Friday
  { dayOfWeek: 6, startTime: "09:00", endTime: "17:00" }, // Saturday
];

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const barberPassword = await bcrypt.hash("Barber123!", 10);
  const clientPassword = await bcrypt.hash("Client123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@freshstylebarbershop.com" },
    update: {},
    create: {
      name: "Shop Owner",
      email: "admin@freshstylebarbershop.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      name: "Jordan Client",
      email: "client@example.com",
      passwordHash: clientPassword,
      role: "CLIENT",
    },
  });

  const services = await Promise.all(
    SERVICES.map((s) =>
      prisma.service.upsert({
        where: { id: s.id },
        update: {
          name: s.name,
          description: s.description,
          durationMin: s.durationMin,
          priceCents: s.priceCents,
        },
        create: s,
      })
    )
  );

  const barbers = await Promise.all(
    BARBER_NAMES.map(async (name) => {
      const email = `${name.toLowerCase()}@freshstylebarbershop.com`;
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { name, email, passwordHash: barberPassword, role: "BARBER" },
      });

      return prisma.barber.upsert({
        where: { userId: user.id },
        update: { services: { set: services.map((s) => ({ id: s.id })) } },
        create: {
          userId: user.id,
          services: { connect: services.map((s) => ({ id: s.id })) },
        },
      });
    })
  );

  for (const barber of barbers) {
    for (const { dayOfWeek, startTime, endTime } of WEEKLY_HOURS) {
      await prisma.availability.upsert({
        where: { barberId_dayOfWeek: { barberId: barber.id, dayOfWeek } },
        update: { startTime, endTime },
        create: { barberId: barber.id, dayOfWeek, startTime, endTime },
      });
    }
  }

  console.log({
    admin: admin.email,
    barbers: BARBER_NAMES.map((n) => `${n.toLowerCase()}@freshstylebarbershop.com`),
    client: client.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
