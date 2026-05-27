"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Product, WishlistItem } from "@/types/shop";

type WishlistState = {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: () => number;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          if (state.items.some((item) => item.productId === product.id)) {
            return state;
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                unitPrice: product.price,
                categorySlug: product.categorySlug,
                defaultSize: product.sizes[0] ?? "TU",
                defaultColor: product.colors[0] ?? "Unique",
              },
            ],
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      toggleItem: (product) => {
        const isSaved = get().items.some((item) => item.productId === product.id);
        if (isSaved) {
          get().removeItem(product.id);
          return;
        }

        get().addItem(product);
      },
      isInWishlist: (productId) => get().items.some((item) => item.productId === productId),
      clearWishlist: () => set({ items: [] }),
      itemCount: () => get().items.length,
    }),
    {
      name: "ma-petite-lingerie-wishlist",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);