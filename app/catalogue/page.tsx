import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { Container } from "@/components/ui/container";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/features/catalog/components/product-card";
import { categories } from "@/features/catalog/data/categories";
import { searchProducts } from "@/features/catalog/lib/filters";
import { readSourceProducts } from "@/lib/server/config-store";

type CataloguePageProps = {
  searchParams: Promise<{ categorie?: string; q?: string; page?: string; souscategorie?: string }>;
};

type SubcategoryCard = {
  slug: string;
  label: string;
  categorySlug: string;
  image: string;
  count: number;
};

const PRODUCTS_PER_PAGE = 24;

function asPositiveInt(raw?: string) {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function labelFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function CataloguePage({ searchParams }: CataloguePageProps) {
  noStore();
  const params = await searchParams;
  const products = await readSourceProducts();
  const category = params.categorie ?? "all";
  const search = params.q ?? "";
  const requestedSubcategory = params.souscategorie ?? "all";

  const searchedProducts = searchProducts(products, search, "all", "all");
  const totalFoundAcrossCatalogue = searchedProducts.length;

  const categoryCounts = new Map<string, number>();
  for (const entry of categories) {
    categoryCounts.set(
      entry.slug,
      searchedProducts.filter((product) => product.categorySlug === entry.slug).length,
    );
  }

  const productsForSubcategories = searchProducts(products, search, category, "all");

  const subcategoryMap = new Map<string, SubcategoryCard>();
  for (const product of productsForSubcategories) {
    if (!product.subcategorySlug) {
      continue;
    }

    const key = `${product.categorySlug}:${product.subcategorySlug}`;
    const existing = subcategoryMap.get(key);

    if (existing) {
      existing.count += 1;
      continue;
    }

    subcategoryMap.set(key, {
      slug: product.subcategorySlug,
      label: product.subcategoryLabel ?? labelFromSlug(product.subcategorySlug),
      categorySlug: product.categorySlug,
      image: product.image,
      count: 1,
    });
  }

  const subcategoryCards = Array.from(subcategoryMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, category === "all" ? 16 : 24);

  const effectiveSubcategory =
    requestedSubcategory === "all" || subcategoryCards.some((item) => item.slug === requestedSubcategory)
      ? requestedSubcategory
      : "all";

  const filteredProducts = searchProducts(products, search, category, effectiveSubcategory);
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(asPositiveInt(params.page), totalPages);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const pageStart = totalProducts === 0 ? 0 : startIndex + 1;
  const pageEnd = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);

  const selectedCategoryLabel =
    category === "all" ? "Toutes categories" : categories.find((entry) => entry.slug === category)?.name ?? "Categorie";

  const selectedSubcategoryLabel =
    effectiveSubcategory === "all"
      ? "Toutes sous-categories"
      : subcategoryCards.find((item) => item.slug === effectiveSubcategory)?.label ?? labelFromSlug(effectiveSubcategory);

  const buildCatalogueHref = ({
    nextCategory = category,
    nextSubcategory = effectiveSubcategory,
    nextSearch = search,
    nextPage = 1,
  }: {
    nextCategory?: string;
    nextSubcategory?: string;
    nextSearch?: string;
    nextPage?: number;
  }) => {
    const query = new URLSearchParams();

    if (nextCategory && nextCategory !== "all") {
      query.set("categorie", nextCategory);
    }

    if (nextSubcategory && nextSubcategory !== "all") {
      query.set("souscategorie", nextSubcategory);
    }

    if (nextSearch.trim()) {
      query.set("q", nextSearch.trim());
    }

    if (nextPage > 1) {
      query.set("page", `${nextPage}`);
    }

    const queryString = query.toString();
    return queryString ? `/catalogue?${queryString}` : "/catalogue";
  };

  const pageNumbers = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index,
  ).filter((value, index, values) => value <= totalPages && values.indexOf(value) === index);

  return (
    <Container>
      <section className="space-y-7 py-12 sm:py-16">
        <SectionHeading
          eyebrow="Catalogue"
          title="Toutes les collections"
          description="Navigation enrichie avec sous-categories visuelles, recherche rapide et pagination pour parcourir facilement tout le catalogue."
        />

        <div className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-3 text-sm text-[var(--muted)]">
          <span className="font-semibold text-[var(--ink)]">{totalProducts} produits trouves</span>
          <span> - {selectedCategoryLabel}</span>
          <span> - {selectedSubcategoryLabel}</span>
          {search.trim() ? <span> - recherche: &quot;{search.trim()}&quot;</span> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildCatalogueHref({ nextCategory: "all", nextSubcategory: "all", nextPage: 1 })}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
              category === "all"
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
            }`}
          >
            Tout ({totalFoundAcrossCatalogue})
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              href={buildCatalogueHref({ nextCategory: item.slug, nextSubcategory: "all", nextPage: 1 })}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                category === item.slug
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                  : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
              }`}
            >
              {item.name} ({categoryCounts.get(item.slug) ?? 0})
            </Link>
          ))}
        </div>

        {subcategoryCards.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Sous-categories</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              <Link
                href={buildCatalogueHref({ nextSubcategory: "all", nextPage: 1 })}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  effectiveSubcategory === "all"
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                    : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
                }`}
              >
                Toutes les sous-categories ({productsForSubcategories.length})
              </Link>
              {subcategoryCards.map((item) => (
                <Link
                  key={`${item.categorySlug}-${item.slug}`}
                  href={buildCatalogueHref({ nextCategory: item.categorySlug, nextSubcategory: item.slug, nextPage: 1 })}
                  className={`group overflow-hidden rounded-2xl border transition ${
                    effectiveSubcategory === item.slug
                      ? "border-[var(--accent)] shadow-[0_8px_30px_rgba(230,46,116,0.18)]"
                      : "border-[var(--line)] hover:border-[var(--accent)]"
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={item.image} alt={item.label} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="20vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <p className="text-[11px] uppercase tracking-[0.2em] opacity-90">{item.count} produits</p>
                      <p className="text-sm font-semibold leading-tight">{item.label}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <form action="/catalogue" className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="categorie" value={category === "all" ? "" : category} />
          <input type="hidden" name="souscategorie" value={effectiveSubcategory === "all" ? "" : effectiveSubcategory} />
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Rechercher une piece, un style, un tag..."
            className="w-full max-w-xl rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--ink)] outline-none ring-[var(--accent)]/25 transition focus:ring"
          />
          <FormSubmitButton
            idleLabel="Rechercher"
            pendingLabel="Recherche..."
            className="rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
          />
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span>
            Affichage {pageStart}-{pageEnd} sur {totalProducts}
          </span>
          <span>
            Page {currentPage}/{totalPages}
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-white p-8 text-center">
            <p className="font-display text-2xl text-[var(--ink)]">Aucun produit trouve</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Essaie un autre mot-cle ou retire un filtre.</p>
          </div>
        ) : null}

        {totalPages > 1 ? (
          <nav className="flex flex-wrap items-center justify-center gap-2 pt-2" aria-label="Pagination catalogue">
            {currentPage > 1 ? (
              <Link
                href={buildCatalogueHref({ nextPage: currentPage - 1 })}
                className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
              >
                Precedent
              </Link>
            ) : (
              <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]/40">
                Precedent
              </span>
            )}

            {pageNumbers.map((pageNumber) => (
              <Link
                key={pageNumber}
                href={buildCatalogueHref({ nextPage: pageNumber })}
                className={`h-9 w-9 rounded-full border text-center text-sm leading-9 transition ${
                  pageNumber === currentPage
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
                }`}
              >
                {pageNumber}
              </Link>
            ))}

            {currentPage < totalPages ? (
              <Link
                href={buildCatalogueHref({ nextPage: currentPage + 1 })}
                className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
              >
                Suivant
              </Link>
            ) : (
              <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]/40">
                Suivant
              </span>
            )}
          </nav>
        ) : null}
      </section>
    </Container>
  );
}

