import type { AppointmentStatus } from "@prisma/client";

// Ticks/crosses for at-a-glance schedule scanning: green = still on the
// books, red = didn't happen as planned (cancelled or a no-show).
export function StatusIcon({ status }: { status: AppointmentStatus }) {
  const isCancelledLike = status === "CANCELLED" || status === "NO_SHOW";

  if (isCancelledLike) {
    return (
      <span
        title={status === "NO_SHOW" ? "No-show" : "Cancelled"}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/15 text-sm font-bold text-red-400"
      >
        &#10005;
      </span>
    );
  }

  return (
    <span
      title="Scheduled"
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-400"
    >
      &#10003;
    </span>
  );
}
