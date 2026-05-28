import { promises as fs } from "node:fs";
import path from "node:path";

import { getSupabaseAdminClient, getSupabaseAppStateTable, getSupabaseInvoicesBucket } from "@/lib/server/supabase-admin";
import type { AdminConfig, BankTransferConfig, GoogleShoppingConfig } from "@/types/admin";
import type { OrderRecord } from "@/types/order";
import type { Product } from "@/types/shop";

export const filePaths = {
  adminConfig: path.join(/*turbopackIgnore: true*/ process.cwd(), "config", "admin.config.json"),
  bankTransferConfig: path.join(/*turbopackIgnore: true*/ process.cwd(), "config", "bank-transfer.config.json"),
  googleShoppingConfig: path.join(/*turbopackIgnore: true*/ process.cwd(), "config", "google-shopping.config.json"),
  sourceProducts: path.join(/*turbopackIgnore: true*/ process.cwd(), "features", "source", "data", "source-products.json"),
  orders: path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "orders.json"),
  invoicesDir: path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "invoices"),
};

const stateKeys = {
  adminConfig: "admin_config",
  bankTransferConfig: "bank_transfer_config",
  googleShoppingConfig: "google_shopping_config",
  sourceProducts: "source_products",
  orders: "orders",
} as const;

const remoteStoreTimeoutMs = 5000;

async function withTimeout<T>(promise: PromiseLike<T>, label: string, timeoutMs = remoteStoreTimeoutMs): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`${label}_TIMEOUT`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

const defaultAdminConfig: AdminConfig = {
  allowAnySignedInUser: true,
  adminUserIds: [],
};

const defaultBankTransferConfig: BankTransferConfig = {
  enabled: true,
  beneficiary: "MA PETITE LINGERIE SAS",
  iban: "",
  bic: "",
  bankName: "",
  referencePrefix: "MPL",
  paymentWindowHours: 72,
  instructions: "",
};

const defaultGoogleShoppingConfig: GoogleShoppingConfig = {
  enabled: true,
  currency: "EUR",
  country: "FR",
  language: "fr",
  brand: "Ma Petite Lingerie",
  condition: "new",
  defaultGoogleProductCategory: "1604",
  shipping: {
    country: "FR",
    service: "Standard",
    price: 7.9,
  },
};

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, payload: T) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const content = `${JSON.stringify(payload, null, 2)}\n`;
  await fs.writeFile(filePath, content, "utf8");
}

async function readAppState<T>(key: string): Promise<T | null> {
  const client = getSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const table = getSupabaseAppStateTable();

  const { data, error } = await withTimeout<{ data: { value: T } | null; error: unknown }>(
    client.from(table).select("value").eq("key", key).maybeSingle<{ value: T }>(),
    `SUPABASE_READ_${key}`,
  );

  if (error || !data) {
    return null;
  }

  return data.value;
}

async function writeAppState<T>(key: string, value: T) {
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error("SUPABASE_UNAVAILABLE");
  }

  const table = getSupabaseAppStateTable();

  const { error } = await withTimeout<{ error: unknown }>(
    client.from(table).upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    ),
    `SUPABASE_WRITE_${key}`,
  );

  if (error) {
    throw error;
  }
}

async function readWithFallback<T>({
  stateKey,
  filePath,
  fallback,
}: {
  stateKey: string;
  filePath: string;
  fallback: T;
}): Promise<T> {
  const remoteValue = await readAppState<T>(stateKey);
  if (remoteValue !== null) {
    return remoteValue;
  }

  const localValue = await readJsonFile<T>(filePath, fallback);

  try {
    await writeAppState(stateKey, localValue);
  } catch {
    // Keep local fallback without interrupting app runtime.
  }

  return localValue;
}

async function writeWithFallback<T>({
  stateKey,
  filePath,
  payload,
}: {
  stateKey: string;
  filePath: string;
  payload: T;
}) {
  try {
    await writeAppState(stateKey, payload);
    return;
  } catch {
    // If Supabase is not available yet, write locally as fallback.
  }

  await writeJsonFile(filePath, payload);
}

export async function readAdminConfig() {
  return readWithFallback<AdminConfig>({
    stateKey: stateKeys.adminConfig,
    filePath: filePaths.adminConfig,
    fallback: defaultAdminConfig,
  });
}

export async function writeAdminConfig(payload: AdminConfig) {
  await writeWithFallback({
    stateKey: stateKeys.adminConfig,
    filePath: filePaths.adminConfig,
    payload,
  });
}

export async function readBankTransferConfig() {
  return readWithFallback<BankTransferConfig>({
    stateKey: stateKeys.bankTransferConfig,
    filePath: filePaths.bankTransferConfig,
    fallback: defaultBankTransferConfig,
  });
}

export async function writeBankTransferConfig(payload: BankTransferConfig) {
  await writeWithFallback({
    stateKey: stateKeys.bankTransferConfig,
    filePath: filePaths.bankTransferConfig,
    payload,
  });
}

export async function readGoogleShoppingConfig() {
  return readWithFallback<GoogleShoppingConfig>({
    stateKey: stateKeys.googleShoppingConfig,
    filePath: filePaths.googleShoppingConfig,
    fallback: defaultGoogleShoppingConfig,
  });
}

export async function writeGoogleShoppingConfig(payload: GoogleShoppingConfig) {
  await writeWithFallback({
    stateKey: stateKeys.googleShoppingConfig,
    filePath: filePaths.googleShoppingConfig,
    payload,
  });
}

export async function readSourceProducts() {
  return readWithFallback<Product[]>({
    stateKey: stateKeys.sourceProducts,
    filePath: filePaths.sourceProducts,
    fallback: [],
  });
}

export async function writeSourceProducts(products: Product[]) {
  await writeWithFallback({
    stateKey: stateKeys.sourceProducts,
    filePath: filePaths.sourceProducts,
    payload: products,
  });
}

export async function readOrders() {
  return readWithFallback<OrderRecord[]>({
    stateKey: stateKeys.orders,
    filePath: filePaths.orders,
    fallback: [],
  });
}

export async function writeOrders(orders: OrderRecord[]) {
  await writeWithFallback({
    stateKey: stateKeys.orders,
    filePath: filePaths.orders,
    payload: orders,
  });
}

export async function storeInvoicePdf(fileName: string, content: Buffer, origin: string) {
  const client = getSupabaseAdminClient();

  if (client) {
    const bucket = getSupabaseInvoicesBucket();
    const storagePath = fileName;

    const { error } = await withTimeout<{ error: unknown }>(
      client.storage.from(bucket).upload(storagePath, content, {
        contentType: "application/pdf",
        upsert: true,
        cacheControl: "3600",
      }),
      "SUPABASE_INVOICE_UPLOAD",
    );

    if (!error) {
      const { data } = client.storage.from(bucket).getPublicUrl(storagePath);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }
  }

  await fs.mkdir(filePaths.invoicesDir, { recursive: true });
  const localPath = path.join(filePaths.invoicesDir, fileName);
  await fs.writeFile(localPath, content);
  return `${origin}/invoices/${fileName}`;
}
