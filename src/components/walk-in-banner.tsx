"use client";

import { useEffect, useState } from "react";

export function WalkInBanner() {
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/wait-time");
        const data = await res.json();
        if (!cancelled) setMinutes(data.minutes);
      } catch {
        // Keep the last known value on a transient network error.
      }
    }

    poll();
    const interval = setInterval(poll, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-gold px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-black sm:text-sm">
      <span>Walk-Ins Welcome</span>
      {minutes !== null && (
        <>
          <span className="opacity-50">&middot;</span>
          <span>
            {minutes === 0 ? "No wait right now" : `~${minutes} min wait`}
          </span>
        </>
      )}
    </div>
  );
}
