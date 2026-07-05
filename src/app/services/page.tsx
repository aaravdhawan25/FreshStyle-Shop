import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { priceCents: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-20">
      <h1 className="font-display text-4xl text-foreground">Our Services</h1>
      <p className="mt-2 text-muted">
        Transparent pricing, no surprises at the chair.
      </p>

      <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-surface">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between gap-6 px-6 py-6"
          >
            <div>
              <h3 className="font-display text-lg text-foreground">
                {service.name}
              </h3>
              <p className="mt-1 text-sm text-muted">{service.description}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted">
                {service.durationMin} minutes
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className="font-display text-xl text-gold-soft">
                {formatPrice(service.priceCents)}
              </span>
              <Link
                href={`/book?service=${service.id}`}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:border-gold"
              >
                Book
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
