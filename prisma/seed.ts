import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { WEEKLY_HOURS } from "../src/lib/shop-hours";

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

const BARBERS: { name: string; bio?: string }[] = [
  { name: "Tyler" },
  { name: "Luke" },
  { name: "Coors" },
  { name: "Vinny" },
  { name: "Maine" },
  { name: "Nash", bio: "Specializes in dreads & braids." },
  { name: "Chance" },
];

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const barberPassword = await bcrypt.hash("Barber123!", 10);
  const clientPassword = await bcrypt.hash("Client123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@avexbarberlounge.com" },
    update: {},
    create: {
      name: "Shop Owner",
      email: "admin@avexbarberlounge.com",
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
    BARBERS.map(async ({ name, bio }) => {
      const email = `${name.toLowerCase()}@avexbarberlounge.com`;
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { name, email, passwordHash: barberPassword, role: "BARBER" },
      });

      return prisma.barber.upsert({
        where: { userId: user.id },
        update: { bio, services: { set: services.map((s) => ({ id: s.id })) } },
        create: {
          userId: user.id,
          bio,
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
    barbers: BARBERS.map(({ name }) => `${name.toLowerCase()}@avexbarberlounge.com`),
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
