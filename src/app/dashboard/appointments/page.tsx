import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { AppointmentRow } from "./appointment-row";

export default async function AppointmentsPage() {
  const session = await auth();
  const isAdmin = session!.user.role === "ADMIN";

  const barber = isAdmin
    ? null
    : await prisma.barber.findUnique({ where: { userId: session!.user.id } });

  const appointments = await prisma.appointment.findMany({
    where: barber ? { barberId: barber.id } : {},
    include: { client: true, service: true, barber: { include: { user: true } } },
    orderBy: { startTime: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Appointments</h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Service</th>
              {isAdmin && <th className="px-6 py-3">Barber</th>}
              <th className="px-6 py-3">When</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appointments.map((appt) => (
              <AppointmentRow
                key={appt.id}
                appointment={{
                  id: appt.id,
                  clientName: appt.client.name,
                  serviceName: appt.service.name,
                  barberName: appt.barber.user.name,
                  startTime: appt.startTime.toISOString(),
                  priceCents: appt.service.priceCents,
                  status: appt.status,
                }}
                showBarber={isAdmin}
                formattedPrice={formatPrice(appt.service.priceCents)}
              />
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted">
                  No appointments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
