"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCartStore } from "@/features/cart/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import type { Product } from "@/types/shop";

function formatPrice(value: number) {
  return `${value.toFixed(2)} EUR`;
}

export function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);

  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"move" | "remove" | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  async function handleMoveToCart(productId: string) {
    if (busyProductId || isClearing) {
      return;
    }

    const item = items.find((entry) => entry.productId === productId);
    if (!item) {
      return;
    }

    setBusyProductId(productId);
    setBusyAction("move");

    try {
      const productForCart: Product = {
        id: item.productId,
        name: item.name,
        slug: item.slug,
        categorySlug: item.categorySlug,
        shortDescription: item.name,
        longDescription: item.name,
        price: item.unitPrice,
        rating: 5,
        reviewCount: 0,
        tags: ["wishlist"],
        colors: [item.defaultColor],
        sizes: [item.defaultSize],
        stock: 999,
        sku: `WISHLIST-${item.productId}`,
        image: item.image,
        gallery: [item.image],
      };

      addItem({
        product: productForCart,
        quantity: 1,
        size: item.defaultSize,
        color: item.defaultColor,
      });

      openDrawer();
      await new Promise((resolve) => setTimeout(resolve, 220));
    } finally {
      setBusyProductId(null);
      setBusyAction(null);
    }
  }

  async function handleRemove(productId: string) {
    if (busyProductId || isClearing) {
      return;
    }

    setBusyProductId(productId);
    setBusyAction("remove");

    try {
      removeItem(productId);
      await new Promise((resolve) => setTimeout(resolve, 180));
    } finally {
      setBusyProductId(null);
      setBusyAction(null);
    }
  }

  async function handleClearWishlist() {
    if (isClearing || busyProductId) {
      return;
    }

    setIsClearing(true);

    try {
      clearWishlist();
      await new Promise((resolve) => setTimeout(resolve, 200));
    } finally {
      setIsClearing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--line)] bg-white p-10 text-center">
        <h1 className="font-display text-4xl text-[var(--ink)]">Wishlist vide</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Ajoute des produits a tes favoris pour les retrouver facilement.</p>
        <Link
          href="/catalogue"
          className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)]"
        >
          Explorer le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>{items.length} produit(s) en favoris</span>
        <button
          type="button"
          onClick={handleClearWishlist}
          disabled={isClearing || Boolean(busyProductId)}
          className="font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isClearing ? "Vidage..." : "Vider la wishlist"}
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const isBusy = busyProductId === item.productId || isClearing;

          return (
            <article key={item.productId} className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/90">
              <Link href={`/produit/${item.slug}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw" />
                </div>
              </Link>

              <div className="space-y-3 p-4">
                <Link href={`/produit/${item.slug}`} className="block font-display text-2xl text-[var(--ink)]">
                  {item.name}
                </Link>
                <p className="text-sm font-semibold text-[var(--ink)]">{formatPrice(item.unitPrice)}</p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(item.productId)}
                    disabled={isBusy}
                    className="flex-1 rounded-full bg-[var(--ink)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {busyProductId === item.productId && busyAction === "move" ? "Ajout..." : "Ajouter au panier"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId)}
                    disabled={isBusy}
                    className="rounded-full border border-[var(--line)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {busyProductId === item.productId && busyAction === "remove" ? "Retrait..." : "Retirer"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
