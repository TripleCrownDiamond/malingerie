import { promises as fs } from "node:fs";
import path from "node:path";

import type { AdminConfig, BankTransferConfig, GoogleShoppingConfig } from "@/types/admin";
import type { OrderRecord } from "@/types/order";
import type { Product } from "@/types/shop";

const rootDir = process.cwd();

export const filePaths = {
  adminConfig: path.join(rootDir, "config", "admin.config.json"),
  bankTransferConfig: path.join(rootDir, "config", "bank-transfer.config.json"),
  googleShoppingConfig: path.join(rootDir, "config", "google-shopping.config.json"),
  sourceProducts: path.join(rootDir, "features", "source", "data", "source-products.json"),
  orders: path.join(rootDir, "data", "orders.json"),
  invoicesDir: path.join(rootDir, "public", "invoices"),
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

export async function readAdminConfig() {
  return readJsonFile<AdminConfig>(filePaths.adminConfig, {
    allowAnySignedInUser: true,
    adminUserIds: [],
  });
}

export async function writeAdminConfig(payload: AdminConfig) {
  await writeJsonFile(filePaths.adminConfig, payload);
}

export async function readBankTransferConfig() {
  return readJsonFile<BankTransferConfig>(filePaths.bankTransferConfig, {
    enabled: true,
    beneficiary: "MA PETITE LINGERIE SAS",
    iban: "",
    bic: "",
    bankName: "",
    referencePrefix: "MPL",
    paymentWindowHours: 72,
    instructions: "",
  });
}

export async function writeBankTransferConfig(payload: BankTransferConfig) {
  await writeJsonFile(filePaths.bankTransferConfig, payload);
}

export async function readGoogleShoppingConfig() {
  return readJsonFile<GoogleShoppingConfig>(filePaths.googleShoppingConfig, {
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
  });
}

export async function writeGoogleShoppingConfig(payload: GoogleShoppingConfig) {
  await writeJsonFile(filePaths.googleShoppingConfig, payload);
}

export async function readSourceProducts() {
  return readJsonFile<Product[]>(filePaths.sourceProducts, []);
}

export async function writeSourceProducts(products: Product[]) {
  await writeJsonFile(filePaths.sourceProducts, products);
}

export async function readOrders() {
  return readJsonFile<OrderRecord[]>(filePaths.orders, []);
}

export async function writeOrders(orders: OrderRecord[]) {
  await writeJsonFile(filePaths.orders, orders);
}
