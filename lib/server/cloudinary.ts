import crypto from "node:crypto";

const CLOUDINARY_API_BASE = "https://api.cloudinary.com/v1_1";
const CLOUDINARY_DELIVERY_BASE = "https://res.cloudinary.com";

export type CloudinaryUploadResult = {
  secureUrl: string;
  optimizedUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
};

type UploadInput = {
  file: Blob | string;
  publicId?: string;
  folder?: string;
};

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || "petitelingerie";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_CONFIG_MISSING");
  }

  return { cloudName, apiKey, apiSecret, uploadFolder };
}

function signCloudinaryParams(params: Record<string, string | number | boolean>, apiSecret: string) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export function isCloudinaryUrl(url: string) {
  return /^https:\/\/res\.cloudinary\.com\//i.test(url);
}

export function optimizeCloudinaryUrl(url: string) {
  if (!isCloudinaryUrl(url) || url.includes("/upload/f_auto,")) {
    return url;
  }

  return url.replace("/image/upload/", "/image/upload/f_auto,q_auto:eco,c_limit,w_1400/");
}

export function normalizeCloudinaryPublicId(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 160);
}

export async function uploadImageToCloudinary({ file, publicId, folder }: UploadInput): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret, uploadFolder } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const uploadFolderName = folder || uploadFolder;

  const signedParams: Record<string, string | number | boolean> = {
    folder: uploadFolderName,
    timestamp,
    overwrite: true,
  };

  if (publicId) {
    signedParams.public_id = normalizeCloudinaryPublicId(publicId);
  }

  const formData = new FormData();
  formData.set("file", file);
  formData.set("api_key", apiKey);
  formData.set("folder", String(signedParams.folder));
  formData.set("timestamp", String(timestamp));
  formData.set("overwrite", "true");

  if (signedParams.public_id) {
    formData.set("public_id", String(signedParams.public_id));
  }

  formData.set("signature", signCloudinaryParams(signedParams, apiSecret));

  const response = await fetch(`${CLOUDINARY_API_BASE}/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const json = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
    error?: { message?: string };
  };

  if (!response.ok || !json.secure_url || !json.public_id) {
    throw new Error(json.error?.message || "CLOUDINARY_UPLOAD_FAILED");
  }

  return {
    secureUrl: json.secure_url,
    optimizedUrl: optimizeCloudinaryUrl(json.secure_url),
    publicId: json.public_id,
    width: json.width,
    height: json.height,
    bytes: json.bytes,
    format: json.format,
  };
}

export function buildCloudinaryDeliveryUrl(publicId: string) {
  const { cloudName } = getCloudinaryConfig();
  return `${CLOUDINARY_DELIVERY_BASE}/${cloudName}/image/upload/f_auto,q_auto:eco,c_limit,w_1400/${publicId}`;
}
