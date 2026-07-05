import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function BarbersPage() {
  const barbers = await prisma.barber.findMany({
    where: { isActive: true },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <h1 className="font-display text-4xl text-foreground">Our Barbers</h1>
      <p className="mt-2 text-muted">
        Every barber on our team can handle the full menu — pick whoever you
        like, or whoever&apos;s open first.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className="flex flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center transition hover:border-gold"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-background">
              <span className="font-display text-2xl text-gold-soft">
                {barber.user.name.charAt(0)}
              </span>
            </div>
            <p className="font-display mt-4 text-lg text-foreground">
              {barber.user.name}
            </p>
            {barber.bio && (
              <p className="mt-2 text-sm text-muted">{barber.bio}</p>
            )}
            <Link
              href={`/book?barber=${barber.id}`}
              className="mt-5 rounded-full border border-border px-5 py-2 text-xs font-semibold text-foreground transition hover:border-gold"
            >
              Book with {barber.user.name.split(" ")[0]}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
