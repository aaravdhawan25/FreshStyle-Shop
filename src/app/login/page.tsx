import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-20">
      <h1 className="font-display text-3xl text-foreground">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in to book or manage your appointments.
      </p>

      <LoginForm />

      <p className="mt-8 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="text-gold hover:text-gold-soft">
          Create an account
        </Link>
      </p>
    </div>
  );
}
