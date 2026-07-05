export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-base text-gold-soft">FRESH STYLE BARBERSHOP</p>
        <p>123 Main Street, Your City &middot; (555) 010-2929</p>
        <p>&copy; {new Date().getFullYear()} Fresh Style Barbershop. All rights reserved.</p>
      </div>
    </footer>
  );
}
