import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { Container } from "@/components/ui/container";
import { ProductCard } from "@/features/catalog/components/product-card";
import { getCategoryLabel } from "@/features/catalog/lib/filters";
import { adviceGuides, getAdviceGuide } from "@/features/guides/data/advice-guides";
import { readSourceProducts } from "@/lib/server/config-store";

type AdvicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return adviceGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: AdvicePageProps) {
  const { slug } = await params;
  const guide = getAdviceGuide(slug);

  return {
    title: guide ? `${guide.title} | Conseils Ma Petite Lingerie` : "Conseils | Ma Petite Lingerie",
    description: guide?.summary ?? "Guide conseil Ma Petite Lingerie.",
  };
}

export default async function AdviceDetailPage({ params }: AdvicePageProps) {
  noStore();
  const { slug } = await params;
  const guide = getAdviceGuide(slug);

  if (!guide) {
    notFound();
  }

  const products = await readSourceProducts();
  const recommendedProducts = products
    .filter((product) => product.categorySlug === guide.heroCategory && product.image)
    .slice(0, 8);
  const heroImage = recommendedProducts[0]?.image ?? "/hero-slide-01-lingerie-custom.webp";
  const relatedGuides = adviceGuides.filter((item) => item.slug !== guide.slug).slice(0, 3);

  return (
    <Container>
      <article className="space-y-10 py-12 sm:py-16">
        <header className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white/90 shadow-xl shadow-rose-100/60">
          <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-6 p-7 sm:p-10 lg:p-12">
              <Link href="/conseils" className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)] hover:text-rose-600">
                Retour aux conseils
              </Link>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">{guide.eyebrow}</p>
                <h1 className="font-display mt-3 text-5xl leading-tight text-[var(--ink)]">{guide.title}</h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--muted)]">{guide.summary}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={guide.ctaHref}
                  className="rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] transition hover:bg-[var(--accent)]"
                >
                  {guide.ctaLabel}
                </Link>
                <Link
                  href={`/catalogue?categorie=${guide.heroCategory}`}
                  className="rounded-full border border-[var(--line)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Univers {getCategoryLabel(guide.heroCategory)}
                </Link>
              </div>
            </div>

            <div className="relative min-h-[320px]">
              <Image
                src={heroImage}
                alt={guide.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-[10px] uppercase tracking-[0.24em] opacity-90">Guide pratique</p>
                <p className="font-display mt-2 text-3xl">Des reperes simples, sans pression</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_0.42fr]">
          <div className="space-y-5">
            {guide.sections.map((section, index) => (
              <section key={section.title} className="rounded-3xl border border-[var(--line)] bg-white/90 p-7 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Etape {index + 1}</p>
                <h2 className="font-display mt-3 text-3xl text-[var(--ink)]">{section.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{section.body}</p>
              </section>
            ))}
          </div>

          <aside className="h-fit rounded-3xl border border-[var(--line)] bg-[var(--rose-powder)] p-7 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Checklist</p>
            <ul className="mt-5 space-y-3 text-sm text-[var(--ink)]">
              {guide.checklist.map((item) => (
                <li key={item} className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm shadow-rose-100">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-6 text-[var(--muted)]">
              Ces conseils restent informatifs. Pour une question medicale, une douleur ou un traitement, demande l&apos;avis d&apos;un professionnel qualifie.
            </p>
          </aside>
        </section>

        {recommendedProducts.length > 0 ? (
          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Pour aller plus loin</p>
                <h2 className="font-display text-4xl text-[var(--ink)]">Selection liee au guide</h2>
              </div>
              <Link
                href={guide.ctaHref}
                className="border-b-2 border-[var(--accent)] pb-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)] hover:border-rose-600 hover:text-rose-600"
              >
                Explorer la selection
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-5 rounded-3xl border border-[var(--line)] bg-white/90 p-7 sm:p-8">
          <h2 className="font-display text-3xl text-[var(--ink)]">Autres guides</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedGuides.map((item) => (
              <Link key={item.slug} href={`/conseils/${item.slug}`} className="rounded-2xl border border-[var(--line)] p-5 transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">{item.eyebrow}</p>
                <p className="font-display mt-2 text-2xl text-[var(--ink)]">{item.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </Container>
  );
}

