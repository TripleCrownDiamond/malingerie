"use client";

import Image from "next/image";
import Link from "next/link";

import { WishlistToggleButton } from "@/features/wishlist/components/wishlist-toggle-button";
import type { Product } from "@/types/shop";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-[var(--line)] bg-white/80 backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_20px_80px_rgba(34,23,27,0.12)]">
      <Link href={`/produit/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          />

          <div className="absolute right-3 top-3 z-10">
            <WishlistToggleButton product={product} />
          </div>

          {product.compareAtPrice ? (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--paper)]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink)]">
              -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
            </span>
          ) : null}
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">{product.tags[0] ?? "collection"}</p>
        <Link href={`/produit/${product.slug}`} className="block">
          <h3 className="font-display text-xl text-[var(--ink)] transition group-hover:text-[var(--accent)]">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-[var(--muted)]">{product.shortDescription}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[var(--ink)]">{product.price} EUR</span>
            {product.compareAtPrice ? (
              <span className="text-sm text-[var(--muted)] line-through">{product.compareAtPrice} EUR</span>
            ) : null}
          </div>
          <span className="text-xs text-[var(--muted)]">{product.rating.toFixed(1)} / 5</span>
        </div>
      </div>
    </article>
  );
}