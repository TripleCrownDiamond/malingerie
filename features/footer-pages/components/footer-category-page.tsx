import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { Container } from "@/components/ui/container";
import { ProductCard } from "@/features/catalog/components/product-card";
import { readSourceProducts } from "@/lib/server/config-store";

type FooterCategoryPageProps = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  guidance: readonly string[];
};

function labelFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function FooterCategoryPage({ slug, eyebrow, title, description, guidance }: FooterCategoryPageProps) {
  noStore();
  const products = await readSourceProducts();
  const categoryProducts = products.filter((product) => product.categorySlug === slug && product.image);
  const featured = categoryProducts.slice(0, 8);
  const heroProduct = categoryProducts[0];

  const subcategories = Array.from(
    categoryProducts.reduce((map, product) => {
      const key = product.subcategorySlug || "selection";
      const current = map.get(key) ?? {
        slug: key,
        label: product.subcategoryLabel || labelFromSlug(key),
        count: 0,
        image: product.image,
      };
      current.count += 1;
      map.set(key, current);
      return map;
    }, new Map<string, { slug: string; label: string; count: number; image: string }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <Container>
      <section className="space-y-10 py-12 sm:py-16">
        <header className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">{eyebrow}</p>
            <h1 className="font-display text-5xl leading-tight text-[var(--ink)] md:text-6xl">{title}</h1>
            <p className="max-w-3xl text-base leading-relaxed text-[var(--muted)]">{description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/catalogue?categorie=${slug}`} className="rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] transition hover:bg-[var(--accent)]">
                Voir tous les produits
              </Link>
              <Link href="/conseils" className="rounded-full border border-[var(--line)] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                Conseils et guides
              </Link>
            </div>
          </div>

          {heroProduct ? (
            <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-2xl shadow-rose-200/40">
              <Image src={heroProduct.image} alt={heroProduct.name} fill className="object-cover" sizes="(min-width: 1024px) 42vw, 100vw" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/80">Selection</p>
                <p className="mt-2 font-display text-3xl">{heroProduct.name}</p>
              </div>
            </div>
          ) : null}
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {guidance.map((item) => (
            <article key={item} className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 text-sm leading-relaxed text-[var(--muted)]">
              {item}
            </article>
          ))}
        </div>

        {subcategories.length > 0 ? (
          <section className="space-y-4">
            <h2 className="font-display text-3xl text-[var(--ink)]">Sous-categories populaires</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {subcategories.map((item) => (
                <Link key={item.slug} href={`/catalogue?categorie=${slug}&souscategorie=${item.slug}`} className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white transition hover:border-[var(--accent)]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={item.image} alt={item.label} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="18vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <p className="text-[10px] uppercase tracking-[0.18em] opacity-80">{item.count} produits</p>
                      <p className="text-sm font-semibold leading-tight">{item.label}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Apercu catalogue</p>
              <h2 className="font-display text-3xl text-[var(--ink)]">Produits selectionnes</h2>
            </div>
            <p className="text-sm text-[var(--muted)]">{categoryProducts.length} produits disponibles dans cet univers.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </section>
    </Container>
  );
}
