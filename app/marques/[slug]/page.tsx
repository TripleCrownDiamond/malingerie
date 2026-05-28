import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { Container } from "@/components/ui/container";
import { ProductCard } from "@/features/catalog/components/product-card";
import { getCategoryLabel } from "@/features/catalog/lib/filters";
import { buildBrandEntries, findBrandByKey } from "@/features/brands/lib/brands";
import { readSourceProducts } from "@/lib/server/config-store";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BrandPageProps) {
  const { slug } = await params;
  const products = await readSourceProducts();
  const brand = findBrandByKey(products, decodeURIComponent(slug));

  return {
    title: brand ? `${brand.name} | Ma Petite Lingerie` : "Marque | Ma Petite Lingerie",
    description: brand
      ? `Decouvre les produits ${brand.name} disponibles sur Ma Petite Lingerie.`
      : "Selection marque Ma Petite Lingerie.",
  };
}

export default async function BrandDetailPage({ params }: BrandPageProps) {
  noStore();
  const { slug } = await params;
  const products = await readSourceProducts();
  const brand = findBrandByKey(products, decodeURIComponent(slug));

  if (!brand) {
    notFound();
  }

  const categoryCounts = Array.from(
    brand.products.reduce((map, product) => {
      map.set(product.categorySlug, (map.get(product.categorySlug) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  const highlightedProducts = brand.products.slice(0, 12);
  const relatedBrands = buildBrandEntries(products)
    .filter((item) => item.key !== brand.key)
    .slice(0, 6);

  return (
    <Container>
      <section className="space-y-10 py-12 sm:py-16">
        <header className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white/90 shadow-xl shadow-rose-100/60">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-[320px]">
              <Image
                src={brand.image}
                alt={brand.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] opacity-90">Marque selectionnee</p>
                <h1 className="font-display mt-2 text-5xl leading-tight">{brand.name}</h1>
              </div>
            </div>

            <div className="space-y-7 p-7 sm:p-10 lg:p-12">
              <Link href="/marques" className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)] hover:text-rose-600">
                Retour aux marques
              </Link>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Catalogue marque</p>
                <h2 className="font-display mt-3 text-4xl text-[var(--ink)]">{brand.count} produits retrouves</h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                  Retrouve ici les pieces associees a {brand.name}, avec les categories principales, les produits les plus visibles et un acces rapide a la selection complete.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Produits</p>
                  <p className="font-display mt-2 text-3xl text-[var(--ink)]">{brand.count}</p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Univers</p>
                  <p className="font-display mt-2 text-3xl text-[var(--ink)]">{categoryCounts.length}</p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">A partir de</p>
                  <p className="font-display mt-2 text-3xl text-[var(--ink)]">{Math.min(...brand.products.map((product) => product.price)).toFixed(2)} EUR</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {categoryCounts.map(([categorySlug, count]) => (
                  <Link
                    key={categorySlug}
                    href={`/catalogue?categorie=${categorySlug}&q=${encodeURIComponent(brand.name)}`}
                    className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {getCategoryLabel(categorySlug)} ({count})
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Selection</p>
              <h2 className="font-display text-4xl text-[var(--ink)]">Produits {brand.name}</h2>
            </div>
            <Link
              href={`/catalogue?q=${encodeURIComponent(brand.name)}`}
              className="border-b-2 border-[var(--accent)] pb-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)] hover:border-rose-600 hover:text-rose-600"
            >
              Voir tous les produits
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {highlightedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {relatedBrands.length > 0 ? (
          <section className="space-y-5 rounded-3xl border border-[var(--line)] bg-white/85 p-6 sm:p-8">
            <h2 className="font-display text-3xl text-[var(--ink)]">Autres marques a explorer</h2>
            <div className="flex flex-wrap gap-3">
              {relatedBrands.map((item) => (
                <Link
                  key={item.key}
                  href={`/marques/${item.key}`}
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </Container>
  );
}
