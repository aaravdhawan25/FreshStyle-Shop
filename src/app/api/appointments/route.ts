import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bookAppointmentSchema } from "@/lib/validation";
import { getAvailableSlots } from "@/lib/availability";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be signed in to book." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bookAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { barberId, serviceId, startTime, notes } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const start = new Date(startTime);
  const dateStr = start.toISOString().slice(0, 10);

  // Re-check availability server-side to prevent race conditions / stale slots
  const validSlots = await getAvailableSlots(barberId, serviceId, dateStr);
  if (!validSlots.includes(start.toISOString())) {
    return NextResponse.json(
      { error: "That time slot is no longer available. Please pick another." },
      { status: 409 }
    );
  }

  const end = new Date(start.getTime() + service.durationMin * 60_000);

  try {
    const appointment = await prisma.appointment.create({
      data: {
        clientId: session.user.id,
        barberId,
        serviceId,
        startTime: start,
        endTime: end,
        notes,
        status: "CONFIRMED",
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That time slot was just booked. Please pick another." },
        { status: 409 }
      );
    }
    throw err;
  }
}
