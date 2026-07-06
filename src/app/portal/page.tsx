import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { SHOP_TIME_ZONE, formatDateInZone, zonedDayBounds } from "@/lib/timezone";
import { Countdown } from "@/components/countdown";
import { PortalAppointmentRow } from "./portal-appointment-row";

export default async function PortalPage() {
  const session = await auth();
  // Layout already gates this route to BARBER, but a session is required
  // to look up which barber record belongs to this user.
  if (!session?.user) redirect("/login?callbackUrl=/portal");

  const barber = await prisma.barber.findUnique({
    where: { userId: session.user.id },
  });
  if (!barber) redirect("/");

  const todayStr = formatDateInZone(new Date());
  const { start: todayStart, end: todayEnd } = zonedDayBounds(todayStr);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);

  const [todaysAppointments, weekCount, nextAppointment, cancellationsCount] =
    await Promise.all([
      prisma.appointment.findMany({
        where: {
          barberId: barber.id,
          startTime: { gte: todayStart, lt: todayEnd },
          status: { not: "CANCELLED" },
        },
        include: { client: true, service: true },
        orderBy: { startTime: "asc" },
      }),
      prisma.appointment.count({
        where: {
          barberId: barber.id,
          startTime: { gte: weekAgo },
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        },
      }),
      prisma.appointment.findFirst({
        where: {
          barberId: barber.id,
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { gte: new Date() },
        },
        include: { client: true, service: true },
        orderBy: { startTime: "asc" },
      }),
      prisma.appointment.count({
        where: {
          barberId: barber.id,
          startTime: { gte: weekAgo },
          status: "CANCELLED",
        },
      }),
    ]);

  const todaysRevenueCents = todaysAppointments
    .filter((a) => a.status !== "NO_SHOW")
    .reduce((sum, a) => sum + a.service.priceCents, 0);

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          timeZone: SHOP_TIME_ZONE,
        })}
      </p>
      <h1 className="font-display text-3xl text-foreground">
        Welcome back, {session.user.name?.split(" ")[0]}
      </h1>

      {nextAppointment && (
        <div className="mt-8 rounded-2xl border border-gold/40 bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Next Up</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-xl text-foreground">
                {nextAppointment.client.name} &middot; {nextAppointment.service.name}
              </p>
              <p className="text-sm text-muted">
                {nextAppointment.startTime.toLocaleString("en-US", {
                  weekday: "long",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: SHOP_TIME_ZONE,
                })}
              </p>
            </div>
            <Countdown targetIso={nextAppointment.startTime.toISOString()} />
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">Today</p>
          <p className="mt-2 font-display text-3xl text-gold-soft">
            {todaysAppointments.length}
          </p>
          <p className="text-sm text-muted">appointments</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">This Week</p>
          <p className="mt-2 font-display text-3xl text-gold-soft">{weekCount}</p>
          <p className="text-sm text-muted">appointments</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">
            Today&apos;s Revenue
          </p>
          <p className="mt-2 font-display text-3xl text-gold-soft">
            {formatPrice(todaysRevenueCents)}
          </p>
          <p className="text-sm text-muted">estimated</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-wide text-muted">
            Cancellations
          </p>
          <p className="mt-2 font-display text-3xl text-gold-soft">
            {cancellationsCount}
          </p>
          <p className="text-sm text-muted">this week</p>
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
          <PortalAppointmentRow
            key={appt.id}
            appointment={{
              id: appt.id,
              clientName: appt.client.name,
              clientPhone: appt.client.phone,
              serviceName: appt.service.name,
              startTime: appt.startTime.toISOString(),
              durationMin: appt.service.durationMin,
              status: appt.status,
            }}
          />
        ))}
      </div>
    </div>
  );
}
