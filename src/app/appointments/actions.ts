"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MIN_CANCELLATION_NOTICE_MS } from "@/lib/cancellation";

export type CancelState = {
  error?: string;
  success?: boolean;
};

export async function cancelAppointment(
  _prevState: CancelState,
  formData: FormData
): Promise<CancelState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be signed in." };
  }

  const appointmentId = formData.get("appointmentId");
  if (typeof appointmentId !== "string") {
    return { error: "Invalid request." };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment || appointment.clientId !== session.user.id) {
    return { error: "Appointment not found." };
  }

  if (appointment.status !== "PENDING" && appointment.status !== "CONFIRMED") {
    return { error: "This appointment can no longer be cancelled." };
  }

  // Re-check server-side — the client-side button is only disabled based on
  // the same rule, which a request could otherwise bypass.
  const msUntilStart = appointment.startTime.getTime() - Date.now();
  if (msUntilStart < MIN_CANCELLATION_NOTICE_MS) {
    return {
      error: "Cancellations must be made at least 3 hours before the appointment.",
    };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/appointments");
  revalidatePath("/portal");

  return { success: true };
}
