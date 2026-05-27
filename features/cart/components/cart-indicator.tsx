"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCartStore } from "@/features/cart/store/cart-store";

export function CartIndicator() {
  const count = useCartStore((state) => state.itemCount());

  return (
    <Link
      href="/panier"
      className="relative inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--ink)] backdrop-blur transition hover:border-[var(--accent)]"
    >
      <ShoppingBag size={16} />
      Panier
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ink)] px-1 text-[10px] text-[var(--paper)]">
        {count}
      </span>
    </Link>
  );
}
