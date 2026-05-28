import Link from "next/link";

import { Container } from "@/components/ui/container";

type InfoPageSection = {
  title: string;
  body: string;
};

type FooterInfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: readonly InfoPageSection[];
  ctaHref?: string;
  ctaLabel?: string;
};

export function FooterInfoPage({ eyebrow, title, description, sections, ctaHref, ctaLabel }: FooterInfoPageProps) {
  return (
    <Container>
      <section className="space-y-8 py-12 sm:py-16">
        <header className="max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">{eyebrow}</p>
          <h1 className="font-display text-5xl leading-tight text-[var(--ink)] md:text-6xl">{title}</h1>
          <p className="max-w-3xl text-base leading-relaxed text-[var(--muted)]">{description}</p>
          {ctaHref && ctaLabel ? (
            <Link href={ctaHref} className="inline-flex rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] transition hover:bg-[var(--accent)]">
              {ctaLabel}
            </Link>
          ) : null}
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-[var(--line)] bg-white/90 p-6 shadow-sm shadow-rose-100/60">
              <h2 className="font-display text-3xl text-[var(--ink)]">{section.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </Container>
  );
}
