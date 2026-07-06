"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/format";
import { SHOP_TIME_ZONE, addDaysToDateStr, getTodayInZone, weekdayShort } from "@/lib/timezone";

type Service = {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
};

type Barber = {
  id: string;
  name: string;
  bio: string | null;
  serviceIds: string[];
};

const STEPS = ["Service", "Barber", "Date & Time", "Confirm"] as const;

// Dates offered for booking are always the shop's own calendar days — a
// customer browsing from another timezone must see the same list a
// customer standing in the shop would see, not their own device's "today".
function nextNDateStrs(n: number): string[] {
  const today = getTodayInZone();
  return Array.from({ length: n }, (_, i) => addDaysToDateStr(today, i));
}

export function BookingWizard({
  services,
  barbers,
  initialServiceId,
  initialBarberId,
}: {
  services: Service[];
  barbers: Barber[];
  initialServiceId?: string;
  initialBarberId?: string;
}) {
  const router = useRouter();
  const { status } = useSession();

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | undefined>(
    initialServiceId
  );
  const [barberId, setBarberId] = useState<string | undefined>(
    initialBarberId
  );
  const [selectedDateStr, setSelectedDateStr] = useState<string | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>();
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [slotTakenNotice, setSlotTakenNotice] = useState(false);

  const selectedSlotRef = useRef(selectedSlot);
  useEffect(() => {
    selectedSlotRef.current = selectedSlot;
  }, [selectedSlot]);

  // Recomputed periodically (not just once at mount) so a tab left open
  // across midnight drops yesterday off the list on its own, without
  // needing a page reload.
  const [dates, setDates] = useState<string[]>(() => nextNDateStrs(14));

  useEffect(() => {
    const interval = setInterval(() => {
      setDates((prev) => {
        const fresh = nextNDateStrs(14);
        return fresh[0] === prev[0] ? prev : fresh;
      });
    }, 5 * 60_000);
    return () => clearInterval(interval);
  }, []);

  const availableBarbers = useMemo(
    () => barbers.filter((b) => !serviceId || b.serviceIds.includes(serviceId)),
    [barbers, serviceId]
  );

  const service = services.find((s) => s.id === serviceId);
  const barber = barbers.find((b) => b.id === barberId);

  // Polled (not just fetched once) so a slot someone else just booked
  // disappears for everyone looking at this date, without a manual refresh.
  const fetchSlots = useCallback(
    async (dateStr: string, currentBarberId: string, currentServiceId: string) => {
      const res = await fetch(
        `/api/availability?barberId=${currentBarberId}&serviceId=${currentServiceId}&date=${dateStr}`
      );
      const data = await res.json();
      const freshSlots: string[] = data.slots ?? [];
      setSlots(freshSlots);

      if (selectedSlotRef.current && !freshSlots.includes(selectedSlotRef.current)) {
        setSelectedSlot(undefined);
        setSlotTakenNotice(true);
        setStep((s) => (s === 3 ? 2 : s));
      }
    },
    []
  );

  useEffect(() => {
    if (!barberId || !serviceId || !selectedDateStr) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting selection state for a new fetch triggered by dependency change
    setLoadingSlots(true);
    setSelectedSlot(undefined);
    setSlots([]);
    setSlotTakenNotice(false);

    fetchSlots(selectedDateStr, barberId, serviceId).finally(() => setLoadingSlots(false));

    const interval = setInterval(() => {
      fetchSlots(selectedDateStr, barberId, serviceId);
    }, 12_000);

    return () => clearInterval(interval);
  }, [barberId, serviceId, selectedDateStr, fetchSlots]);

  async function handleConfirm() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/book`);
      return;
    }
    if (!barberId || !serviceId || !selectedSlot) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barberId,
        serviceId,
        startTime: selectedSlot,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="mt-12 rounded-2xl border border-gold/40 bg-surface p-10 text-center">
        <h2 className="font-display text-2xl text-gold-soft">
          You&apos;re booked!
        </h2>
        <p className="mt-2 text-muted">
          {service?.name} with {barber?.name} on{" "}
          {selectedSlot &&
            new Date(selectedSlot).toLocaleString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZone: SHOP_TIME_ZONE,
            })}
          .
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-black hover:bg-gold-soft"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <ol className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-muted">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-full border px-4 py-1.5 ${
              i === step
                ? "border-gold text-gold-soft"
                : "border-border"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-8">
        {step === 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServiceId(s.id);
                  const presetBarberStillValid =
                    barberId && barbers.find((b) => b.id === barberId)?.serviceIds.includes(s.id);
                  if (!presetBarberStillValid) setBarberId(undefined);
                  setStep(presetBarberStillValid ? 2 : 1);
                }}
                className={`rounded-xl border p-5 text-left transition hover:border-gold ${
                  serviceId === s.id ? "border-gold" : "border-border"
                }`}
              >
                <p className="font-display text-lg text-foreground">{s.name}</p>
                <div className="mt-2 flex justify-between text-sm text-muted">
                  <span>{s.durationMin} min</span>
                  <span className="text-gold-soft">
                    {formatPrice(s.priceCents)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {availableBarbers.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setBarberId(b.id);
                  setStep(2);
                }}
                className={`rounded-xl border p-5 text-left transition hover:border-gold ${
                  barberId === b.id ? "border-gold" : "border-border"
                }`}
              >
                <p className="font-display text-lg text-foreground">{b.name}</p>
                {b.bio && <p className="mt-2 text-sm text-muted">{b.bio}</p>}
              </button>
            ))}
            {availableBarbers.length === 0 && (
              <p className="text-sm text-muted">
                No barbers currently offer this service.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex gap-2 overflow-x-auto pb-3">
              {dates.map((dateStr) => {
                const isSelected = selectedDateStr === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-2 text-sm transition hover:border-gold ${
                      isSelected ? "border-gold text-gold-soft" : "border-border"
                    }`}
                  >
                    <span className="text-xs text-muted">{weekdayShort(dateStr)}</span>
                    <span className="font-display text-base">
                      {Number(dateStr.slice(8, 10))}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              {slotTakenNotice && (
                <p className="mb-3 text-sm text-amber-400">
                  That time was just booked by someone else. Pick another.
                </p>
              )}
              {loadingSlots && (
                <p className="text-sm text-muted">Loading available times...</p>
              )}
              {!loadingSlots && selectedDateStr && slots.length === 0 && (
                <p className="text-sm text-muted">
                  No open times on this day. Try another date.
                </p>
              )}
              {!loadingSlots && slots.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setSlotTakenNotice(false);
                        setStep(3);
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm transition hover:border-gold ${
                        selectedSlot === slot ? "border-gold text-gold-soft" : "border-border"
                      }`}
                    >
                      {new Date(slot).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: SHOP_TIME_ZONE,
                      })}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && service && barber && selectedSlot && (
          <div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-muted">Service</dt>
                <dd className="text-foreground">{service.name}</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-muted">Barber</dt>
                <dd className="text-foreground">{barber.name}</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-muted">When</dt>
                <dd className="text-foreground">
                  {new Date(selectedSlot).toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: SHOP_TIME_ZONE,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Price</dt>
                <dd className="font-display text-gold-soft">
                  {formatPrice(service.priceCents)}
                </dd>
              </div>
            </dl>

            {status !== "authenticated" && (
              <p className="mt-4 text-sm text-muted">
                You&apos;ll need to sign in to confirm this booking.
              </p>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold-soft disabled:opacity-60"
            >
              {submitting
                ? "Booking..."
                : status === "authenticated"
                ? "Confirm Booking"
                : "Sign in to Confirm"}
            </button>
          </div>
        )}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="mt-4 text-sm text-muted hover:text-foreground"
        >
          &larr; Back
        </button>
      )}
    </div>
  );
}
