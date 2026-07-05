import { prisma } from "@/lib/prisma";
import { BookingWizard } from "./booking-wizard";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;

  const [services, barbers] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.barber.findMany({
      where: { isActive: true },
      include: { user: true, services: true },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl text-foreground">
        Book Your Appointment
      </h1>
      <p className="mt-2 text-muted">
        Choose a service, your barber, and a time that works for you.
      </p>

      <BookingWizard
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          durationMin: s.durationMin,
          priceCents: s.priceCents,
        }))}
        barbers={barbers.map((b) => ({
          id: b.id,
          name: b.user.name,
          bio: b.bio,
          serviceIds: b.services.map((s) => s.id),
        }))}
        initialServiceId={service}
      />
    </div>
  );
}
