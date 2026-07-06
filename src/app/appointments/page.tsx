import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SHOP_TIME_ZONE } from "@/lib/timezone";
import { Countdown } from "@/components/countdown";
import { CancelAppointmentButton } from "./cancel-appointment-button";

export default async function MyAppointmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/appointments");

  const appointments = await prisma.appointment.findMany({
    where: {
      clientId: session.user.id,
      status: { in: ["PENDING", "CONFIRMED"] },
      startTime: { gte: new Date() },
    },
    include: { barber: { include: { user: true } }, service: true },
    orderBy: { startTime: "asc" },
  });

  const [next, ...rest] = appointments;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-foreground">My Appointments</h1>

      {!next && (
        <p className="mt-6 text-muted">
          You don&apos;t have any upcoming appointments.{" "}
          <Link href="/book" className="text-gold hover:text-gold-soft">
            Book one now
          </Link>
          .
        </p>
      )}

      {next && (
        <div className="mt-8 rounded-2xl border border-gold/40 bg-surface p-8 text-center">
          <p className="text-xs uppercase tracking-wide text-muted">Up Next</p>
          <p className="mt-2 font-display text-2xl text-foreground">
            {next.service.name} with {next.barber.user.name}
          </p>
          <p className="mt-1 text-muted">
            {next.startTime.toLocaleString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZone: SHOP_TIME_ZONE,
            })}
          </p>
          <div className="mt-6">
            <Countdown targetIso={next.startTime.toISOString()} />
          </div>
          <div className="mt-6 flex justify-center">
            <CancelAppointmentButton
              appointmentId={next.id}
              startTimeIso={next.startTime.toISOString()}
            />
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-xl text-foreground">
            Also Coming Up
          </h2>
          <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
            {rest.map((appt) => (
              <div
                key={appt.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
              >
                <div>
                  <p className="text-foreground">
                    {appt.service.name} with {appt.barber.user.name}
                  </p>
                  <p className="text-sm text-gold-soft">
                    {appt.startTime.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: SHOP_TIME_ZONE,
                    })}
                  </p>
                </div>
                <CancelAppointmentButton
                  appointmentId={appt.id}
                  startTimeIso={appt.startTime.toISOString()}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
