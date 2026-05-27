#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_HOST = "https://www.espaceplaisir.fr";
const FALLBACK_IMAGE = "/hero-slide-01-lingerie.webp";

const CATEGORY_DETAILS = {
  promotions: {
    name: "Promotions",
    description: "Offres en cours et selections a prix doux issues du catalogue source.",
  },
  sextoys: {
    name: "Sextoys",
    description: "Selections de produits intimes inspires du catalogue source.",
  },
  lingerie: {
    name: "Lingerie",
    description: "Pieces lingerie et nightwear issues des univers references.",
  },
  bdsm: {
    name: "BDSM",
    description: "Accessoires et univers BDSM inspires des rayons source.",
  },
  "bien-etre": {
    name: "Bien-etre",
    description: "Produits de bien-etre intime et routines sensorielles.",
  },
  aphrodisiaques: {
    name: "Aphrodisiaques",
    description: "Complements et produits de stimulation du desir.",
  },
  "jeux-et-librairie": {
    name: "Jeux et librairie",
    description: "Jeux coquins, coffrets et lectures de decouverte.",
  },
  marques: {
    name: "Marques",
    description: "Selection multi-marques et references populaires du source.",
  },
  conseils: {
    name: "Conseils",
    description: "Guides et contenus d'accompagnement pour bien choisir.",
  },
};

const MENU_SLUG_FROM_LABEL = {
  promotions: "promotions",
  sextoys: "sextoys",
  lingerie: "lingerie",
  bdsm: "bdsm",
  "bien-etre": "bien-etre",
  aphrodisiaques: "aphrodisiaques",
  jeux: "jeux-et-librairie",
  "jeux-et-librairie": "jeux-et-librairie",
  marques: "marques",
  conseils: "conseils",
};

const CATEGORY_SLUG_FROM_SOURCE = {
  sextoys: "sextoys",
  lingerie: "lingerie",
  bdsm: "bdsm",
  "bien-etre": "bien-etre",
  aphrodisiaques: "aphrodisiaques",
  "jeux et librairie": "jeux-et-librairie",
  jeux: "jeux-et-librairie",
};

function decodeHtmlEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)));
}

function repairMojibake(value) {
  if (!/[ÃÂ]/.test(value)) {
    return value;
  }

  return Buffer.from(value, "latin1").toString("utf8");
}

function cleanText(value) {
  return repairMojibake(
    decodeHtmlEntities(value)
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function normalizeText(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeDeep(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDeep(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, sanitizeDeep(nested)]));
  }

  if (typeof value === "string") {
    return repairMojibake(value);
  }

  return value;
}

function slugFromSourcePath(url) {
  try {
    const parsed = new URL(url, SOURCE_HOST);
    const section = parsed.pathname.replace(/^\/+|\/+$/g, "");
    const cleaned = section.replace(/^\d+-/, "");
    return normalizeText(cleaned);
  } catch {
    return normalizeText(url);
  }
}

function toAbsoluteUrl(url) {
  const decoded = decodeHtmlEntities(url).trim();

  if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
    return decoded;
  }

  if (decoded.startsWith("//")) {
    return `https:${decoded}`;
  }

  if (decoded.startsWith("/")) {
    return `${SOURCE_HOST}${decoded}`;
  }

  return `${SOURCE_HOST}/${decoded}`;
}

function toShopHref(slug) {
  if (slug === "conseils") {
    return "/#conseils";
  }

  if (slug === "promotions") {
    return "/catalogue?categorie=promotions";
  }

  return `/catalogue?categorie=${slug}`;
}

function inferMenuSlug(label, sourceUrl) {
  const normalizedLabel = normalizeText(label);
  if (MENU_SLUG_FROM_LABEL[normalizedLabel]) {
    return MENU_SLUG_FROM_LABEL[normalizedLabel];
  }

  const pathSlug = slugFromSourcePath(sourceUrl);
  if (MENU_SLUG_FROM_LABEL[pathSlug]) {
    return MENU_SLUG_FROM_LABEL[pathSlug];
  }

  return pathSlug;
}

function inferCategorySlug(itemCategory, itemCategory2) {
  const candidates = [itemCategory, itemCategory2]
    .map((value) => normalizeText(value ?? ""))
    .filter(Boolean);

  for (const candidate of candidates) {
    if (CATEGORY_SLUG_FROM_SOURCE[candidate]) {
      return CATEGORY_SLUG_FROM_SOURCE[candidate];
    }
  }

  for (const candidate of candidates) {
    if (candidate.includes("lingerie")) return "lingerie";
    if (candidate.includes("bdsm")) return "bdsm";
    if (candidate.includes("bien-etre") || candidate.includes("bienetre")) return "bien-etre";
    if (candidate.includes("aphro")) return "aphrodisiaques";
    if (candidate.includes("jeu")) return "jeux-et-librairie";
    if (candidate.includes("sextoy") || candidate.includes("stimulateur") || candidate.includes("vibro")) return "sextoys";
  }

  return "sextoys";
}

function inferProductSlug(productUrl, fallbackId) {
  try {
    const parsed = new URL(productUrl, SOURCE_HOST);
    const pathPart = parsed.pathname.split("/").filter(Boolean).at(-1) ?? `${fallbackId}`;
    const withoutExtension = pathPart.replace(/\.html$/, "");
    return normalizeText(withoutExtension);
  } catch {
    return `produit-${normalizeText(String(fallbackId))}`;
  }
}

function findImageForProduct(name, imageByAlt) {
  const key = normalizeText(name);
  if (imageByAlt.has(key)) {
    return imageByAlt.get(key);
  }

  for (const [candidateName, candidateImage] of imageByAlt.entries()) {
    if (candidateName.includes(key) || key.includes(candidateName)) {
      return candidateImage;
    }
  }

  return FALLBACK_IMAGE;
}

function buildCategories(menuLinks, products) {
  const orderedSlugs = [];
  const seen = new Set();

  for (const link of menuLinks) {
    if (!seen.has(link.slug)) {
      orderedSlugs.push(link.slug);
      seen.add(link.slug);
    }
  }

  for (const product of products) {
    if (!seen.has(product.categorySlug)) {
      orderedSlugs.push(product.categorySlug);
      seen.add(product.categorySlug);
    }
  }

  return orderedSlugs.map((slug) => {
    const details = CATEGORY_DETAILS[slug] ?? {
      name: cleanText(slug).replace(/-/g, " "),
      description: "Collection importee depuis la source.",
    };

    return {
      id: `cat-${slug}`,
      name: details.name,
      slug,
      description: details.description,
    };
  });
}

async function main() {
  const root = process.cwd();
  const inputPath = path.join(root, "data.html");
  const outputDir = path.join(root, "features", "source", "data");

  const html = await fs.readFile(inputPath, "utf8");

  const menuLinks = [];
  const menuSeen = new Set();
  const menuRegex = /<li class="cmsb2-group">\s*<a href="([^"]+)">([^<]+)<\/a>\s*<\/li>/g;

  for (const match of html.matchAll(menuRegex)) {
    const sourceUrl = toAbsoluteUrl(match[1]);
    const label = cleanText(match[2]);
    const slug = inferMenuSlug(label, sourceUrl);

    if (menuSeen.has(slug)) {
      continue;
    }

    menuSeen.add(slug);
    menuLinks.push({
      label,
      slug,
      href: toShopHref(slug),
      sourceUrl,
    });
  }

  const featuredCategoriesRaw = [];
  const featuredRegex =
    /<div class="pagebuilder-column grid-cat-universe-card[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<span style="font-size: 16px;">([^<]+)<\/span>[\s\S]*?<a href="([^"]+)" style="position:absolute;width:100%;height:100%;bottom:0;left:0"><\/a>/g;

  for (const [index, match] of Array.from(html.matchAll(featuredRegex)).entries()) {
    const label = cleanText(match[2]);
    const sourceUrl = toAbsoluteUrl(match[3]);
    const slug = inferMenuSlug(label, sourceUrl);

    featuredCategoriesRaw.push({
      id: `source-featured-${index + 1}`,
      label,
      slug,
      href: toShopHref(slug),
      sourceUrl,
      image: toAbsoluteUrl(match[1]),
      featured: index === 0,
    });
  }

  const featuredCategories = [];
  const featuredSeen = new Set();
  for (const item of featuredCategoriesRaw) {
    if (featuredSeen.has(item.slug)) {
      continue;
    }

    featuredSeen.add(item.slug);
    featuredCategories.push(item);
  }

  const trimmedFeaturedCategories = featuredCategories.slice(0, 7);

  const promoBanners = [];
  const promoSeen = new Set();
  const promoRegex =
    /<figure[^>]*><a href="([^"]+)"[\s\S]*?<img src="([^"]+)"[^>]*>[\s\S]*?<strong>([^<]+)<\/strong>[\s\S]*?<span data-element="link_text">([^<]+)<\/span>/g;

  for (const match of html.matchAll(promoRegex)) {
    const image = toAbsoluteUrl(match[2]);
    if (!image.includes("_ban_quart_home_")) {
      continue;
    }

    if (promoSeen.has(image)) {
      continue;
    }

    promoSeen.add(image);
    const sourceUrl = toAbsoluteUrl(match[1]);
    const label = cleanText(match[3]);
    const ctaLabel = cleanText(match[4]);
    const slug = inferMenuSlug(label, sourceUrl);

    promoBanners.push({
      label,
      ctaLabel,
      href: toShopHref(slug),
      sourceUrl,
      image,
    });
  }

  const imageByAlt = new Map();
  const imageRegex = /<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"/g;

  for (const match of html.matchAll(imageRegex)) {
    const source = toAbsoluteUrl(match[1]);
    const alt = cleanText(match[2]);

    if (!alt) {
      continue;
    }

    if (!source.includes("/media/catalog/product/") && !source.includes("/media/wysiwyg/")) {
      continue;
    }

    const key = normalizeText(alt);
    if (!imageByAlt.has(key)) {
      imageByAlt.set(key, source);
    }
  }

  const productsBySlug = new Map();
  const productBlockRegex = /const products = \{&quot;[\s\S]*?\};/g;

  for (const block of html.matchAll(productBlockRegex)) {
    const raw = block[0];
    const opening = raw.indexOf("{");
    const closing = raw.lastIndexOf("};");

    if (opening === -1 || closing === -1) {
      continue;
    }

    const encodedObject = raw.slice(opening, closing + 1);
    const decodedObject = decodeHtmlEntities(encodedObject);

    let parsed;
    try {
      parsed = JSON.parse(decodedObject);
    } catch {
      continue;
    }

    for (const [sourceId, sourceProduct] of Object.entries(parsed)) {
      if (!sourceProduct || typeof sourceProduct !== "object") {
        continue;
      }

      const name = cleanText(String(sourceProduct.item_name ?? ""));
      const sourceUrl = toAbsoluteUrl(String(sourceProduct.item_url ?? ""));
      const slug = inferProductSlug(sourceUrl, sourceId);
      const price = Number(sourceProduct.price ?? Number.NaN);

      if (!name || !Number.isFinite(price)) {
        continue;
      }

      if (productsBySlug.has(slug)) {
        continue;
      }

      const compareAt = Number(sourceProduct.price_before_discount ?? Number.NaN);
      const rating = Number(sourceProduct.item_rating ?? Number.NaN);
      const reviewCount = Number.parseInt(String(sourceProduct.item_reviews ?? "0"), 10);
      const categorySlug = inferCategorySlug(sourceProduct.item_category, sourceProduct.item_category2);
      const mainImage = findImageForProduct(name, imageByAlt);
      const itemTag = cleanText(String(sourceProduct.item_category2 ?? sourceProduct.item_category ?? "selection"));
      const saleTag = String(sourceProduct.item_sale_indicator ?? "").toLowerCase() === "on_sale" ? "promotion" : "selection";

      productsBySlug.set(slug, {
        id: `src-${sourceId}`,
        name,
        slug,
        categorySlug,
        shortDescription: itemTag,
        longDescription: `Produit issu de la source ${cleanText(String(sourceProduct.item_brand ?? "")) || "premium"}. Selection orientee plaisir, qualite et discretion.`,
        price: Number(price.toFixed(2)),
        compareAtPrice: Number.isFinite(compareAt) && compareAt > price ? Number(compareAt.toFixed(2)) : undefined,
        rating: Number.isFinite(rating) ? Number(rating.toFixed(2)) : 4.3,
        reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
        tags: [itemTag, saleTag],
        colors: ["Unique"],
        sizes: ["Unique"],
        stock: String(sourceProduct.item_stock ?? "").toLowerCase().includes("in stock") ? 24 : 0,
        sku: cleanText(String(sourceProduct.item_id ?? sourceId)),
        image: mainImage,
        gallery: [mainImage],
      });
    }
  }

  const products = Array.from(productsBySlug.values());
  const categories = buildCategories(menuLinks, products);

  const sourceUi = {
    sourceHost: SOURCE_HOST,
    generatedAt: new Date().toISOString(),
    menuLinks,
    featuredCategories: trimmedFeaturedCategories,
    promoBanners,
    storyHighlights: [
      {
        title: "Notre mission",
        description:
          "Rendre le bien-etre intime plus accessible, plus simple et plus rassurant, avec une approche sans pression ni jugement.",
      },
      {
        title: "Nos engagements",
        description:
          "Qualite body-safe, information claire et discretion totale pour accompagner chaque parcours avec confiance.",
      },
      {
        title: "Notre approche",
        description:
          "Un ton pedagogique et respectueux, loin des stereotypes, pour permettre a chacun d'avancer a son rythme.",
      },
    ],
    footerShopLinks: menuLinks.filter((item) =>
      ["sextoys", "lingerie", "bien-etre", "aphrodisiaques", "bdsm", "jeux-et-librairie", "marques"].includes(item.slug),
    ),
  };

  const safeUi = sanitizeDeep(sourceUi);
  const safeCategories = sanitizeDeep(categories);
  const safeProducts = sanitizeDeep(products);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "source-ui.json"), `${JSON.stringify(safeUi, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(outputDir, "source-categories.json"), `${JSON.stringify(safeCategories, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(outputDir, "source-products.json"), `${JSON.stringify(safeProducts, null, 2)}\n`, "utf8");

  console.log(
    `Source scrape termine: ${safeProducts.length} produits, ${safeCategories.length} categories, ${trimmedFeaturedCategories.length} categories phares.`,
  );
}

main().catch((error) => {
  console.error("Echec du scrape source:", error);
  process.exit(1);
});
