import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const marcusUser = await prisma.user.upsert({
    where: { email: "marcus@freshstylebarbershop.com" },
    update: {},
    create: {
      name: "Marcus Reed",
      email: "marcus@freshstylebarbershop.com",
      passwordHash: barberPassword,
      role: "BARBER",
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

  const haircut = await prisma.service.upsert({
    where: { id: "seed-haircut" },
    update: {},
    create: {
      id: "seed-haircut",
      name: "Classic Haircut",
      description: "Precision cut, tailored to your style.",
      durationMin: 30,
      priceCents: 3500,
    },
  });

  const beardTrim = await prisma.service.upsert({
    where: { id: "seed-beard-trim" },
    update: {},
    create: {
      id: "seed-beard-trim",
      name: "Beard Trim",
      description: "Sharp lines and a clean shape-up.",
      durationMin: 20,
      priceCents: 2000,
    },
  });

  const hotTowelShave = await prisma.service.upsert({
    where: { id: "seed-hot-towel-shave" },
    update: {},
    create: {
      id: "seed-hot-towel-shave",
      name: "Hot Towel Shave",
      description: "Traditional straight-razor shave with hot towel prep.",
      durationMin: 45,
      priceCents: 4500,
    },
  });

  const cutAndBeard = await prisma.service.upsert({
    where: { id: "seed-cut-and-beard" },
    update: {},
    create: {
      id: "seed-cut-and-beard",
      name: "Haircut + Beard Combo",
      description: "Full service cut and beard shape-up.",
      durationMin: 50,
      priceCents: 5000,
    },
  });

  const marcus = await prisma.barber.upsert({
    where: { userId: marcusUser.id },
    update: {},
    create: {
      userId: marcusUser.id,
      bio: "10 years behind the chair, specializing in fades and beard work.",
      services: {
        connect: [
          { id: haircut.id },
          { id: beardTrim.id },
          { id: hotTowelShave.id },
          { id: cutAndBeard.id },
        ],
      },
    },
  });

  // Matches Fresh Style Barbershop's real hours.
  // dayOfWeek: 0 = Sunday ... 6 = Saturday (matches JS Date#getDay()).
  const weeklyHours: { dayOfWeek: number; startTime: string; endTime: string }[] = [
    { dayOfWeek: 0, startTime: "10:00", endTime: "15:00" }, // Sunday
    { dayOfWeek: 1, startTime: "10:00", endTime: "19:00" }, // Monday
    { dayOfWeek: 2, startTime: "10:00", endTime: "19:00" }, // Tuesday
    { dayOfWeek: 3, startTime: "10:00", endTime: "19:00" }, // Wednesday
    { dayOfWeek: 4, startTime: "10:00", endTime: "19:00" }, // Thursday
    { dayOfWeek: 5, startTime: "10:00", endTime: "19:00" }, // Friday
    { dayOfWeek: 6, startTime: "09:00", endTime: "17:00" }, // Saturday
  ];

  for (const { dayOfWeek, startTime, endTime } of weeklyHours) {
    await prisma.availability.upsert({
      where: { barberId_dayOfWeek: { barberId: marcus.id, dayOfWeek } },
      update: { startTime, endTime },
      create: { barberId: marcus.id, dayOfWeek, startTime, endTime },
    });
  }

  console.log({ admin: admin.email, barber: marcusUser.email, client: client.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
