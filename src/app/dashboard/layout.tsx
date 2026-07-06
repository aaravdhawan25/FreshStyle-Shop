import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/appointments", label: "Appointments" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-6 py-12">
      <aside className="hidden w-56 shrink-0 sm:block">
        <p className="mb-4 text-xs uppercase tracking-widest text-muted">
          Admin Dashboard
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition hover:bg-surface hover:text-gold-soft"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
