#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const FETCH_HEADERS = {
  "user-agent": USER_AGENT,
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
  pragma: "no-cache",
  "cache-control": "no-cache",
};

const DEFAULT_CONCURRENCY = 14;
const DEFAULT_ENRICH_LIMIT = 1800;
const REQUEST_TIMEOUT_MS = 10000;
const CURL_MAX_BUFFER = 64 * 1024 * 1024;
const FALLBACK_IMAGE = "/hero-slide-01-lingerie-custom.webp";

const CATEGORY_DETAILS = {
  promotions: { name: "Promotions", description: "Offres en cours et selections a prix doux issues des catalogues source." },
  sextoys: { name: "Plaisir", description: "Selections de produits intimes inspires des catalogues source." },
  lingerie: { name: "Lingerie", description: "Pieces lingerie et nightwear issues des univers references." },
  bdsm: { name: "BDSM", description: "Accessoires et univers BDSM inspires des rayons source." },
  "bien-etre": { name: "Bien-etre", description: "Produits de bien-etre intime et routines sensorielles." },
  aphrodisiaques: { name: "Aphrodisiaques", description: "Complements et produits de stimulation du desir." },
  "jeux-et-librairie": { name: "Jeux et librairie", description: "Jeux coquins, coffrets et lectures de decouverte." },
  marques: { name: "Marques", description: "Selection multi-marques et references populaires des sources." },
  conseils: { name: "Conseils", description: "Guides et contenus d'accompagnement pour bien choisir." },
};

const CATEGORY_ORDER = [
  "promotions",
  "sextoys",
  "lingerie",
  "bdsm",
  "bien-etre",
  "aphrodisiaques",
  "jeux-et-librairie",
  "marques",
  "conseils",
];

const SOURCE_URL_BY_CATEGORY = {
  promotions: "https://www.espaceplaisir.fr/1103-promotions",
  sextoys: "https://www.espaceplaisir.fr/939-sextoys",
  lingerie: "https://www.maisonlejaby.com/fr-bj/collections/lingerie",
  bdsm: "https://www.espaceplaisir.fr/1189-bdsm",
  "bien-etre": "https://www.espaceplaisir.fr/991-bien-etre",
  aphrodisiaques: "https://www.espaceplaisir.fr/1267-aphrodisiaques",
  "jeux-et-librairie": "https://www.espaceplaisir.fr/1349-jeux-et-librairie",
  marques: "https://www.espaceplaisir.fr/marques",
  conseils: "https://www.espaceplaisir.fr/conseils",
};

function decodeEntities(input) {
  return String(input ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)));
}

function repairMojibake(value) {
  if (!/[��]/.test(value)) {
    return value;
  }

  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
}

function cleanText(value) {
  return repairMojibake(
    decodeEntities(String(value ?? ""))
      .replace(/<br\s*\/?>/gi, " ")
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

function parseNumeric(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;

  const cleaned = value.replace(/\s/g, "").replace(/,/g, ".").replace(/[^0-9.\-]/g, "");
  if (!cleaned) return undefined;

  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseInteger(value) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  const parsed = Number.parseInt(String(value ?? "").replace(/[^0-9\-]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toAbsoluteUrl(value, baseUrl) {
  const decoded = decodeEntities(String(value ?? "").trim());
  if (!decoded) return "";

  try {
    const parsed = new URL(decoded, baseUrl);
    if (parsed.protocol === "http:") parsed.protocol = "https:";
    return parsed.toString();
  } catch {
    return "";
  }
}

function normalizeProductUrl(value) {
  try {
    const parsed = new URL(value);
    parsed.search = "";
    parsed.hash = "";
    if (parsed.protocol === "http:") parsed.protocol = "https:";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return String(value ?? "").trim();
  }
}

function toDisplayNameFromSlug(slug) {
  const cleaned = slug.replace(/\.html$/i, "").replace(/[-_]+/g, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "Produit";
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const text = String(value ?? "").trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
  }

  return result;
}

function getArgValue(name) {
  const prefix = `${name}=`;
  const match = process.argv.find((item) => item.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

function getArgNumber(name, fallback) {
  const value = getArgValue(name);
  if (value == null) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

async function fetchWithTimeout(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: FETCH_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function curlFetchText(url) {
  const args = [
    "-L",
    url,
    "-A",
    USER_AGENT,
    "-H",
    "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "-H",
    "Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "--compressed",
    "--silent",
    "--show-error",
    "--max-time",
    "35",
  ];

  const { stdout } = await execFileAsync("curl.exe", args, { maxBuffer: CURL_MAX_BUFFER });
  return stdout;
}

async function fetchText(url, options = {}) {
  const { fallbackToCurl = false } = options;

  try {
    const response = await fetchWithTimeout(url);
    if (response.ok) return await response.text();

    if (fallbackToCurl || response.status === 406 || response.status === 403 || response.status === 429) {
      return await curlFetchText(url);
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    if (fallbackToCurl) return await curlFetchText(url);
    throw error;
  }
}

function extractLocsFromXml(xmlText) {
  return Array.from(xmlText.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => decodeEntities(match[1]).trim()).filter(Boolean);
}

function extractSitemapEntries(xmlText) {
  const entries = [];
  const urlBlocks = xmlText.matchAll(/<url>([\s\S]*?)<\/url>/g);

  for (const block of urlBlocks) {
    const body = block[1] ?? "";
    const locMatch = body.match(/<loc>([^<]+)<\/loc>/);
    if (!locMatch) continue;

    const images = Array.from(body.matchAll(/<image:loc>([^<]+)<\/image:loc>/g), (match) => decodeEntities(match[1]).trim()).filter(Boolean);
    const imageTitle = cleanText(body.match(/<image:title>([^<]+)<\/image:title>/)?.[1] ?? "");
    const imageCaption = cleanText(body.match(/<image:caption>([^<]+)<\/image:caption>/)?.[1] ?? "");

    entries.push({
      loc: decodeEntities(locMatch[1]).trim(),
      images,
      title: imageTitle || imageCaption,
    });
  }

  return entries;
}

async function collectMaisonLejabyRecords(maxPerSource) {
  const indexXml = await fetchText("https://www.maisonlejaby.com/sitemap.xml", { fallbackToCurl: true });
  const productSitemapUrls = extractLocsFromXml(indexXml).filter((url) => url.includes("/fr-bj/sitemap_products_")).slice(0, 10);

  const records = new Map();

  for (const sitemapUrl of productSitemapUrls) {
    const sitemapXml = await fetchText(sitemapUrl, { fallbackToCurl: true });
    for (const entry of extractSitemapEntries(sitemapXml)) {
      const normalizedUrl = normalizeProductUrl(entry.loc);
      if (!normalizedUrl.includes("/fr-bj/products/")) continue;

      if (!records.has(normalizedUrl)) {
        records.set(normalizedUrl, {
          source: "maison-lejaby",
          url: normalizedUrl,
          sitemapImages: entry.images,
          sitemapTitle: entry.title,
        });
      }

      if (maxPerSource > 0 && records.size >= maxPerSource) {
        return Array.from(records.values());
      }
    }
  }

  return Array.from(records.values());
}

async function collectEspacePlaisirRecords(maxPerSource) {
  const sitemapUrls = new Set([
    "https://www.espaceplaisir.fr/media/sitemap/sitemap_ep-1-1.xml",
    "https://www.espaceplaisir.fr/media/sitemap/sitemap_ep-1-2.xml",
  ]);

  try {
    const indexXml = await fetchText("https://www.espaceplaisir.fr/media/sitemap/sitemap_ep.xml", { fallbackToCurl: true });
    for (const loc of extractLocsFromXml(indexXml)) {
      if (loc.includes("/media/sitemap/sitemap_ep-")) sitemapUrls.add(loc);
    }
  } catch {
    // Keep defaults.
  }

  const records = new Map();

  for (const sitemapUrl of sitemapUrls) {
    const sitemapXml = await fetchText(sitemapUrl, { fallbackToCurl: true });
    for (const entry of extractSitemapEntries(sitemapXml)) {
      const normalizedUrl = normalizeProductUrl(entry.loc);
      if (!normalizedUrl.startsWith("https://www.espaceplaisir.fr/")) continue;
      if (!normalizedUrl.endsWith(".html")) continue;
      if (normalizedUrl.includes("/blog") || normalizedUrl.includes("/conseils")) continue;

      if (!records.has(normalizedUrl)) {
        records.set(normalizedUrl, {
          source: "espace-plaisir",
          url: normalizedUrl,
          sitemapImages: entry.images,
          sitemapTitle: entry.title,
        });
      }

      if (maxPerSource > 0 && records.size >= maxPerSource) {
        return Array.from(records.values());
      }
    }
  }

  return Array.from(records.values());
}

function inferCategorySlug({ source, url, name, description }) {
  const haystack = normalizeText([source, url, name, description].filter(Boolean).join(" "));

  if (/bdsm|bondage|fouet|menotte|harnais|fetish/.test(haystack)) return "bdsm";
  if (/aphro|stimulant|desir/.test(haystack)) return "aphrodisiaques";
  if (/jeu|coquin|librair|livre|kamasutra/.test(haystack)) return "jeux-et-librairie";
  if (/huile|massage|lubrifiant|gel|bougie|bien-etre|wellness/.test(haystack)) return "bien-etre";
  if (/soutien|culotte|string|bustier|nuisette|lingerie|body|bralette|slip|triangle|maillot|swimwear/.test(haystack)) return "lingerie";
  if (/sextoy|vibro|vibromasseur|stimulateur|womanizer|plug|anal|gode|dildo|masturb/.test(haystack)) return "sextoys";

  return source === "maison-lejaby" ? "lingerie" : "sextoys";
}

function defaultPriceByCategory(categorySlug, source) {
  const base = {
    promotions: 39,
    sextoys: 59,
    lingerie: 89,
    bdsm: 69,
    "bien-etre": 35,
    aphrodisiaques: 29,
    "jeux-et-librairie": 25,
    marques: 59,
    conseils: 19,
  };

  const sourceBoost = source === "maison-lejaby" ? 20 : 0;
  return base[categorySlug] + sourceBoost;
}

function buildFallbackProduct(record) {
  const parsed = new URL(record.url);
  const slugRaw = parsed.pathname.split("/").filter(Boolean).at(-1) ?? "produit";
  const slug = normalizeText(slugRaw.replace(/\.html$/i, ""));
  const name = cleanText(record.sitemapTitle) || toDisplayNameFromSlug(slugRaw);
  const categorySlug = inferCategorySlug({ source: record.source, url: record.url, name, description: "" });
  const price = defaultPriceByCategory(categorySlug, record.source);
  const image = toAbsoluteUrl(record.sitemapImages[0], record.url) || FALLBACK_IMAGE;
  const longDescription =
    record.source === "maison-lejaby"
      ? "Produit importe depuis Maison Lejaby. Selection lingerie premium adaptee a Ma Petite Lingerie."
      : "Produit importe depuis Espace Plaisir. Selection orientee plaisir et bien-etre intime.";

  return {
    id: normalizeText(`${record.source}-${slug}`),
    name,
    slug,
    categorySlug,
    shortDescription: categorySlug === "lingerie" ? "Lingerie premium" : "Selection plaisir",
    longDescription,
    price,
    rating: 4.4,
    reviewCount: 0,
    tags: [categorySlug === "sextoys" ? "Plaisir" : CATEGORY_DETAILS[categorySlug]?.name ?? "Selection", record.source === "maison-lejaby" ? "Maison Lejaby" : "Espace Plaisir"],
    colors: ["Unique"],
    sizes: ["Unique"],
    stock: 24,
    sku: slug,
    image,
    gallery: uniqueStrings([image, ...record.sitemapImages.map((value) => toAbsoluteUrl(value, record.url)).filter(Boolean)]),
  };
}

function extractBalancedJsonFragments(text) {
  const fragments = [];
  let i = 0;

  while (i < text.length) {
    while (i < text.length && text[i] !== "{" && text[i] !== "[") i += 1;
    if (i >= text.length) break;

    const start = i;
    const stack = [text[i]];
    i += 1;
    let inString = false;
    let escaped = false;

    for (; i < text.length; i += 1) {
      const ch = text[i];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }

        if (ch === "\\") {
          escaped = true;
          continue;
        }

        if (ch === '"') inString = false;
        continue;
      }

      if (ch === '"') {
        inString = true;
        continue;
      }

      if (ch === "{" || ch === "[") {
        stack.push(ch);
        continue;
      }

      if (ch === "}" || ch === "]") {
        const last = stack.at(-1);
        if ((ch === "}" && last === "{") || (ch === "]" && last === "[")) {
          stack.pop();
          if (stack.length === 0) {
            fragments.push(text.slice(start, i + 1));
            i += 1;
            break;
          }
        }
      }
    }
  }

  return fragments;
}

function parseJsonLoose(rawText) {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  try {
    return [JSON.parse(trimmed)];
  } catch {
    return extractBalancedJsonFragments(trimmed)
      .map((fragment) => {
        try {
          return JSON.parse(fragment);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }
}

function flattenJsonLdNodes(value) {
  if (Array.isArray(value)) return value.flatMap((item) => flattenJsonLdNodes(item));
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value["@graph"])) return value["@graph"].flatMap((item) => flattenJsonLdNodes(item));
  return [value];
}

function extractJsonLdNodes(html) {
  const blocks = Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi), (match) => match[1]);
  const nodes = [];

  for (const block of blocks) {
    for (const parsed of parseJsonLoose(block)) {
      nodes.push(...flattenJsonLdNodes(parsed));
    }
  }

  return nodes;
}

function hasType(node, expectedType) {
  const type = node?.["@type"];
  if (typeof type === "string") return type.toLowerCase() === expectedType.toLowerCase();
  if (Array.isArray(type)) return type.some((value) => String(value).toLowerCase() === expectedType.toLowerCase());
  return false;
}

function pickProductNode(nodes) {
  return nodes.find((node) => hasType(node, "Product")) ?? nodes.find((node) => hasType(node, "ProductGroup")) ?? null;
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeSourcePrice(value, source) {
  const price = Number(value);
  if (!Number.isFinite(price)) return price;

  // Maison Lejaby fr-bj can expose prices in XOF/CFA through Shopify JSON-LD.
  // Convert obvious XOF amounts back to EUR before writing product data.
  if (source === "maison-lejaby" && price >= 1000) {
    return Number((price / 655.957).toFixed(2));
  }

  return Number(price.toFixed(2));
}

function chooseBestOffer(node) {
  const offers = [];

  for (const offer of toArray(node?.offers)) {
    offers.push({ offer, sku: node?.sku, image: node?.image });
  }

  for (const variant of toArray(node?.hasVariant)) {
    for (const offer of toArray(variant?.offers)) {
      offers.push({ offer, sku: variant?.sku ?? node?.sku, image: variant?.image ?? node?.image });
    }
  }

  const candidates = offers
    .map((entry) => ({
      ...entry,
      price: parseNumeric(entry.offer?.price),
      highPrice: parseNumeric(entry.offer?.highPrice),
      availability: String(entry.offer?.availability ?? ""),
    }))
    .filter((entry) => Number.isFinite(entry.price ?? Number.NaN));

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const inStockA = /instock/i.test(a.availability) ? 1 : 0;
    const inStockB = /instock/i.test(b.availability) ? 1 : 0;
    if (inStockA !== inStockB) return inStockB - inStockA;
    return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER);
  });

  return candidates[0];
}

function parseEnrichedProduct(record, html) {
  const node = pickProductNode(extractJsonLdNodes(html));
  if (!node) return null;

  const offer = chooseBestOffer(node);
  const rawPrice = offer?.price ?? parseNumeric(node?.offers?.price);
  if (!Number.isFinite(rawPrice ?? Number.NaN)) return null;
  const price = normalizeSourcePrice(rawPrice, record.source);

  const name = cleanText(node?.name) || buildFallbackProduct(record).name;
  const categorySlug = inferCategorySlug({ source: record.source, url: record.url, name, description: cleanText(node?.description) });

  const images = uniqueStrings([
    ...toArray(node?.image).map((value) => toAbsoluteUrl(value, record.url)),
    ...toArray(offer?.image).map((value) => toAbsoluteUrl(value, record.url)),
    ...record.sitemapImages.map((value) => toAbsoluteUrl(value, record.url)),
  ]).filter(Boolean);

  return {
    name,
    categorySlug,
    shortDescription: cleanText(node?.category ?? node?.productType ?? "") || undefined,
    longDescription: cleanText(node?.description) || undefined,
    price,
    compareAtPrice: Number.isFinite(offer?.highPrice ?? Number.NaN) && normalizeSourcePrice(offer.highPrice, record.source) > price ? normalizeSourcePrice(offer.highPrice, record.source) : undefined,
    rating: Number((parseNumeric(node?.aggregateRating?.ratingValue) ?? 4.5).toFixed(2)),
    reviewCount: parseInteger(node?.aggregateRating?.reviewCount) ?? 0,
    stock: /instock/i.test(String(offer?.availability ?? "")) ? 24 : 0,
    sku: cleanText(offer?.sku ?? node?.sku ?? "") || undefined,
    image: images[0],
    gallery: images,
  };
}

async function mapWithConcurrency(items, concurrency, mapper) {
  if (items.length === 0) return [];

  const results = new Array(items.length);
  let cursor = 0;
  let done = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;

      try {
        results[index] = await mapper(items[index], index);
      } catch {
        results[index] = null;
      }

      done += 1;
      if (done % 200 === 0 || done === items.length) {
        console.log(`[progress] ${done}/${items.length}`);
      }
    }
  });

  await Promise.all(workers);
  return results;
}

function mergeProduct(fallback, enriched) {
  if (!enriched) return fallback;

  const tags = uniqueStrings([
    enriched.categorySlug === "sextoys" ? "Plaisir" : CATEGORY_DETAILS[enriched.categorySlug ?? fallback.categorySlug]?.name,
    fallback.tags[1],
    enriched.compareAtPrice ? "Promotion" : "Selection",
  ]);

  return {
    ...fallback,
    ...enriched,
    shortDescription: enriched.shortDescription || fallback.shortDescription,
    longDescription: enriched.longDescription || fallback.longDescription,
    sku: enriched.sku || fallback.sku,
    image: enriched.image || fallback.image,
    gallery: uniqueStrings([...(enriched.gallery ?? []), ...fallback.gallery]),
    tags,
  };
}

function scoreProduct(product) {
  const inStockScore = product.stock > 0 ? 10000 : 0;
  const ratingScore = (product.rating ?? 4.4) * 400;
  const reviewScore = Math.min(product.reviewCount ?? 0, 5000) * 2;
  const discountScore =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? ((product.compareAtPrice - product.price) / product.compareAtPrice) * 900
      : 0;

  return inStockScore + ratingScore + reviewScore + discountScore;
}

function ensureUniqueSlugs(products) {
  const seen = new Map();

  for (const product of products) {
    const base = product.slug || normalizeText(product.name) || "produit";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    if (count === 0) {
      product.slug = base;
      continue;
    }

    const suffix = normalizeText(product.id).slice(-6) || String(count + 1);
    product.slug = `${base}-${suffix}`;
  }
}

function buildCategories() {
  return CATEGORY_ORDER.map((slug) => ({
    id: `cat-${slug}`,
    name: CATEGORY_DETAILS[slug].name,
    slug,
    description: CATEGORY_DETAILS[slug].description,
  }));
}

function toShopHref(slug) {
  if (slug === "conseils") return "/#conseils";
  return `/catalogue?categorie=${slug}`;
}

function buildSourceUi(products) {
  const menuLinks = CATEGORY_ORDER.map((slug) => ({
    label: CATEGORY_DETAILS[slug].name,
    slug,
    href: toShopHref(slug),
    sourceUrl: SOURCE_URL_BY_CATEGORY[slug] ?? "https://www.espaceplaisir.fr",
  }));

  const firstImageByCategory = new Map();
  for (const product of products) {
    if (!firstImageByCategory.has(product.categorySlug) && product.image) {
      firstImageByCategory.set(product.categorySlug, product.image);
    }
  }

  const featuredOrder = ["lingerie", "sextoys", "bien-etre", "bdsm", "aphrodisiaques", "jeux-et-librairie", "promotions"];
  const featuredCategories = featuredOrder.map((slug, index) => ({
    id: `source-featured-${index + 1}`,
    label: CATEGORY_DETAILS[slug].name,
    slug,
    href: toShopHref(slug),
    sourceUrl: SOURCE_URL_BY_CATEGORY[slug] ?? "https://www.espaceplaisir.fr",
    image: firstImageByCategory.get(slug) ?? FALLBACK_IMAGE,
    featured: index === 0,
  }));

  const promoBanners = ["lingerie", "sextoys", "bien-etre"].map((slug) => ({
    label: `${CATEGORY_DETAILS[slug].name} premium importee de nos sources`,
    ctaLabel: "Explorer",
    href: toShopHref(slug),
    sourceUrl: SOURCE_URL_BY_CATEGORY[slug] ?? "https://www.espaceplaisir.fr",
    image: firstImageByCategory.get(slug) ?? FALLBACK_IMAGE,
  }));

  return {
    sourceHost: "https://www.maisonlejaby.com + https://www.espaceplaisir.fr",
    generatedAt: new Date().toISOString(),
    menuLinks,
    featuredCategories,
    promoBanners,
    storyHighlights: [
      {
        title: "Notre mission",
        description:
          "Rendre le bien-etre intime plus accessible avec une selection premium, de la lingerie elegante aux univers plaisir.",
      },
      {
        title: "Nos engagements",
        description:
          "Qualite, information claire et discretion totale pour accompagner chaque commande avec confiance.",
      },
      {
        title: "Notre approche",
        description:
          "Un ton pedagogique et respectueux, sans jugement, pour permettre a chacun d'avancer a son rythme.",
      },
    ],
    footerShopLinks: menuLinks.filter((item) =>
      ["sextoys", "lingerie", "bien-etre", "aphrodisiaques", "bdsm", "jeux-et-librairie", "marques"].includes(item.slug),
    ),
  };
}

function sanitizeForJson(value) {
  if (Array.isArray(value)) return value.map((item) => sanitizeForJson(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, sanitizeForJson(nested)]));
  }
  if (typeof value === "string") return cleanText(value);
  return value;
}

async function main() {
  const root = process.cwd();
  const outputDir = path.join(root, "features", "source", "data");

  const concurrency = getArgNumber("--concurrency", DEFAULT_CONCURRENCY);
  const maxPerSource = getArgNumber("--max-per-source", 0);
  const enrichLimit = getArgNumber("--enrich-limit", DEFAULT_ENRICH_LIMIT);

  console.log(`[start] Collecte sitemaps (max-per-source=${maxPerSource || "all"}).`);
  const [maisonRecords, espaceRecords] = await Promise.all([
    collectMaisonLejabyRecords(maxPerSource),
    collectEspacePlaisirRecords(maxPerSource),
  ]);

  const allRecords = [...maisonRecords, ...espaceRecords];
  console.log(`[info] Produits detectes via sitemap: maison=${maisonRecords.length}, espace=${espaceRecords.length}, total=${allRecords.length}`);

  const recordsToEnrich = enrichLimit > 0 ? allRecords.slice(0, enrichLimit) : allRecords;
  console.log(`[start] Enrichissement detail pages: ${recordsToEnrich.length} pages (concurrency=${concurrency}).`);

  const enrichedResults = await mapWithConcurrency(recordsToEnrich, concurrency, async (record) => {
    const html = await fetchText(record.url, { fallbackToCurl: record.source === "espace-plaisir" });
    return parseEnrichedProduct(record, html);
  });

  const enrichedByUrl = new Map();
  for (let index = 0; index < recordsToEnrich.length; index += 1) {
    const enriched = enrichedResults[index];
    if (!enriched) continue;
    enrichedByUrl.set(recordsToEnrich[index].url, enriched);
  }

  const products = allRecords.map((record) => mergeProduct(buildFallbackProduct(record), enrichedByUrl.get(record.url)));
  products.sort((a, b) => scoreProduct(b) - scoreProduct(a));
  ensureUniqueSlugs(products);

  const categories = buildCategories();
  const sourceUi = buildSourceUi(products);

  await fs.mkdir(outputDir, { recursive: true });

  const safeProducts = sanitizeForJson(products);
  const safeCategories = sanitizeForJson(categories);
  const safeUi = sanitizeForJson(sourceUi);

  await fs.writeFile(path.join(outputDir, "source-products.json"), `${JSON.stringify(safeProducts, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(outputDir, "source-categories.json"), `${JSON.stringify(safeCategories, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(outputDir, "source-ui.json"), `${JSON.stringify(safeUi, null, 2)}\n`, "utf8");

  console.log(`[done] Produits importes: ${safeProducts.length}. Enrichis detail: ${enrichedByUrl.size}.`);
}

main().catch((error) => {
  console.error("Echec scrape multi-source:", error);
  process.exit(1);
});
