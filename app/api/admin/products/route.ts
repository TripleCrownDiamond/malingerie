import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequiredAdminUserId } from "@/lib/server/admin-auth";
import { readSourceProducts, writeSourceProducts } from "@/lib/server/config-store";
import type { Product } from "@/types/shop";

const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  categorySlug: z.string().min(2),
  subcategorySlug: z.string().optional(),
  subcategoryLabel: z.string().optional(),
  shortDescription: z.string().min(4),
  longDescription: z.string().min(8),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional(),
  tags: z.array(z.string()).default([]),
  image: z.string().url(),
  gallery: z.array(z.string().url()).default([]),
  sku: z.string().optional(),
  stock: z.coerce.number().int().nonnegative().default(20),
  colors: z.array(z.string()).default(["Unique"]),
  sizes: z.array(z.string()).default(["TU"]),
  specifications: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .default([]),
});

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function ensureUniqueSlug(baseSlug: string, existingSlugs: Set<string>) {
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let index = 2;
  while (existingSlugs.has(`${baseSlug}-${index}`)) {
    index += 1;
  }

  return `${baseSlug}-${index}`;
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function buildSearchIndex(product: Product) {
  return [
    product.name,
    product.slug,
    product.sku,
    product.categorySlug,
    product.subcategorySlug ?? "",
    product.subcategoryLabel ?? "",
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();
}

export async function GET(request: Request) {
  try {
    await getRequiredAdminUserId();
  } catch (error) {
    const code = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: "Acces admin requis" }, { status: code });
  }

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const category = (url.searchParams.get("category") ?? "all").trim().toLowerCase();

  const page = parsePositiveInt(url.searchParams.get("page"), 1);
  const limit = Math.min(100, parsePositiveInt(url.searchParams.get("limit"), 20));

  const products = await readSourceProducts();
  const sortedProducts = [...products].reverse();
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const averagePrice =
    products.length > 0
      ? products.reduce((sum, product) => sum + product.price, 0) / products.length
      : 0;

  const stats = {
    totalProducts: products.length,
    categoryCount: new Set(products.map((product) => product.categorySlug)).size,
    subcategoryCount: new Set(
      products
        .map((product) => product.subcategorySlug)
        .filter((subcategory): subcategory is string => Boolean(subcategory)),
    ).size,
    totalStock,
    averagePrice,
  };

  const filteredProducts = sortedProducts.filter((product) => {
    if (category !== "all" && product.categorySlug.toLowerCase() !== category) {
      return false;
    }

    if (!query) {
      return true;
    }

    return buildSearchIndex(product).includes(query);
  });

  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const paginatedProducts = filteredProducts.slice(start, start + limit);

  return NextResponse.json({
    ok: true,
    products: paginatedProducts,
    stats,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  });
}

export async function POST(request: Request) {
  try {
    await getRequiredAdminUserId();
  } catch (error) {
    const code = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: "Acces admin requis" }, { status: code });
  }

  try {
    const body = await request.json();
    const payload = createProductSchema.parse(body);

    const products = await readSourceProducts();

    const existingIds = new Set(products.map((product) => product.id));
    const existingSlugs = new Set(products.map((product) => product.slug));

    const baseSlug = toSlug(payload.slug?.trim() || payload.name);
    const finalSlug = ensureUniqueSlug(baseSlug, existingSlugs);

    let idCandidate = `admin-${finalSlug}`;
    let idIndex = 2;
    while (existingIds.has(idCandidate)) {
      idCandidate = `admin-${finalSlug}-${idIndex}`;
      idIndex += 1;
    }

    const now = Date.now();

    const product: Product = {
      id: idCandidate,
      name: payload.name.trim(),
      slug: finalSlug,
      categorySlug: payload.categorySlug.trim(),
      subcategorySlug: payload.subcategorySlug?.trim() || undefined,
      subcategoryLabel: payload.subcategoryLabel?.trim() || undefined,
      shortDescription: payload.shortDescription.trim(),
      longDescription: payload.longDescription.trim(),
      price: payload.price,
      compareAtPrice: payload.compareAtPrice,
      rating: 4.8,
      reviewCount: 0,
      tags: payload.tags,
      colors: payload.colors.length > 0 ? payload.colors : ["Unique"],
      sizes: payload.sizes.length > 0 ? payload.sizes : ["TU"],
      stock: payload.stock,
      sku: payload.sku?.trim() || `MPL-${now}`,
      image: payload.image,
      gallery: payload.gallery.length > 0 ? payload.gallery : [payload.image],
      specifications: payload.specifications,
    };

    products.push(product);
    await writeSourceProducts(products);

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Payload produit invalide",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: false, error: "Impossible d'ajouter le produit" }, { status: 500 });
  }
}
