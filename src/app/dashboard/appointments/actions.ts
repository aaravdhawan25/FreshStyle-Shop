"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { AppointmentStatus } from "@prisma/client";

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "BARBER")) {
    throw new Error("Not authorized");
  }

  if (session.user.role === "BARBER") {
    const barber = await prisma.barber.findUnique({
      where: { userId: session.user.id },
    });
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!barber || appointment?.barberId !== barber.id) {
      throw new Error("Not authorized");
    }
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  revalidatePath("/appointments");
}
