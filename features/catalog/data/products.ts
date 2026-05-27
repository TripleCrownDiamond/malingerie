import { sourceProducts } from "@/features/source/data/source-data";
import type { Product } from "@/types/shop";

export const products: Product[] = sourceProducts;

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(categorySlug: string) {
  return products.filter((product) => product.categorySlug === categorySlug);
}
