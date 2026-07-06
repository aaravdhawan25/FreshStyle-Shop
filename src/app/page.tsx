import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { BUSINESS, HOURS } from "@/lib/business";
import { ScrollHero } from "@/components/hero/scroll-hero";

export default async function Home() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { priceCents: "asc" },
    take: 4,
  });

  return (
    <div className="flex flex-col">
      <ScrollHero />

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-3xl text-foreground">
            Popular Services
          </h2>
          <Link href="/services" className="text-sm text-gold hover:text-gold-soft">
            See all &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-border bg-surface p-6 transition hover:border-gold"
            >
              <h3 className="font-display text-xl text-foreground">
                {service.name}
              </h3>
              <p className="mt-2 text-sm text-muted">{service.description}</p>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="text-muted">{service.durationMin} min</span>
                <span className="font-semibold text-gold-soft">
                  {formatPrice(service.priceCents)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="font-display text-3xl text-foreground">
            Ready for your next appointment?
          </h2>
          <p className="max-w-md text-muted">
            Pick your barber, your service, and your time. We&apos;ll handle
            the rest.
          </p>
          <Link
            href="/book"
            className="mt-4 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-black transition hover:bg-gold-soft"
          >
            Book Now
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-10 rounded-2xl border border-border bg-surface p-8 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl text-foreground">Visit Us</h2>
            <p className="mt-3 text-muted">
              <a
                href={BUSINESS.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-soft"
              >
                {BUSINESS.address}
              </a>
            </p>
            <p className="mt-1 text-muted">
              <a href={BUSINESS.phoneHref} className="hover:text-gold-soft">
                {BUSINESS.phone}
              </a>
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-foreground">Hours</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {HOURS.map((h) => (
                <li key={h.day} className="flex justify-between gap-6 text-muted">
                  <span>{h.day}</span>
                  <span>{h.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
