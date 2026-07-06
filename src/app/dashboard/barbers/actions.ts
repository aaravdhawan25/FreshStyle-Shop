"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WEEKLY_HOURS } from "@/lib/shop-hours";
import { createBarberSchema } from "@/lib/validation";

export type CreateBarberState = {
  error?: string;
  success?: boolean;
};

export async function createBarber(
  _prevState: CreateBarberState,
  formData: FormData
): Promise<CreateBarberState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const parsed = createBarberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, bio } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "BARBER" },
  });

  // New barbers start able to perform every active service and follow the
  // shop's standard hours, so they're immediately bookable — admin can
  // adjust either later directly in the database if needed.
  const barber = await prisma.barber.create({
    data: {
      userId: user.id,
      bio,
      services: { connect: services.map((s) => ({ id: s.id })) },
    },
  });

  await prisma.availability.createMany({
    data: WEEKLY_HOURS.map((h) => ({ barberId: barber.id, ...h })),
  });

  revalidatePath("/dashboard/barbers");
  revalidatePath("/barbers");
  revalidatePath("/book");

  return { success: true };
}

export async function removeBarber(barberId: string): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  const barber = await prisma.barber.findUnique({ where: { id: barberId } });
  if (!barber) return;

  const appointmentCount = await prisma.appointment.count({
    where: { barberId },
  });

  if (appointmentCount === 0) {
    // No history at all — safe to fully remove. Cascades clean up their
    // availability rows and service links along with the user account.
    await prisma.user.delete({ where: { id: barber.userId } });
  } else {
    // They have real appointment history (past revenue, or a customer's
    // upcoming booking) — deactivating instead of deleting hides them from
    // new bookings without destroying those records.
    await prisma.barber.update({
      where: { id: barberId },
      data: { isActive: false },
    });
  }

  revalidatePath("/dashboard/barbers");
  revalidatePath("/barbers");
  revalidatePath("/book");
}
