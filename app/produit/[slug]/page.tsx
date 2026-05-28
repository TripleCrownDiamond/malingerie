import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { Container } from "@/components/ui/container";
import { ProductCard } from "@/features/catalog/components/product-card";
import { ProductMediaGallery } from "@/features/catalog/components/product-media-gallery";
import { readSourceProducts } from "@/lib/server/config-store";
import { getCategoryLabel } from "@/features/catalog/lib/filters";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { WishlistToggleButton } from "@/features/wishlist/components/wishlist-toggle-button";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function toParagraphs(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return [];
  }

  const parts = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [cleaned];
}

function formatPrice(value: number) {
  return `${value.toFixed(2)} EUR`;
}

export default async function ProductPage({ params }: ProductPageProps) {
  noStore();
  const { slug } = await params;
  const products = await readSourceProducts();
  const product = products.find((entry) => entry.slug === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((item) => item.categorySlug === product.categorySlug && item.id !== product.id)
    .slice(0, 4);

  const gallery = Array.from(new Set([product.image, ...product.gallery])).filter(Boolean).slice(0, 8);
  const descriptionParagraphs = toParagraphs(product.longDescription);

  const categoryLabel = getCategoryLabel(product.categorySlug);

  const keyPoints = [
    ...product.tags,
    `${categoryLabel} premium`,
    product.stock > 0 ? "Expedition rapide" : "Disponibilite sur reappro",
  ].slice(0, 6);

  const baseCharacteristics: Array<{ label: string; value: string }> = [
    { label: "SKU", value: product.sku },
    { label: "Categorie", value: categoryLabel },
    { label: "Sous-categorie", value: product.subcategoryLabel ?? "-" },
    { label: "Prix", value: formatPrice(product.price) },
    { label: "Prix public", value: product.compareAtPrice ? formatPrice(product.compareAtPrice) : "-" },
    { label: "Note moyenne", value: `${product.rating.toFixed(1)} / 5` },
    { label: "Nombre d'avis", value: `${product.reviewCount}` },
    { label: "Stock", value: product.stock > 0 ? `${product.stock} en stock` : "Rupture" },
    { label: "Coloris", value: product.colors.join(", ") },
    { label: "Tailles", value: product.sizes.join(", ") },
  ];

  const seenLabels = new Set(baseCharacteristics.map((row) => row.label.toLowerCase()));
  const extraCharacteristics = (product.specifications ?? [])
    .map((row) => ({
      label: row.label.trim(),
      value: row.value.trim(),
    }))
    .filter((row) => row.label && row.value)
    .filter((row) => {
      const key = row.label.toLowerCase();
      if (seenLabels.has(key)) {
        return false;
      }
      seenLabels.add(key);
      return true;
    });

  const characteristics: Array<{ label: string; value: string }> = [...baseCharacteristics, ...extraCharacteristics];

  return (
    <Container>
      <section className="grid gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr]">
        <ProductMediaGallery name={product.name} images={gallery} />

        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                {product.subcategoryLabel ? `${categoryLabel} - ${product.subcategoryLabel}` : categoryLabel}
              </p>
              <h1 className="font-display text-4xl leading-tight text-[var(--ink)] md:text-5xl">{product.name}</h1>
            </div>
            <WishlistToggleButton
              product={product}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)] transition hover:border-[var(--accent)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold text-[var(--ink)]">{formatPrice(product.price)}</span>
            {product.compareAtPrice ? (
              <span className="text-lg text-[var(--muted)] line-through">{formatPrice(product.compareAtPrice)}</span>
            ) : null}
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--ink)]">
              {product.stock > 0 ? `${product.stock} en stock` : "Rupture"}
            </span>
          </div>

          <AddToCartButton product={product} />

          <div className="rounded-2xl border border-[var(--line)] bg-white/90 p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Apercu rapide</h2>
            <ul className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
              {keyPoints.map((item, index) => (
                <li key={`${item}-${index}`} className="rounded-xl bg-[var(--accent-soft)]/35 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Link href="/catalogue" className="inline-block text-sm text-[var(--muted)] underline-offset-4 hover:underline">
            Retour au catalogue
          </Link>
        </div>
      </section>

      <section className="space-y-6 pb-12">
        <div className="rounded-2xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Description detaillee</h2>
          <div className="space-y-3 text-[15px] leading-relaxed text-[var(--muted)]">
            {descriptionParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Points forts</h2>
            <ul className="grid gap-2 text-sm text-[var(--muted)]">
              {keyPoints.map((item, index) => (
                <li key={`detail-${item}-${index}`} className="rounded-xl bg-[var(--accent-soft)]/35 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/95">
            <div className="border-b border-[var(--line)] bg-[var(--accent-soft)]/40 px-5 py-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Tableau de caracteristiques</h2>
            </div>
            <table className="w-full text-left text-sm text-[var(--muted)]">
              <tbody>
                {characteristics.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--line)] last:border-b-0">
                    <th className="w-[38%] bg-white px-5 py-3 font-semibold text-[var(--ink)]">{row.label}</th>
                    <td className="px-5 py-3">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="space-y-6 pb-16">
          <h2 className="font-display text-3xl text-[var(--ink)]">Tu aimeras aussi</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
