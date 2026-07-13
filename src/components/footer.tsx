import Image from "next/image";
import { BUSINESS, HOURS } from "@/lib/business";

const today = () => new Date().getDay();

export function Footer() {
  const todayIndex = today();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo-mark.png"
              alt="Avex Barber Lounge logo"
              width={36}
              height={36}
              className="rounded-full"
            />
            <p className="font-display text-lg text-gold-soft">{BUSINESS.name}</p>
          </div>
          <p className="mt-2 text-sm text-muted">
            <a href={BUSINESS.mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-gold-soft">
              {BUSINESS.address}
            </a>
          </p>
          <p className="mt-1 text-sm text-muted">
            <a href={BUSINESS.phoneHref} className="hover:text-gold-soft">
              {BUSINESS.phone}
            </a>
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Hours</p>
          <ul className="mt-2 space-y-1 text-sm">
            {HOURS.map((h, i) => (
              <li
                key={h.day}
                className={`flex justify-between gap-6 ${
                  i === todayIndex ? "text-gold-soft" : "text-muted"
                }`}
              >
                <span>{h.day}</span>
                <span>{h.hours}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-end text-sm text-muted sm:items-end sm:text-right">
          <p>
            &copy; {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
