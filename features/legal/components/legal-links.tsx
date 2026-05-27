import Link from "next/link";

import { legalPages } from "@/features/legal/data/legal-company";

type LegalLinksProps = {
  currentHref: string;
};

export function LegalLinks({ currentHref }: LegalLinksProps) {
  return (
    <nav aria-label="Navigation legale" className="flex flex-wrap gap-2">
      {legalPages.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
            currentHref === item.href
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
              : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}