"use client";

import { useActionState, useState } from "react";
import { createBarber, type CreateBarberState } from "./actions";

const initialState: CreateBarberState = {};

export function AddBarberForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createBarber, initialState);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-6 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold-soft"
      >
        + Add Barber
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:max-w-md"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm text-muted">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-foreground outline-none focus:border-gold"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-foreground outline-none focus:border-gold"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-muted">
          Temporary password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-foreground outline-none focus:border-gold"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-sm text-muted">
          Bio (optional)
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={2}
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-foreground outline-none focus:border-gold"
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-400">
          Barber added — share their login and temporary password with them.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold-soft disabled:opacity-60"
        >
          {pending ? "Adding..." : "Add Barber"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:border-gold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
