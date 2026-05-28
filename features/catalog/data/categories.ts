import { sourceCategories } from "@/features/source/data/source-data";
import type { ProductCategory } from "@/types/shop";

export const categories: ProductCategory[] = sourceCategories.filter((category) => category.slug !== "promotions");
