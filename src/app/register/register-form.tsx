"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    registerUser,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      const form = document.getElementById(
        "register-form"
      ) as HTMLFormElement | null;
      const email = form?.elements.namedItem("email") as HTMLInputElement | null;
      const password = form?.elements.namedItem(
        "password"
      ) as HTMLInputElement | null;

      if (email && password) {
        signIn("credentials", {
          email: email.value,
          password: password.value,
          redirect: false,
        }).then(() => router.push("/book"));
      }
    }
  }, [state.success, router]);

  return (
    <form id="register-form" action={formAction} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm text-muted">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground outline-none focus:border-gold"
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
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground outline-none focus:border-gold"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground outline-none focus:border-gold"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold-soft disabled:opacity-60"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
