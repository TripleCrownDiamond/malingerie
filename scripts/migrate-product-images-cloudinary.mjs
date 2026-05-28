import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const useSupabase = args.has("--supabase");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number.parseInt(limitArg.split("=")[1] || "0", 10) : Number.POSITIVE_INFINITY;

const root = process.cwd();
const productsPath = path.join(root, "features", "source", "data", "source-products.json");
const backupDir = path.join(root, "data");
const backupPath = path.join(backupDir, "cloudinary-image-backup.json");
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "petitelingerie";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appStateTable = process.env.SUPABASE_APP_STATE_TABLE || "app_state";
const appStateKey = "source_products";

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Cloudinary config missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
  process.exit(1);
}

function signParams(params) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function isCloudinaryUrl(url) {
  return /^https:\/\/res\.cloudinary\.com\//i.test(url);
}

function optimizeCloudinaryUrl(url) {
  if (!isCloudinaryUrl(url) || url.includes("/upload/f_auto,")) return url;
  return url.replace("/image/upload/", "/image/upload/f_auto,q_auto:eco,c_limit,w_1400/");
}

function toPublicId(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 160);
}

function hashUrl(url) {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 12);
}

async function readProducts() {
  if (useSupabase && supabaseUrl && supabaseServiceRoleKey) {
    const client = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
    const { data, error } = await client.from(appStateTable).select("value").eq("key", appStateKey).maybeSingle();
    if (!error && data?.value && Array.isArray(data.value)) {
      console.log(`[source] Supabase app_state.${appStateKey}: ${data.value.length} produits`);
      return { products: data.value, client };
    }
    if (error) console.warn(`[warn] Lecture Supabase impossible, fallback fichier: ${error.message}`);
  }

  const products = JSON.parse(await fs.readFile(productsPath, "utf8"));
  console.log(`[source] Fichier local: ${products.length} produits`);
  return { products, client: null };
}

async function writeProducts(products, client) {
  await fs.writeFile(productsPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");
  console.log(`[write] Fichier local mis a jour: ${productsPath}`);

  if (useSupabase && client) {
    const { error } = await client.from(appStateTable).upsert(
      { key: appStateKey, value: products, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    if (error) throw error;
    console.log(`[write] Supabase app_state.${appStateKey} mis a jour`);
  }
}

async function readBackupMap() {
  try {
    const content = await fs.readFile(backupPath, "utf8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeBackupMap(mapping) {
  await fs.mkdir(backupDir, { recursive: true });
  await fs.writeFile(backupPath, `${JSON.stringify(mapping, null, 2)}\n`, "utf8");
  console.log(`[backup] Mapping sauvegarde: ${backupPath}`);
}

async function uploadRemoteImage(url, publicId) {
  if (!url || isCloudinaryUrl(url) || url.startsWith("/")) return optimizeCloudinaryUrl(url);

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder,
    timestamp,
    overwrite: true,
    public_id: toPublicId(publicId),
  };

  const formData = new FormData();
  formData.set("file", url);
  formData.set("api_key", apiKey);
  formData.set("folder", folder);
  formData.set("timestamp", String(timestamp));
  formData.set("overwrite", "true");
  formData.set("public_id", params.public_id);
  formData.set("signature", signParams(params));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const json = await response.json();
  if (!response.ok || !json.secure_url) {
    throw new Error(json?.error?.message || `Cloudinary upload failed (${response.status})`);
  }
  return optimizeCloudinaryUrl(json.secure_url);
}

async function main() {
  const { products, client } = await readProducts();
  const backupMap = await readBackupMap();
  let processedImages = 0;
  let uploadedImages = 0;
  let failedImages = 0;

  console.log(shouldApply ? "[mode] APPLY: les URLs produits seront remplacees." : "[mode] BACKUP: aucun produit ne sera modifie.");

  for (const product of products) {
    const images = Array.from(new Set([product.image, ...(Array.isArray(product.gallery) ? product.gallery : [])].filter(Boolean)));
    const migrated = [];

    for (const [index, imageUrl] of images.entries()) {
      if (processedImages >= limit) break;
      processedImages += 1;

      if (backupMap[imageUrl]) {
        migrated.push(backupMap[imageUrl]);
        continue;
      }

      try {
        const cloudinaryUrl = await uploadRemoteImage(
          imageUrl,
          `${product.categorySlug || "produits"}/${product.slug || product.id}-${index + 1}-${hashUrl(imageUrl)}`,
        );
        backupMap[imageUrl] = cloudinaryUrl;
        migrated.push(cloudinaryUrl);
        if (cloudinaryUrl !== imageUrl) uploadedImages += 1;
        console.log(`[ok] ${processedImages} ${product.slug || product.id} image ${index + 1}`);
      } catch (error) {
        failedImages += 1;
        migrated.push(imageUrl);
        console.warn(`[fail] ${product.slug || product.id}: ${error instanceof Error ? error.message : error}`);
      }
    }

    if (shouldApply && migrated.length > 0) {
      product.image = backupMap[product.image] || product.image;
      product.gallery = images.map((imageUrl) => backupMap[imageUrl] || imageUrl);
    }

    if (processedImages >= limit) break;
  }

  await writeBackupMap(backupMap);

  if (shouldApply) {
    await writeProducts(products, client);
  }

  console.log(`[done] ${processedImages} images traitees, ${uploadedImages} uploadees, ${failedImages} echecs.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
