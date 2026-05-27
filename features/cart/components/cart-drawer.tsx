"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { useCartStore } from "@/features/cart/store/cart-store";

function formatPrice(value: number) {
  return `${value.toFixed(2)} EUR`;
}

function getItemKey(productId: string, size: string, color: string) {
  return `${productId}-${size}-${color}`;
}

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.subtotal());

  const [busyItemKey, setBusyItemKey] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen]);

  async function mutateItem(key: string, updater: () => void) {
    if (busyItemKey || isClearing) {
      return;
    }

    setBusyItemKey(key);

    try {
      updater();
      await new Promise((resolve) => setTimeout(resolve, 180));
    } finally {
      setBusyItemKey(null);
    }
  }

  async function handleClearCart() {
    if (isClearing || busyItemKey) {
      return;
    }

    setIsClearing(true);

    try {
      clearCart();
      await new Promise((resolve) => setTimeout(resolve, 220));
    } finally {
      setIsClearing(false);
    }
  }

  if (!isDrawerOpen) {
    return null;
  }

  const shipping = subtotal >= 120 ? 0 : 7.9;
  const total = subtotal + shipping;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Fermer le panier"
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/45"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[var(--line)] bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Votre panier</p>
            <h2 className="font-display text-3xl text-[var(--ink)]">Selection</h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Fermer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] transition hover:border-[var(--accent)]"
          >
            <X size={18} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
            <p className="font-display text-3xl text-[var(--ink)]">Panier vide</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Ajoute des produits premium pour lancer ton checkout.</p>
            <Link
              href="/catalogue"
              onClick={closeDrawer}
              className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)]"
            >
              Explorer le catalogue
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => {
                const itemKey = getItemKey(item.productId, item.size, item.color);
                const isBusyItem = busyItemKey === itemKey || isClearing;

                return (
                  <article
                    key={itemKey}
                    className="grid grid-cols-[76px_1fr] gap-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)]/70 p-3"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="76px" />
                    </div>

                    <div className="space-y-2">
                      <Link
                        href={`/produit/${item.slug}`}
                        onClick={closeDrawer}
                        className="line-clamp-2 text-sm font-semibold text-[var(--ink)]"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-[var(--muted)]">
                        {item.color} - {item.size}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => mutateItem(itemKey, () => updateQuantity(item.productId, item.size, item.color, item.quantity - 1))}
                            disabled={isBusyItem}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-xs disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            -
                          </button>
                          <span className="min-w-6 text-center text-xs text-[var(--ink)]">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => mutateItem(itemKey, () => updateQuantity(item.productId, item.size, item.color, item.quantity + 1))}
                            disabled={isBusyItem}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-xs disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => mutateItem(itemKey, () => removeItem(item.productId, item.size, item.color))}
                          disabled={isBusyItem}
                          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {busyItemKey === itemKey ? "Retrait..." : "Retirer"}
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-[var(--ink)]">{formatPrice(item.unitPrice * item.quantity)}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <footer className="space-y-4 border-t border-[var(--line)] bg-white px-5 py-5">
              <div className="space-y-2 text-sm text-[var(--muted)]">
                <div className="flex items-center justify-between">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Livraison</span>
                  <span>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--line)] pt-2 font-semibold text-[var(--ink)]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/panier"
                  onClick={closeDrawer}
                  className="flex-1 rounded-full bg-[var(--ink)] px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)]"
                >
                  Checkout
                </Link>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-full border border-[var(--line)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]"
                >
                  Continuer
                </button>
              </div>

              <button
                type="button"
                onClick={handleClearCart}
                disabled={isClearing || Boolean(busyItemKey)}
                className="w-full text-[10px] font-semibold uppercase tracking-[0.2em] text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isClearing ? "Vidage..." : "Vider le panier"}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
