import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-20">
      <h1 className="font-display text-3xl text-foreground">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-muted">
        Book faster and track your appointment history.
      </p>

      <RegisterForm />

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:text-gold-soft">
          Sign in
        </Link>
      </p>
    </div>
  );
}
