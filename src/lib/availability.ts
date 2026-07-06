import { prisma } from "@/lib/prisma";
import { getDayOfWeek, zonedDayBounds, zonedTimeToUtc } from "@/lib/timezone";

const SLOT_INCREMENT_MIN = 30;

// Every barber gets the same daily lunch break — no appointments are
// bookable in this window regardless of who's working.
const LUNCH_BREAK = { start: "12:00", end: "12:30" };

function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function getAvailableSlots(
  barberId: string,
  serviceId: string,
  dateStr: string
): Promise<string[]> {
  if (Number.isNaN(new Date(`${dateStr}T00:00:00Z`).getTime())) return [];

  const dayOfWeek = getDayOfWeek(dateStr);
  const { start: dayStartUtc, end: dayEndUtc } = zonedDayBounds(dateStr);

  const [service, availability, timeOffBlocks, existingAppointments] =
    await Promise.all([
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.availability.findUnique({
        where: { barberId_dayOfWeek: { barberId, dayOfWeek } },
      }),
      prisma.timeOff.findMany({
        where: {
          barberId,
          startsAt: { lt: dayEndUtc },
          endsAt: { gt: dayStartUtc },
        },
      }),
      prisma.appointment.findMany({
        where: {
          barberId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { gte: dayStartUtc, lt: dayEndUtc },
        },
        select: { startTime: true, endTime: true },
      }),
    ]);

  if (!service || !availability) return [];

  const duration = service.durationMin;
  // Anchor "shop opens" to the correct UTC instant for this specific date
  // (DST-aware), then walk the rest of the day in plain minute offsets —
  // safe since shop hours never span a DST transition (those happen at 2am).
  const openUtc = zonedTimeToUtc(dateStr, availability.startTime);
  const windowMinutes =
    timeStringToMinutes(availability.endTime) - timeStringToMinutes(availability.startTime);

  const busyRanges = [
    ...existingAppointments.map((a) => ({
      start: a.startTime,
      end: a.endTime,
    })),
    ...timeOffBlocks.map((t) => ({ start: t.startsAt, end: t.endsAt })),
    {
      start: zonedTimeToUtc(dateStr, LUNCH_BREAK.start),
      end: zonedTimeToUtc(dateStr, LUNCH_BREAK.end),
    },
  ];

  const now = new Date();
  const slots: string[] = [];

  for (
    let offsetMin = 0;
    offsetMin + duration <= windowMinutes;
    offsetMin += SLOT_INCREMENT_MIN
  ) {
    const slotStart = new Date(openUtc.getTime() + offsetMin * 60_000);
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
