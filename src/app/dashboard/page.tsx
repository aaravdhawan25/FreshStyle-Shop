import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { SHOP_TIME_ZONE, formatDateInZone, zonedDayBounds } from "@/lib/timezone";
import { StatusIcon } from "@/components/status-icon";

export default async function DashboardOverview() {
  // "Today" means today in the shop's timezone, not the server's — Vercel
  // runs in UTC, which would otherwise roll the day over hours too early/late.
  const { start: todayStart, end: todayEnd } = zonedDayBounds(formatDateInZone(new Date()));

  const [todaysAppointments, upcomingCount, revenueServices, cancellationsCount] =
    await Promise.all([
      prisma.appointment.findMany({
        where: { startTime: { gte: todayStart, lt: todayEnd } },
        include: { client: true, service: true, barber: { include: { user: true } } },
        orderBy: { startTime: "asc" },
      }),
      prisma.appointment.count({
        where: {
          startTime: { gte: todayEnd },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),
      prisma.appointment.findMany({
        where: { status: "COMPLETED" },
        include: { service: true },
      }),
      prisma.appointment.count({ where: { status: "CANCELLED" } }),
    ]);

  const revenueCents = revenueServices.reduce(
    (sum, a) => sum + a.service.priceCents,
    0
  );

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Shop Overview</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">
            Cancellations
          </p>
          <p className="mt-2 font-display text-3xl text-gold-soft">
            {cancellationsCount}
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
              <p className="text-xs text-muted">with {appt.barber.user.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gold-soft">
                  {appt.startTime.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: SHOP_TIME_ZONE,
                  })}
                </p>
                <p className="text-xs uppercase text-muted">{appt.status}</p>
              </div>
              <StatusIcon status={appt.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
