import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "BARBER") {
    redirect("/login?callbackUrl=/portal");
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">{children}</div>
  );
}
