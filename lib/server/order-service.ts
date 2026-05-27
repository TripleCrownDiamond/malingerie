import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { filePaths, readBankTransferConfig, readOrders, writeOrders } from "@/lib/server/config-store";
import { sendInvoiceEmail } from "@/lib/server/mailer";
import type { OrderCustomer, OrderDeliveryMethod, OrderPaymentMethod, OrderRecord } from "@/types/order";
import type { CartItem } from "@/types/shop";

type CreateOrderInput = {
  customer: OrderCustomer;
  items: CartItem[];
  paymentMethod: OrderPaymentMethod;
  deliveryMethod: OrderDeliveryMethod;
  subtotal: number;
  shipping: number;
  total: number;
  origin: string;
};

function formatPrice(value: number) {
  return `${value.toFixed(2)} EUR`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildInvoiceHtml(order: OrderRecord) {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #f1d8e3">${escapeHtml(item.name)}</td>
          <td style="padding:10px;border-bottom:1px solid #f1d8e3">${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #f1d8e3">${formatPrice(item.unitPrice)}</td>
          <td style="padding:10px;border-bottom:1px solid #f1d8e3">${formatPrice(item.unitPrice * item.quantity)}</td>
        </tr>
      `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Facture ${escapeHtml(order.invoiceNumber)}</title>
  </head>
  <body style="font-family:Arial,sans-serif;background:#fff7fa;color:#1a1a1a;padding:24px;">
    <main style="max-width:900px;margin:0 auto;background:white;border:1px solid #f3d7e2;border-radius:18px;padding:28px;">
      <header style="display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:24px;">
        <div>
          <h1 style="margin:0 0 8px;font-size:28px;color:#5b1c35;">Ma Petite Lingerie</h1>
          <p style="margin:0;font-size:13px;color:#6b5861;">Facture client</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:12px;color:#6b5861;">Facture</p>
          <p style="margin:4px 0 0;font-weight:700;">${escapeHtml(order.invoiceNumber)}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#6b5861;">Commande ${escapeHtml(order.reference)}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b5861;">${new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
        </div>
      </header>

      <section style="margin-bottom:20px;">
        <h2 style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#e62e74;margin:0 0 8px;">Client</h2>
        <p style="margin:0;">${escapeHtml(order.customer.fullName)}</p>
        <p style="margin:4px 0 0;">${escapeHtml(order.customer.address)}, ${escapeHtml(order.customer.postalCode)} ${escapeHtml(order.customer.city)}</p>
        <p style="margin:4px 0 0;">${escapeHtml(order.customer.email)} - ${escapeHtml(order.customer.phone)}</p>
      </section>

      <table style="width:100%;border-collapse:collapse;background:#fff;">
        <thead>
          <tr>
            <th style="text-align:left;padding:10px;border-bottom:2px solid #f1d8e3;">Produit</th>
            <th style="text-align:left;padding:10px;border-bottom:2px solid #f1d8e3;">Qt</th>
            <th style="text-align:left;padding:10px;border-bottom:2px solid #f1d8e3;">Prix U</th>
            <th style="text-align:left;padding:10px;border-bottom:2px solid #f1d8e3;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <section style="margin-top:18px;display:flex;justify-content:flex-end;">
        <div style="min-width:260px;">
          <p style="display:flex;justify-content:space-between;margin:4px 0;"><span>Sous-total</span><strong>${formatPrice(order.subtotal)}</strong></p>
          <p style="display:flex;justify-content:space-between;margin:4px 0;"><span>Livraison</span><strong>${order.shipping === 0 ? "Offerte" : formatPrice(order.shipping)}</strong></p>
          <p style="display:flex;justify-content:space-between;margin:12px 0 0;padding-top:10px;border-top:1px solid #f1d8e3;"><span>Total</span><strong>${formatPrice(order.total)}</strong></p>
        </div>
      </section>
    </main>
  </body>
</html>
`;
}

export async function createOrder(input: CreateOrderInput) {
  const orders = await readOrders();
  const bankConfig = await readBankTransferConfig();

  const now = new Date();
  const year = now.getFullYear();
  const prefix = bankConfig.referencePrefix || "MPL";
  const reference = `${prefix}-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
  const invoiceNumber = `INV-${year}-${String(orders.length + 1).padStart(5, "0")}`;

  const order: OrderRecord = {
    id: randomUUID(),
    reference,
    invoiceNumber,
    invoiceUrl: "",
    createdAt: now.toISOString(),
    status: input.paymentMethod === "bank_transfer" ? "pending_payment" : "paid",
    paymentMethod: input.paymentMethod,
    deliveryMethod: input.deliveryMethod,
    customer: input.customer,
    items: input.items,
    subtotal: input.subtotal,
    shipping: input.shipping,
    total: input.total,
    emailStatus: "skipped",
  };

  await fs.mkdir(filePaths.invoicesDir, { recursive: true });
  const invoiceFileName = `${order.invoiceNumber}.html`;
  const invoiceFilePath = path.join(filePaths.invoicesDir, invoiceFileName);
  const invoiceUrl = `${input.origin}/invoices/${invoiceFileName}`;

  order.invoiceUrl = invoiceUrl;

  const invoiceHtml = buildInvoiceHtml(order);
  await fs.writeFile(invoiceFilePath, invoiceHtml, "utf8");

  const emailResult = await sendInvoiceEmail({
    to: order.customer.email,
    customerName: order.customer.fullName,
    reference: order.reference,
    invoiceUrl,
    total: order.total,
  });

  order.emailStatus = emailResult.status;
  order.emailError = emailResult.error;

  orders.push(order);
  await writeOrders(orders);

  return order;
}
