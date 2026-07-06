import { prisma } from "@/lib/prisma";
import { AddBarberForm } from "./add-barber-form";
import { BarberRow } from "./barber-row";

export default async function ManageBarbersPage() {
  const barbers = await prisma.barber.findMany({
    include: {
      user: true,
      services: true,
      _count: { select: { appointments: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-foreground">Manage Barbers</h1>
      <p className="mt-2 text-muted">
        Add new staff or remove ones who no longer work here.
      </p>

      <AddBarberForm />

      <h2 className="mt-10 font-display text-xl text-foreground">
        Current Barbers
      </h2>
      <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
        {barbers.length === 0 && (
          <p className="px-6 py-8 text-sm text-muted">No barbers yet.</p>
        )}
        {barbers.map((barber) => (
          <BarberRow
            key={barber.id}
            barber={{
              id: barber.id,
              name: barber.user.name,
              email: barber.user.email,
              isActive: barber.isActive,
              serviceCount: barber.services.length,
              appointmentCount: barber._count.appointments,
            }}
          />
        ))}
      </div>
    </div>
  );
}
