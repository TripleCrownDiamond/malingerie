import { categories } from "@/features/catalog/data/categories";
import type { Product } from "@/types/shop";

export function searchProducts(products: Product[], search = "", category = "all", subcategory = "all") {
  const searchTerm = search.trim().toLowerCase();

  return products.filter((product) => {
    const inCategory = category === "all" ? true : product.categorySlug === category;
    const inSubcategory = subcategory === "all" ? true : product.subcategorySlug === subcategory;

    if (!inCategory || !inSubcategory) {
      return false;
    }

    if (!searchTerm) {
      return true;
    }

    return [product.name, product.shortDescription, ...product.tags]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm);
  });
}

export function getCategoryLabel(categorySlug: string) {
  return categories.find((category) => category.slug === categorySlug)?.name ?? "Collection";
}