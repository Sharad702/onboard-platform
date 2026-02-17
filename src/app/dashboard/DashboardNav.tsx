"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3 } from "lucide-react";

const allNavItems = [
  { href: "/dashboard", label: "Clients", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export default function DashboardNav({ canShowAnalytics = true }: { canShowAnalytics?: boolean }) {
  const pathname = usePathname();
  const navItems = canShowAnalytics ? allNavItems : allNavItems.filter((i) => i.href !== "/dashboard/analytics");

  return (
    <nav className="flex items-center gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href === "/dashboard" && (pathname === "/dashboard" || pathname.startsWith("/dashboard/clients") || pathname.startsWith("/dashboard/workspace"))) ||
          (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
              isActive
                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                : "text-[var(--fg-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--fg)]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
