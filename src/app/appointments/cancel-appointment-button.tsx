"use client";

import { useActionState, useState } from "react";
import { cancelAppointment, type CancelState } from "./actions";
import { canCancel } from "@/lib/cancellation";

const initialState: CancelState = {};

export function CancelAppointmentButton({
  appointmentId,
  startTimeIso,
}: {
  appointmentId: string;
  startTimeIso: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(cancelAppointment, initialState);

  if (state.success) {
    return <p className="text-sm font-medium text-red-400">Cancelled</p>;
  }

  if (!canCancel(startTimeIso)) {
    return (
      <p className="text-xs text-muted">
        Cancellations must be made at least 3 hours in advance.
      </p>
    );
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-semibold text-red-400 transition hover:border-red-400"
      >
        Cancel Appointment
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <p className="text-xs text-muted">Cancel this appointment?</p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-400 disabled:opacity-60"
        >
          {pending ? "Cancelling..." : "Yes, Cancel"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:border-gold"
        >
          Never Mind
        </button>
      </div>
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
