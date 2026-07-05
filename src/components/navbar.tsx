"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/book", label: "Book Now" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "BARBER";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl tracking-wide text-gold-soft">
            FRESH STYLE
          </span>
          <span className="text-xs uppercase tracking-[0.3em] text-muted">
            Barbershop
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition hover:text-gold-soft"
            >
              {link.label}
            </Link>
          ))}
          {isStaff && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-foreground/80 transition hover:text-gold-soft"
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {status === "authenticated" ? (
            <>
              <span className="text-sm text-muted">
                {session.user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-gold"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/80 transition hover:text-gold-soft"
              >
                Sign in
              </Link>
              <Link
                href="/book"
                className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black transition hover:bg-gold-soft"
              >
                Book Now
              </Link>
            </>
          )}
        </div>

        <button
          className="text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-foreground/80"
              >
                {link.label}
              </Link>
            ))}
            {isStaff && (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground/80">
                Dashboard
              </Link>
            )}
            {status === "authenticated" ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-left text-sm font-medium text-foreground/80"
              >
                Sign out
              </button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground/80">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
