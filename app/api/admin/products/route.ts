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

export async function GET() {
  try {
    await getRequiredAdminUserId();
  } catch (error) {
    const code = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: "Acces admin requis" }, { status: code });
  }

  const products = await readSourceProducts();
  return NextResponse.json({ ok: true, products: products.slice(-50).reverse() });
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