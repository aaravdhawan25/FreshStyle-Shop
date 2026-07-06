import { prisma } from "@/lib/prisma";

// Estimates a walk-in's wait purely from booked appointments: if any active
// barber has no appointment covering right now, the wait is zero. If every
// barber is currently in a chair, the wait is the time until the soonest
// one of them finishes.
export async function getEstimatedWaitMinutes(): Promise<number> {
  const now = new Date();

  const [totalBarbers, inProgress] = await Promise.all([
    prisma.barber.count({ where: { isActive: true } }),
    prisma.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { lte: now },
        endTime: { gt: now },
      },
      select: { barberId: true, endTime: true },
    }),
  ]);

  if (totalBarbers === 0) return 0;

  const busyBarberIds = new Set(inProgress.map((a) => a.barberId));
  if (busyBarberIds.size < totalBarbers) return 0;

  const soonestFreeAt = Math.min(...inProgress.map((a) => a.endTime.getTime()));
  return Math.max(0, Math.ceil((soonestFreeAt - now.getTime()) / 60_000));
}
