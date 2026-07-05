import { prisma } from "@/lib/prisma";

const SLOT_INCREMENT_MIN = 15;

function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function getAvailableSlots(
  barberId: string,
  serviceId: string,
  dateStr: string
): Promise<string[]> {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];

  const dayOfWeek = date.getDay();

  const [service, availability, timeOffBlocks, existingAppointments] =
    await Promise.all([
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.availability.findUnique({
        where: { barberId_dayOfWeek: { barberId, dayOfWeek } },
      }),
      prisma.timeOff.findMany({
        where: {
          barberId,
          startsAt: { lt: new Date(`${dateStr}T23:59:59`) },
          endsAt: { gt: new Date(`${dateStr}T00:00:00`) },
        },
      }),
      prisma.appointment.findMany({
        where: {
          barberId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: {
            gte: new Date(`${dateStr}T00:00:00`),
            lt: new Date(`${dateStr}T23:59:59`),
          },
        },
        select: { startTime: true, endTime: true },
      }),
    ]);

  if (!service || !availability) return [];

  const duration = service.durationMin;
  const dayStart = timeStringToMinutes(availability.startTime);
  const dayEnd = timeStringToMinutes(availability.endTime);

  const busyRanges = [
    ...existingAppointments.map((a) => ({
      start: a.startTime,
      end: a.endTime,
    })),
    ...timeOffBlocks.map((t) => ({ start: t.startsAt, end: t.endsAt })),
  ];

  const now = new Date();
  const slots: string[] = [];

  for (
    let minutes = dayStart;
    minutes + duration <= dayEnd;
    minutes += SLOT_INCREMENT_MIN
  ) {
    const slotStart = new Date(date);
    slotStart.setHours(0, minutes, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + duration * 60_000);

    if (slotStart < now) continue;

    const overlaps = busyRanges.some(
      (range) => slotStart < range.end && slotEnd > range.start
    );

    if (!overlaps) {
      slots.push(slotStart.toISOString());
    }
  }

  return slots;
}
