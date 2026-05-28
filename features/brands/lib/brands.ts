import type { Product } from "@/types/shop";

export type BrandEntry = {
  name: string;
  key: string;
  count: number;
  image: string;
  products: Product[];
};

const genericTagKeys = new Set([
  "selection",
  "promotion",
  "promotions",
  "espace-plaisir",
  "plaisir",
  "lingerie",
  "bdsm",
  "bien-etre",
  "aphrodisiaques",
  "jeux-et-librairie",
]);

export function normalizeBrandKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cleanBrandText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function inferBrand(product: Product) {
  const specBrand = product.specifications?.find((item) => normalizeBrandKey(item.label).includes("marque"))?.value;
  if (specBrand) {
    const cleaned = cleanBrandText(specBrand);
    if (cleaned) {
      return cleaned;
    }
  }

  const categoryKey = normalizeBrandKey(product.categorySlug);
  const subcategoryKey = normalizeBrandKey(product.subcategoryLabel ?? product.subcategorySlug ?? "");
  const candidateTags = [product.tags[2], ...product.tags].filter(Boolean);

  for (const tag of candidateTags) {
    const cleaned = cleanBrandText(tag);
    const key = normalizeBrandKey(cleaned);

    if (!key || key.length < 2) continue;
    if (genericTagKeys.has(key)) continue;
    if (key === categoryKey || key === subcategoryKey) continue;

    return cleaned;
  }

  return undefined;
}

export function buildBrandEntries(products: Product[]) {
  const map = new Map<string, BrandEntry>();

  for (const product of products) {
    const brand = inferBrand(product);
    if (!brand) {
      continue;
    }

    const key = normalizeBrandKey(brand);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        name: brand,
        key,
        count: 1,
        image: product.image,
        products: [product],
      });
      continue;
    }

    existing.count += 1;
    existing.products.push(product);
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function findBrandByKey(products: Product[], key: string) {
  const normalizedKey = normalizeBrandKey(key);
  return buildBrandEntries(products).find((brand) => brand.key === normalizedKey);
}
