#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_CATEGORY_URL = "https://www.espaceplaisir.fr/941-gode-et-godemichet";
const DEFAULT_CATEGORY_SLUG = "sextoys";
const DEFAULT_SUBCATEGORY_SLUG = "gode-et-godemichet";
const DEFAULT_SUBCATEGORY_LABEL = "Gode et godemichet";
const SOURCE_NAME = "Espace Plaisir";
const FALLBACK_IMAGE = "https://www.espaceplaisir.fr/media/catalog/product/placeholder/default/default.jpg";

const DEFAULT_LIMIT = 100;
const DEFAULT_CONCURRENCY = 10;
const REQUEST_TIMEOUT_MS = 20000;
const CURL_MAX_BUFFER = 64 * 1024 * 1024;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const FETCH_HEADERS = {
  "user-agent": USER_AGENT,
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
  pragma: "no-cache",
  "cache-control": "no-cache",
};

let ACTIVE_CATEGORY_URL = DEFAULT_CATEGORY_URL;
let ACTIVE_CATEGORY_SLUG = DEFAULT_CATEGORY_SLUG;
let ACTIVE_SUBCATEGORY_SLUG = DEFAULT_SUBCATEGORY_SLUG;
let ACTIVE_SUBCATEGORY_LABEL = DEFAULT_SUBCATEGORY_LABEL;

function getArgValue(name) {
  const prefix = `${name}=`;
  const found = process.argv.find((item) => item.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

function getArgNumber(name, fallback) {
  const raw = getArgValue(name);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function deriveSubcategorySlugFromUrl(categoryUrl) {
  try {
    const parsed = new URL(categoryUrl);
    const lastSegment = parsed.pathname.split("/").filter(Boolean).at(-1) ?? "";
    return normalizeText(lastSegment.replace(/^\d+-/, ""));
  } catch {
    return "";
  }
}

function labelFromSlug(slug) {
  return String(slug ?? "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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

function parseNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.replace(/\s/g, "").replace(/,/g, ".").replace(/[^0-9.\-]/g, "");
  if (!normalized) {
    return undefined;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toAbsoluteUrl(url, base = ACTIVE_CATEGORY_URL) {
  const decoded = decodeEntities(String(url ?? "").trim());
  if (!decoded) {
    return "";
  }

  try {
    const parsed = new URL(decoded, base);
    if (parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function normalizeProductUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    if (parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return String(url ?? "").trim();
  }
}

function uniqueStrings(values) {
  const seen = new Set();
  const output = [];

  for (const value of values) {
    const text = String(value ?? "").trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    output.push(text);
  }

  return output;
}

function isGoodImage(url) {
  const value = String(url ?? "").trim();
  if (!value) return false;
  if (!/^https?:\/\//i.test(value) && !value.startsWith("/")) return false;
  if (value.includes("placeholder/default")) return false;
  return true;
}

function extractBalancedJsonFragments(text) {
  const fragments = [];
  let index = 0;

  while (index < text.length) {
    while (index < text.length && text[index] !== "{" && text[index] !== "[") {
      index += 1;
    }

    if (index >= text.length) {
      break;
    }

    const start = index;
    const stack = [text[index]];
    index += 1;
    let inString = false;
    let escaped = false;

    for (; index < text.length; index += 1) {
      const char = text[index];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === "\\") {
          escaped = true;
          continue;
        }

        if (char === '"') {
          inString = false;
        }

        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === "{" || char === "[") {
        stack.push(char);
        continue;
      }

      if (char === "}" || char === "]") {
        const last = stack.at(-1);
        if ((char === "}" && last === "{") || (char === "]" && last === "[")) {
          stack.pop();
          if (stack.length === 0) {
            fragments.push(text.slice(start, index + 1));
            index += 1;
            break;
          }
        }
      }
    }
  }

  return fragments;
}

function parseJsonLoose(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) {
    return [];
  }

  try {
    return [JSON.parse(trimmed)];
  } catch {
    const parsed = [];
    for (const fragment of extractBalancedJsonFragments(trimmed)) {
      try {
        parsed.push(JSON.parse(fragment));
      } catch {
        // Ignore bad fragment.
      }
    }
    return parsed;
  }
}

function flattenJsonLd(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenJsonLd(item));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value["@graph"])) {
    return value["@graph"].flatMap((item) => flattenJsonLd(item));
  }

  return [value];
}

function extractJsonLdNodes(html) {
  const blocks = Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi), (m) => m[1]);
  const nodes = [];

  for (const block of blocks) {
    for (const parsed of parseJsonLoose(block)) {
      nodes.push(...flattenJsonLd(parsed));
    }
  }

  return nodes;
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
    "40",
  ];

  const { stdout } = await execFileAsync("curl.exe", args, { maxBuffer: CURL_MAX_BUFFER });
  return stdout;
}

async function fetchText(url, allowCurlFallback = true) {
  try {
    const response = await fetchWithTimeout(url);

    if (response.ok) {
      return await response.text();
    }

    if (allowCurlFallback && [403, 406, 429].includes(response.status)) {
      return await curlFetchText(url);
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    if (!allowCurlFallback) {
      throw error;
    }

    return await curlFetchText(url);
  }
}

function parseCategoryCards(html) {
  const cards = [];
  const chunks = html.split('<div class="product-optimized"').slice(1);

  for (const chunk of chunks) {
    const block = `<div class="product-optimized"${chunk}`;

    const url = normalizeProductUrl(block.match(/<a href="(https:\/\/www\.espaceplaisir\.fr\/[^"]+\.html)"/i)?.[1] ?? "");
    if (!url) {
      continue;
    }

    const name = cleanText(block.match(/<a href="https:\/\/www\.espaceplaisir\.fr\/[^"]+\.html">([\s\S]*?)<\/a>/i)?.[1] ?? "");
    const brand = cleanText(block.match(/<div class="product-item-brand">([\s\S]*?)<\/div>/i)?.[1] ?? "");
    const image = toAbsoluteUrl(block.match(/<img[^>]+src="([^"]+)"/i)?.[1] ?? "", url);

    const priceValues = [
      ...Array.from(block.matchAll(/id="product-price-[^"]+"[\s\S]*?data-price-amount="([0-9.]+)"/gi), (m) => parseNumber(m[1])),
      ...Array.from(block.matchAll(/data-price-type="finalPrice"[^>]*data-price-amount="([0-9.]+)"/gi), (m) => parseNumber(m[1])),
      ...Array.from(block.matchAll(/data-price-amount="([0-9.]+)"[^>]*data-price-type="finalPrice"/gi), (m) => parseNumber(m[1])),
    ].filter((value) => Number.isFinite(value ?? Number.NaN) && value > 0);

    const oldPriceValues = [
      ...Array.from(block.matchAll(/id="old-price-[^"]+"[\s\S]*?data-price-amount="([0-9.]+)"/gi), (m) => parseNumber(m[1])),
      ...Array.from(block.matchAll(/data-price-type="oldPrice"[^>]*data-price-amount="([0-9.]+)"/gi), (m) => parseNumber(m[1])),
      ...Array.from(block.matchAll(/data-price-amount="([0-9.]+)"[^>]*data-price-type="oldPrice"/gi), (m) => parseNumber(m[1])),
    ].filter((value) => Number.isFinite(value ?? Number.NaN) && value > 0);

    const finalPrice = priceValues.length > 0 ? Math.min(...priceValues) : undefined;
    const oldPrice = oldPriceValues.length > 0 ? Math.max(...oldPriceValues) : undefined;

    const rating = parseNumber(block.match(/class="flex mr-3 font-bold text-black">([0-9.,]+)/i)?.[1] ?? "") ?? 4.4;
    const reviewCount = Number.parseInt(block.match(/\((\d+)\)/)?.[1] ?? "0", 10);

    const stockLabel = cleanText(block.match(/<div class="stock-status">([\s\S]*?)<\/div>/i)?.[1] ?? "");
    const inStock = stockLabel ? !/hors stock|rupture/i.test(stockLabel) : true;

    cards.push({
      url,
      name,
      brand,
      image,
      finalPrice: Number.isFinite(finalPrice ?? Number.NaN) ? finalPrice : undefined,
      oldPrice: Number.isFinite(oldPrice ?? Number.NaN) ? oldPrice : undefined,
      rating,
      reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
      stockLabel,
      stock: inStock ? 24 : 0,
    });
  }

  return cards;
}

async function collectCategoryProducts(limit) {
  const records = new Map();
  const seenPageSignatures = new Set();

  for (let page = 1; page <= 25; page += 1) {
    if (records.size >= limit) {
      break;
    }

    const pageUrl = page === 1 ? ACTIVE_CATEGORY_URL : `${ACTIVE_CATEGORY_URL}?p=${page}`;
    const html = await fetchText(pageUrl, true);
    const cards = parseCategoryCards(html);

    if (cards.length === 0) {
      break;
    }

    const signature = `${cards[0]?.url ?? "none"}::${cards.length}`;
    if (seenPageSignatures.has(signature)) {
      break;
    }

    seenPageSignatures.add(signature);

    for (const card of cards) {
      if (!records.has(card.url)) {
        records.set(card.url, card);
      }
      if (records.size >= limit) {
        break;
      }
    }

    console.log(`[category] page ${page} -> ${cards.length} produits, total=${records.size}`);
  }

  return Array.from(records.values()).slice(0, limit);
}

function extractGalleryFromInitGallery(html, baseUrl) {
  const match = html.match(/"images"\s*:\s*(\[[\s\S]*?\])\s*,\s*"appendOnReceiveImages"/i);
  if (!match) {
    return [];
  }

  let parsed = [];
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    return [];
  }

  const gallery = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") {
      continue;
    }

    gallery.push(toAbsoluteUrl(item.full, baseUrl));
    gallery.push(toAbsoluteUrl(item.img, baseUrl));
    gallery.push(toAbsoluteUrl(item.thumb, baseUrl));
  }

  return uniqueStrings(gallery.filter(isGoodImage));
}

function extractDetailedDescription(html) {
  const marker = html.indexOf('id="description-title"');
  const nextMarker = html.indexOf('id="product.attributes-title"');

  if (marker === -1 || nextMarker === -1 || nextMarker <= marker) {
    return "";
  }

  const start = html.lastIndexOf("<li", marker);
  const end = html.lastIndexOf("<li", nextMarker);

  if (start === -1 || end === -1 || end <= start) {
    return "";
  }

  let slice = html.slice(start, end);
  slice = slice
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<template[\s\S]*?<\/template>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ");

  const afterHeading = slice.match(/<h2[^>]*>\s*D(?:e|\u00E9)tails\s*<\/h2>([\s\S]*)/i);
  if (afterHeading?.[1]) {
    slice = afterHeading[1];
  }

  const cleaned = cleanText(slice)
    .replace(/^details\s*/i, "")
    .replace(/\s*plus d'informations[\s\S]*$/i, "")
    .trim();

  return cleaned;
}

function firstPositivePrice(values) {
  const valid = values.filter((value) => Number.isFinite(value ?? Number.NaN) && value > 0);
  return valid.length > 0 ? valid[0] : undefined;
}

function extractAnyPositivePrice(html) {
  const directMatches = [
    ...Array.from(html.matchAll(/id="product-price-\d+"[\s\S]{0,900}?data-price-amount="([0-9.]+)"/gi), (m) => parseNumber(m[1])),
    ...Array.from(html.matchAll(/data-price-type="finalPrice"[^>]*data-price-amount="([0-9.]+)"/gi), (m) => parseNumber(m[1])),
    ...Array.from(html.matchAll(/data-price-amount="([0-9.]+)"[^>]*data-price-type="finalPrice"/gi), (m) => parseNumber(m[1])),
    ...Array.from(html.matchAll(/"finalPrice"\s*:\s*\{"amount":\s*([0-9.]+)\}/gi), (m) => parseNumber(m[1])),
  ].filter((value) => Number.isFinite(value ?? Number.NaN) && value > 0);

  if (directMatches.length > 0) {
    return Math.min(...directMatches);
  }

  const allPriceAmounts = Array.from(html.matchAll(/data-price-amount="([0-9.]+)"/gi), (m) => parseNumber(m[1])).filter(
    (value) => Number.isFinite(value ?? Number.NaN) && value > 0,
  );

  return allPriceAmounts.length > 0 ? Math.min(...allPriceAmounts) : undefined;
}

function normalizeDescriptionText(value) {
  return cleanText(value)
    .replace(/^id="description-title"[\s\S]*?D(?:e|\u00E9)tails\s*/i, "")
    .replace(/\s*<li class="[^"]*product-attributes-title"[\s\S]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMainCompareAtPriceFromConfig(html, price) {
  const candidates = [
    ...Array.from(html.matchAll(/id="old-price-\d+"[\s\S]{0,900}?data-price-amount="([0-9.]+)"/gi), (m) => parseNumber(m[1])),
    ...Array.from(html.matchAll(/"oldPrice"\s*:\s*\{"amount":\s*([0-9.]+)\}/gi), (m) => parseNumber(m[1])),
  ].filter((value) => Number.isFinite(value ?? Number.NaN) && value > 0);

  if (candidates.length === 0) {
    return undefined;
  }

  const sorted = [...candidates].sort((a, b) => b - a);
  const betterThanPrice = sorted.find((value) => value > price);
  return betterThanPrice ?? sorted[0];
}

function extractSpecifications(html) {
  const start = html.indexOf('id="product.attributes-title"');
  if (start === -1) {
    return [];
  }

  const end = html.indexOf("</li>", start);
  const section = html.slice(start, end === -1 ? start + 12000 : end);

  const rows = [];
  const rowRegex = /<div class="min-w-40[^>]*>\s*([\s\S]*?)\s*<\/div>\s*<div[^>]*data-th="[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/div>/gi;

  for (const match of section.matchAll(rowRegex)) {
    const label = cleanText(match[1]);
    const value = cleanText(match[2]);

    if (!label || !value) {
      continue;
    }

    rows.push({ label, value });
  }

  return rows;
}

function extractMainSku(html, jsonLdProduct) {
  const fromLd = cleanText(jsonLdProduct?.sku ?? "");
  if (fromLd) {
    return fromLd;
  }

  const dataSku = cleanText(html.match(/data-sku="([^"]+)"/i)?.[1] ?? "");
  return dataSku || "";
}

function extractMainName(html, fallbackName, jsonLdProduct) {
  const pageTitle = cleanText(html.match(/<p class="base title-font"[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "");
  if (pageTitle) {
    return pageTitle;
  }

  const fromLd = cleanText(jsonLdProduct?.name ?? "");
  if (fromLd) {
    return fromLd;
  }

  return cleanText(fallbackName) || "Produit";
}

function extractMainDescription(html, jsonLdProduct) {
  const detail = extractDetailedDescription(html);
  if (detail) {
    return detail;
  }

  const shortSection = cleanText(html.match(/class="product-description"[\s\S]*?>([\s\S]*?)<\/div>/i)?.[1] ?? "");
  if (shortSection) {
    return shortSection;
  }

  return cleanText(jsonLdProduct?.description ?? "");
}

function extractMainPriceFromConfig(html) {
  const direct = firstPositivePrice([
    parseNumber(html.match(/id="product-price-\d+"[\s\S]{0,500}?data-price-amount="([0-9.]+)"/i)?.[1] ?? ""),
    parseNumber(html.match(/data-price-type="finalPrice"[^>]*data-price-amount="([0-9.]+)"/i)?.[1] ?? ""),
    parseNumber(html.match(/data-price-amount="([0-9.]+)"[^>]*data-price-type="finalPrice"/i)?.[1] ?? ""),
  ]);

  if (Number.isFinite(direct ?? Number.NaN)) {
    return direct;
  }

  const configurablePrices = Array.from(
    html.matchAll(/"finalPrice"\s*:\s*\{"amount":\s*([0-9.]+)\}/gi),
    (match) => parseNumber(match[1]),
  ).filter((value) => Number.isFinite(value ?? Number.NaN) && value > 0);

  if (configurablePrices.length > 0) {
    return Math.min(...configurablePrices);
  }

  return undefined;
}

function extractJsonLdProduct(html) {
  const nodes = extractJsonLdNodes(html);
  return nodes.find((node) => {
    if (!node || typeof node !== "object") return false;
    const type = node["@type"];
    if (typeof type === "string") return type.toLowerCase() === "product";
    if (Array.isArray(type)) return type.some((item) => String(item).toLowerCase() === "product");
    return false;
  }) ?? null;
}

function mapWithConcurrency(items, concurrency, mapper) {
  if (items.length === 0) {
    return Promise.resolve([]);
  }

  const results = new Array(items.length);
  let cursor = 0;
  let completed = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;

      try {
        results[index] = await mapper(items[index], index);
      } catch (error) {
        results[index] = null;
        console.error(`[warn] ${items[index]?.url ?? "item"}: ${error.message}`);
      }

      completed += 1;
      if (completed % 20 === 0 || completed === items.length) {
        console.log(`[details] ${completed}/${items.length}`);
      }
    }
  });

  return Promise.all(workers).then(() => results);
}

async function enrichProduct(card) {
  const html = await fetchText(card.url, true);
  const jsonLdProduct = extractJsonLdProduct(html);

  const gallery = extractGalleryFromInitGallery(html, card.url);
  const mainImage = gallery[0] || (isGoodImage(card.image) ? card.image : "") || toAbsoluteUrl(jsonLdProduct?.image, card.url) || FALLBACK_IMAGE;
  const finalGallery = uniqueStrings([mainImage, ...gallery, card.image].filter(isGoodImage));

  const specs = extractSpecifications(html);
  const specsMap = new Map(specs.map((item) => [normalizeText(item.label), item.value]));

  const colorValue = specsMap.get("couleur") ?? specsMap.get("coloris") ?? "Unique";
  const sizeValue = specsMap.get("taille") ?? "Unique";

  const pagePrice = extractMainPriceFromConfig(html);
  const fallbackPrice = extractAnyPositivePrice(html);
  const listingPrice = Number.isFinite(card.finalPrice ?? Number.NaN) && card.finalPrice > 0 ? card.finalPrice : undefined;
  const price = listingPrice ?? pagePrice ?? fallbackPrice ?? parseNumber(jsonLdProduct?.offers?.price) ?? 0;

  const listingOldPrice = Number.isFinite(card.oldPrice ?? Number.NaN) && card.oldPrice > 0 ? card.oldPrice : undefined;
  const pageOldPrice = extractMainCompareAtPriceFromConfig(html, price);

  const name = extractMainName(html, card.name, jsonLdProduct);
  const description = normalizeDescriptionText(extractMainDescription(html, jsonLdProduct));
  const sku = extractMainSku(html, jsonLdProduct) || normalizeText(name);

  const slugRaw = new URL(card.url).pathname.split("/").filter(Boolean).at(-1) ?? normalizeText(name);
  const slug = normalizeText(slugRaw.replace(/\.html$/i, ""));

  const tags = uniqueStrings([
    ACTIVE_SUBCATEGORY_LABEL,
    SOURCE_NAME,
    card.brand,
    specsMap.get("type") ?? "",
    price > 0 && listingOldPrice && listingOldPrice > price ? "Promotion" : "Selection",
  ].filter(Boolean));

  return {
    id: `ep-${ACTIVE_SUBCATEGORY_SLUG}-${slug}`,
    name,
    slug,
    categorySlug: ACTIVE_CATEGORY_SLUG,
    subcategorySlug: ACTIVE_SUBCATEGORY_SLUG,
    subcategoryLabel: ACTIVE_SUBCATEGORY_LABEL,
    shortDescription: ACTIVE_SUBCATEGORY_LABEL,
    longDescription: description || `Produit selectionne depuis la categorie ${ACTIVE_SUBCATEGORY_LABEL} d'Espace Plaisir.`,
    price: Number(price.toFixed(2)),
    compareAtPrice:
      Number.isFinite((listingOldPrice ?? pageOldPrice) ?? Number.NaN) && (listingOldPrice ?? pageOldPrice) > price
        ? Number((listingOldPrice ?? pageOldPrice).toFixed(2))
        : undefined,
    rating: Number((card.rating ?? 4.4).toFixed(2)),
    reviewCount: Number.isFinite(card.reviewCount) ? card.reviewCount : 0,
    tags,
    colors: uniqueStrings(colorValue.split(/[,/]/).map((item) => cleanText(item))).slice(0, 10),
    sizes: uniqueStrings(sizeValue.split(/[,/]/).map((item) => cleanText(item))).slice(0, 10),
    stock: card.stock ?? 24,
    sku,
    image: mainImage,
    gallery: finalGallery.length > 0 ? finalGallery : [mainImage],
    specifications: specs,
  };
}

function sanitizeForJson(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForJson(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, sanitizeForJson(nested)]));
  }

  if (typeof value === "string") {
    return cleanText(value);
  }

  return value;
}

function isValidProductImage(product) {
  if (!product || typeof product !== "object") return false;

  const image = String(product.image ?? "").trim();
  if (!isGoodImage(image)) return false;

  const gallery = Array.isArray(product.gallery) ? product.gallery.map((item) => String(item ?? "").trim()).filter(isGoodImage) : [];
  if (gallery.length === 0) return false;

  return gallery.includes(image) || isGoodImage(image);
}

function ensureUniqueSlugs(productsList) {
  const usedSlugs = new Set();

  return productsList.map((product) => {
    const baseSlug = normalizeText(product.slug || product.name || "produit");
    const skuSuffix = normalizeText(product.sku || "").slice(0, 24);
    let uniqueSlug = baseSlug;
    let attempt = 0;

    while (usedSlugs.has(uniqueSlug)) {
      attempt += 1;
      const suffix = skuSuffix ? `${skuSuffix}-${attempt}` : `${attempt}`;
      uniqueSlug = `${baseSlug}-${suffix}`;
    }

    usedSlugs.add(uniqueSlug);

    const idPrefix = normalizeText(product.subcategorySlug || product.categorySlug || "catalogue");
    return {
      ...product,
      slug: uniqueSlug,
      id: `ep-${idPrefix}-${uniqueSlug}`,
    };
  });
}

async function main() {
  const root = process.cwd();
  const outputDir = path.join(root, "features", "source", "data");
  const productsPath = path.join(outputDir, "source-products.json");
  let categoryDumpPath = "";

  const limit = getArgNumber("--limit", DEFAULT_LIMIT);
  const concurrency = getArgNumber("--concurrency", DEFAULT_CONCURRENCY);

  const categoryUrl = getArgValue("--category-url") ?? DEFAULT_CATEGORY_URL;
  const categorySlug = getArgValue("--category-slug") ?? DEFAULT_CATEGORY_SLUG;
  const derivedSubcat = deriveSubcategorySlugFromUrl(categoryUrl);
  const subcategorySlug = getArgValue("--subcategory-slug") ?? derivedSubcat ?? DEFAULT_SUBCATEGORY_SLUG;
  const subcategoryLabel = getArgValue("--subcategory-label") ?? labelFromSlug(subcategorySlug) ?? DEFAULT_SUBCATEGORY_LABEL;

  ACTIVE_CATEGORY_URL = categoryUrl;
  ACTIVE_CATEGORY_SLUG = categorySlug;
  ACTIVE_SUBCATEGORY_SLUG = subcategorySlug;
  ACTIVE_SUBCATEGORY_LABEL = subcategoryLabel;
  categoryDumpPath = path.join(outputDir, `source-products-espace-${ACTIVE_SUBCATEGORY_SLUG}.json`);

  console.log(`[start] Scrape categorie ${ACTIVE_CATEGORY_URL} (limit=${limit}).`);
  const categoryRecords = await collectCategoryProducts(limit);
  console.log(`[info] Produits collectes en listing: ${categoryRecords.length}`);

  const enriched = await mapWithConcurrency(categoryRecords, concurrency, enrichProduct);
  const scrapedProducts = enriched.filter(Boolean);

  const finalScraped = [];
  const usedSlugs = new Set();

  for (const product of scrapedProducts) {
    if (!isValidProductImage(product)) {
      continue;
    }

    const baseSlug = normalizeText(product.slug || product.name || "produit");
    const skuSuffix = normalizeText(product.sku || "").slice(0, 24);
    let uniqueSlug = baseSlug;
    let attempt = 0;

    while (usedSlugs.has(uniqueSlug)) {
      attempt += 1;
      const suffix = skuSuffix ? `${skuSuffix}-${attempt}` : `${attempt}`;
      uniqueSlug = `${baseSlug}-${suffix}`;
    }

    usedSlugs.add(uniqueSlug);

    finalScraped.push({
      ...product,
      slug: uniqueSlug,
      id: `ep-${ACTIVE_SUBCATEGORY_SLUG}-${uniqueSlug}`,
    });

    if (finalScraped.length >= limit) {
      break;
    }
  }

  const existingProducts = JSON.parse(await fs.readFile(productsPath, "utf8"));

  const preservedProducts = existingProducts.filter((product) => {
    if (!isValidProductImage(product)) {
      return false;
    }

    const sameSubcat =
      product.subcategorySlug === ACTIVE_SUBCATEGORY_SLUG ||
      (Array.isArray(product.tags) && product.tags.some((tag) => normalizeText(tag) === ACTIVE_SUBCATEGORY_SLUG));

    return !sameSubcat;
  });

  const mergedProducts = ensureUniqueSlugs([...finalScraped, ...preservedProducts]);

  await fs.writeFile(categoryDumpPath, `${JSON.stringify(sanitizeForJson(finalScraped), null, 2)}\n`, "utf8");
  await fs.writeFile(productsPath, `${JSON.stringify(sanitizeForJson(mergedProducts), null, 2)}\n`, "utf8");

  console.log(`[done] ${finalScraped.length} produits scrapes sur ${ACTIVE_SUBCATEGORY_LABEL}.`);
  console.log(`[done] Catalogue merge: ${mergedProducts.length} produits valides (sans produits sans image).`);
}

main().catch((error) => {
  console.error(`Echec scrape categorie ${ACTIVE_CATEGORY_URL}:`, error);
  process.exit(1);
});









