"use client";

import { useTransition } from "react";
import { removeBarber } from "./actions";

export function BarberRow({
  barber,
}: {
  barber: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    serviceCount: number;
    appointmentCount: number;
  };
}) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    const message =
      barber.appointmentCount > 0
        ? `Remove ${barber.name}? They have appointment history, so they'll be deactivated (hidden from new bookings) instead of deleted, to keep those records intact.`
        : `Remove ${barber.name}? This permanently deletes their account.`;

    if (!confirm(message)) return;

    startTransition(() => {
      removeBarber(barber.id);
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
      <div>
        <p className="text-foreground">
          {barber.name}
          {!barber.isActive && (
            <span className="ml-2 text-xs uppercase tracking-wide text-muted">
              Inactive
            </span>
          )}
        </p>
        <p className="text-xs text-muted">
          {barber.email} &middot; {barber.serviceCount} services &middot;{" "}
          {barber.appointmentCount} appointments
        </p>
      </div>
      <button
        onClick={handleRemove}
        disabled={isPending || !barber.isActive}
        className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-semibold text-red-400 transition hover:border-red-400 disabled:opacity-40"
      >
        {!barber.isActive ? "Deactivated" : isPending ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}
