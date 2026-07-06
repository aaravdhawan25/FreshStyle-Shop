"use client";

import { useEffect, useState } from "react";

type Remaining = { days: number; hours: number; minutes: number } | null;

function getRemaining(targetIso: string): Remaining {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
  };
}

export function Countdown({ targetIso }: { targetIso: string }) {
  // Starts null so server and client render identically on hydration;
  // the real value is filled in after mount, then ticks every 30s.
  const [remaining, setRemaining] = useState<Remaining>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ticking clock: must paint the real value right after mount instead of waiting for the first interval tick
    setRemaining(getRemaining(targetIso));
    const interval = setInterval(() => setRemaining(getRemaining(targetIso)), 30_000);
    return () => clearInterval(interval);
  }, [targetIso]);

  if (!remaining) {
    return <span className="font-display text-2xl text-gold-soft">&mdash;</span>;
  }

  return (
    <span className="font-display text-2xl text-gold-soft">
      {remaining.days > 0 && `${remaining.days}d `}
      {remaining.hours}h {remaining.minutes}m
    </span>
  );
}
