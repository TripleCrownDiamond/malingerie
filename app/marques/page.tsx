import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";

import { Container } from "@/components/ui/container";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { ProductCard } from "@/features/catalog/components/product-card";
import { readSourceProducts } from "@/lib/server/config-store";
import type { Product } from "@/types/shop";

type MarquesPageProps = {
  searchParams: Promise<{ q?: string; marque?: string }>;
};

type BrandEntry = {
  name: string;
  key: string;
  count: number;
  image: string;
  products: Product[];
};

const genericTagKeys = new Set([
  "selection",
  "promotion",
  "promotions",
  "espace-plaisir",
  "plaisir",
  "lingerie",
  "bdsm",
  "bien-etre",
  "aphrodisiaques",
  "jeux-et-librairie",
]);

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function inferBrand(product: Product) {
  const specBrand = product.specifications?.find((item) => normalizeKey(item.label).includes("marque"))?.value;
  if (specBrand) {
    const cleaned = cleanText(specBrand);
    if (cleaned) {
      return cleaned;
    }
  }

  const categoryKey = normalizeKey(product.categorySlug);
  const subcategoryKey = normalizeKey(product.subcategoryLabel ?? product.subcategorySlug ?? "");

  const candidateTags = [product.tags[2], ...product.tags].filter(Boolean);

  for (const tag of candidateTags) {
    const cleaned = cleanText(tag);
    const key = normalizeKey(cleaned);

    if (!key || key.length < 2) continue;
    if (genericTagKeys.has(key)) continue;
    if (key === categoryKey || key === subcategoryKey) continue;

    return cleaned;
  }

  return undefined;
}

function buildBrandEntries(products: Product[]) {
  const map = new Map<string, BrandEntry>();

  for (const product of products) {
    const brand = inferBrand(product);
    if (!brand) {
      continue;
    }

    const key = normalizeKey(brand);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        name: brand,
        key,
        count: 1,
        image: product.image,
        products: [product],
      });
      continue;
    }

    existing.count += 1;
    if (existing.products.length < 20) {
      existing.products.push(product);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export default async function MarquesPage({ searchParams }: MarquesPageProps) {
  noStore();
  const params = await searchParams;
  const query = cleanText(params.q ?? "");
  const queryKey = normalizeKey(query);
  const selectedBrandKey = normalizeKey(params.marque ?? "");

  const products = await readSourceProducts();
  const allBrands = buildBrandEntries(products);
  const visibleBrands = queryKey ? allBrands.filter((brand) => normalizeKey(brand.name).includes(queryKey)) : allBrands;

  const selectedBrand = allBrands.find((brand) => brand.key === selectedBrandKey);
  const selectedProducts = (selectedBrand?.products ?? []).slice(0, 12);

  return (
    <Container>
      <section className="space-y-8 py-12 sm:py-16">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Marques</p>
          <h1 className="font-display text-4xl text-[var(--ink)] sm:text-5xl">Toutes les marques du catalogue</h1>
          <p className="max-w-3xl text-sm text-[var(--muted)] sm:text-base">
            Une page dediee a toutes les marques detectees dans les produits deja scrappes. Clique une marque pour voir sa selection ou lance une recherche.
          </p>
        </header>

        <div className="grid gap-4 rounded-3xl border border-[var(--line)] bg-white/75 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:p-6">
          <form action="/marques" className="flex w-full items-center gap-3">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Rechercher une marque..."
              className="w-full rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--ink)] outline-none ring-[var(--accent)]/25 transition focus:ring"
            />
            <FormSubmitButton
              idleLabel="Chercher"
              pendingLabel="Recherche..."
              className="rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
            />
          </form>

          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {visibleBrands.length} marques
          </p>

          <Link href="/catalogue" className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)] hover:text-rose-600">
            Voir tout le catalogue
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleBrands.map((brand) => (
            <article key={brand.key} className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/90">
              <Link href={`/marques?marque=${encodeURIComponent(brand.key)}`} className="group block">
                <div className="relative aspect-[5/4] overflow-hidden">
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(min-width: 1280px) 24vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[10px] uppercase tracking-[0.22em] opacity-90">{brand.count} produits</p>
                    <h2 className="font-display text-2xl leading-tight">{brand.name}</h2>
                  </div>
                </div>
              </Link>

              <div className="flex items-center justify-between gap-3 p-4">
                <Link
                  href={`/catalogue?q=${encodeURIComponent(brand.name)}`}
                  className="rounded-full border border-[var(--line)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Voir produits
                </Link>
                <Link
                  href={`/marques?marque=${encodeURIComponent(brand.key)}`}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] hover:text-rose-600"
                >
                  Details
                </Link>
              </div>
            </article>
          ))}
        </div>

        {visibleBrands.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-white p-8 text-center">
            <p className="font-display text-2xl text-[var(--ink)]">Aucune marque trouvee</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Essaie un autre terme de recherche.</p>
          </div>
        ) : null}

        {selectedBrand ? (
          <section className="space-y-6 pt-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Marque selectionnee</p>
                <h2 className="font-display text-4xl text-[var(--ink)]">{selectedBrand.name}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{selectedBrand.count} produits retrouves pour cette marque.</p>
              </div>
              <Link
                href={`/catalogue?q=${encodeURIComponent(selectedBrand.name)}`}
                className="border-b-2 border-[var(--accent)] pb-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)] hover:border-rose-600 hover:text-rose-600"
              >
                Voir la selection complete
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {selectedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </Container>
  );
}
