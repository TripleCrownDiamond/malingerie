"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem, Product } from "@/types/shop";

type AddToCartPayload = {
  product: Product;
  size: string;
  color: string;
  quantity?: number;
};

type CartState = {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (payload: AddToCartPayload) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  itemCount: () => number;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      addItem: ({ product, size, color, quantity = 1 }) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.productId === product.id && item.size === size && item.color === color,
          );

          if (existing) {
            return {
              items: state.items.map((item) =>
                item === existing ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            };
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
                quantity,
                size,
                color,
              },
            ],
          };
        });
      },
      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.size === size && item.color === color),
          ),
        }));
      },
      updateQuantity: (productId, size, color, quantity) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (item) =>
                    !(item.productId === productId && item.size === size && item.color === color),
                )
              : state.items.map((item) =>
                  item.productId === productId && item.size === size && item.color === color
                    ? { ...item, quantity }
                    : item,
                ),
        }));
      },
      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: () => get().items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    }),
    {
      name: "ma-petite-lingerie-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);