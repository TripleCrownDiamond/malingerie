"use client";

import { useMemo, useState } from "react";

import { useCartStore } from "@/features/cart/store/cart-store";
import type { Product } from "@/types/shop";

type AddToCartButtonProps = {
  product: Product;
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isOutOfStock = useMemo(() => product.stock <= 0, [product.stock]);

  async function handleAddToCart() {
    if (isOutOfStock || isAdding) {
      return;
    }

    setIsAdding(true);
    addItem({ product, size, color, quantity: 1 });
    openDrawer();

    await new Promise((resolve) => setTimeout(resolve, 250));

    setAdded(true);
    setIsAdding(false);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/80 p-4 backdrop-blur">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Taille</p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSize(option)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                size === option
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                  : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Couleur</p>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setColor(option)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                color === option
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                  : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={isOutOfStock || isAdding}
        onClick={handleAddToCart}
        className="w-full rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isOutOfStock ? "Rupture" : isAdding ? "Ajout..." : added ? "Ajoute" : "Ajouter au panier"}
      </button>
    </div>
  );
}