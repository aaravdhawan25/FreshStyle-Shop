// All shop hours (Availability.startTime/endTime) are wall-clock times in
// the shop's own timezone, not the server's. Node runs in UTC on Vercel,
// so naive Date math (e.g. `new Date(...).setHours(10)`) silently computes
// 10:00 UTC instead of 10:00 America/New_York — shifting every slot by
// 4-5 hours. These helpers anchor shop-local wall-clock times to the
// correct UTC instant, DST-aware, without adding a date library.

export const SHOP_TIME_ZONE = "America/New_York";

// A specific calendar date (no time component) has the same day-of-week
// everywhere on Earth, so this doesn't need timezone conversion — just
// avoid parsing it in a way that depends on the runtime's local zone.
export function getDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

function getUtcOffset(dateStr: string, timeZone: string): string {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  });
  const parts = dtf.formatToParts(new Date(`${dateStr}T12:00:00Z`));
  const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+00:00";
  const match = offsetPart.match(/GMT([+-]\d{2}:\d{2})/);
  return match ? match[1] : "+00:00";
}

// Converts a wall-clock "HH:MM" on a given calendar date, in `timeZone`,
// to the Date representing the correct UTC instant.
export function zonedTimeToUtc(
  dateStr: string,
  timeStr: string,
  timeZone: string = SHOP_TIME_ZONE
): Date {
  const offset = getUtcOffset(dateStr, timeZone);
  return new Date(`${dateStr}T${timeStr}:00${offset}`);
}

// Renders a UTC instant as a "YYYY-MM-DD" calendar date in `timeZone` —
// e.g. for finding "today" in the shop's timezone from a server that may
// be running in UTC.
export function formatDateInZone(date: Date, timeZone: string = SHOP_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Midnight-to-midnight bounds for a calendar date in `timeZone`, as UTC instants.
export function zonedDayBounds(
  dateStr: string,
  timeZone: string = SHOP_TIME_ZONE
): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const nextStr = next.toISOString().slice(0, 10);

  return {
    start: zonedTimeToUtc(dateStr, "00:00", timeZone),
    end: zonedTimeToUtc(nextStr, "00:00", timeZone),
  };
}
