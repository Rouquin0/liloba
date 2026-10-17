"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/chat", label: "Apollos", icon: "💬" },
  { href: "/bible", label: "Bible", icon: "📖" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--surface)] md:hidden">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--muted)] hover:text-[var(--color-primary)]"
              }`}
            >
              <span className="text-xl" aria-hidden="true">
                {item.icon}
              </span>
              <span className={isActive ? "font-semibold" : ""}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] md:flex md:flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4">
        <span className="text-2xl" aria-hidden="true">
          📖
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[var(--color-primary)]">
            LILOBA
          </span>
          <span className="text-[10px] text-[var(--muted)]">
            La Parole, éclairée
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-[var(--color-accent)] font-semibold text-white"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <span className="text-lg" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
