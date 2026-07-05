import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export default async function DashboardOverview() {
  const session = await auth();
  const isAdmin = session!.user.role === "ADMIN";

  const barber = isAdmin
    ? null
    : await prisma.barber.findUnique({ where: { userId: session!.user.id } });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const where = {
    startTime: { gte: todayStart, lt: todayEnd },
    ...(barber ? { barberId: barber.id } : {}),
  };

  const [todaysAppointments, upcomingCount, revenueServices] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { client: true, service: true, barber: { include: { user: true } } },
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.count({
      where: {
        startTime: { gte: todayEnd },
        status: { in: ["PENDING", "CONFIRMED"] },
        ...(barber ? { barberId: barber.id } : {}),
      },
    }),
    prisma.appointment.findMany({
      where: { status: "COMPLETED", ...(barber ? { barberId: barber.id } : {}) },
      include: { service: true },
    }),
  ]);

  const revenueCents = revenueServices.reduce(
    (sum, a) => sum + a.service.priceCents,
    0
  );

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">
        {isAdmin ? "Shop Overview" : "Your Day"}
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Today</p>
          <p className="mt-2 font-display text-3xl text-gold-soft">
            {todaysAppointments.length}
          </p>
          <p className="text-sm text-muted">appointments</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Upcoming</p>
          <p className="mt-2 font-display text-3xl text-gold-soft">
            {upcomingCount}
          </p>
          <p className="text-sm text-muted">scheduled ahead</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">
            Completed Revenue
          </p>
          <p className="mt-2 font-display text-3xl text-gold-soft">
            {formatPrice(revenueCents)}
          </p>
          <p className="text-sm text-muted">all time</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl text-foreground">
        Today&apos;s Schedule
      </h2>
      <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
        {todaysAppointments.length === 0 && (
          <p className="px-6 py-8 text-sm text-muted">
            No appointments scheduled for today.
          </p>
        )}
        {todaysAppointments.map((appt) => (
          <div key={appt.id} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-foreground">
                {appt.client.name} &middot; {appt.service.name}
              </p>
              {isAdmin && (
                <p className="text-xs text-muted">with {appt.barber.user.name}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gold-soft">
                {appt.startTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-xs uppercase text-muted">{appt.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
