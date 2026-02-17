"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  href: string;
  name: string;
  subtitle: string;
  assignedLabel?: string;
  date: string;
};

export default function ClientCard({ href, name, subtitle, assignedLabel, date }: Props) {
  return (
    <Link
      href={href}
      className="group flex cursor-pointer items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3.5 transition-all duration-200 hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[var(--fg)] truncate">{name}</p>
        <p className="text-sm text-[var(--fg-dim)] truncate">{subtitle}</p>
        {assignedLabel && (
          <p className="mt-0.5 text-xs text-[var(--fg-dim)]">Assigned to {assignedLabel}</p>
        )}
      </div>
      <div className="ml-3 flex shrink-0 items-center gap-2">
        <span className="text-sm text-[var(--fg-dim)]">{date}</span>
        <ChevronRight className="h-5 w-5 text-[var(--fg-dim)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
      </div>
    </Link>
  );
}
