type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <header className="space-y-3">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">{eyebrow}</p>
      <h2 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">{title}</h2>
      {description ? <p className="max-w-2xl text-sm text-[var(--muted)] sm:text-base">{description}</p> : null}
    </header>
  );
}
