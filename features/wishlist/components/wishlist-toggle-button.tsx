"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import type { Product } from "@/types/shop";

type WishlistToggleButtonProps = {
  product: Product;
  className?: string;
};

export function WishlistToggleButton({ product, className }: WishlistToggleButtonProps) {
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const [isToggling, setIsToggling] = useState(false);

  async function handleToggle() {
    if (isToggling) {
      return;
    }

    setIsToggling(true);

    try {
      toggleItem(product);
      await new Promise((resolve) => setTimeout(resolve, 160));
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isToggling}
      aria-busy={isToggling}
      aria-label={isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={
        className ??
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white/90 text-[var(--ink)] transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
      }
    >
      <Heart size={16} className={isInWishlist ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--ink)]"} />
    </button>
  );
}
