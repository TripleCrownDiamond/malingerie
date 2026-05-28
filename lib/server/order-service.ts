import { randomUUID } from "node:crypto";
import { promises as fsPromises } from "node:fs";
import path from "node:path";

import PDFDocument from "pdfkit/js/pdfkit.standalone";

import { legalCompanyProfile, legalContact } from "@/features/legal/data/legal-company";
import { readBankTransferConfig, readOrders, writeOrders } from "@/lib/server/config-store";
import { sendInvoiceEmail } from "@/lib/server/mailer";
import type { BankTransferConfig } from "@/types/admin";
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function drawTableHeader(doc: PDFKit.PDFDocument, y: number) {
  doc.fillColor("#ffffff").rect(50, y, 495, 24).fill("#e62e74");
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("Produit", 56, y + 8)
    .text("Qt", 308, y + 8)
    .text("Prix U", 356, y + 8)
    .text("Total", 452, y + 8);

  return y + 26;
}

export async function createInvoicePdfBuffer(order: OrderRecord, bankConfig: BankTransferConfig) {
  const logoPath = path.join(process.cwd(), "public", "logo-nav-femme.png");
  let hasLogo = false;

  try {
    await fsPromises.access(logoPath);
    hasLogo = true;
  } catch {
    hasLogo = false;
  }

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Facture ${order.invoiceNumber}`,
        Author: legalCompanyProfile.legalName,
        Subject: `Commande ${order.reference}`,
      },
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    if (hasLogo) {
      try {
        doc.image(logoPath, 50, 38, { fit: [120, 92] });
      } catch {
        // Ignore image read issues and continue without logo.
      }
    }

    doc
      .fillColor("#e62e74")
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("MA PETITE LINGERIE", 170, 50)
      .fontSize(10)
      .fillColor("#3f3f46")
      .font("Helvetica")
      .text("Facture client", 170, 78);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#111827")
      .text(`Facture: ${order.invoiceNumber}`, 340, 50, { width: 205, align: "right" })
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#374151")
      .text(`Commande: ${order.reference}`, 340, 68, { width: 205, align: "right" })
      .text(`Date: ${formatDate(order.createdAt)}`, 340, 84, { width: 205, align: "right" });

    doc.moveTo(50, 130).lineTo(545, 130).strokeColor("#f1d8e3").lineWidth(1).stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#e62e74")
      .text("Informations entreprise", 50, 145)
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#1f2937")
      .text(legalCompanyProfile.legalName, 50, 162)
      .text(legalCompanyProfile.legalForm, 50, 176)
      .text(`SIREN: ${legalCompanyProfile.siren}   SIRET: ${legalCompanyProfile.siret}`, 50, 190)
      .text(`TVA: ${legalCompanyProfile.vatNumber}`, 50, 204)
      .text(legalCompanyProfile.headOffice, 50, 218, { width: 230 })
      .text(`Contact: ${legalContact.email}`, 50, 246, { width: 230 });

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#e62e74")
      .text("Facture a", 300, 145)
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#111827")
      .text(order.customer.fullName, 300, 162)
      .fontSize(9)
      .fillColor("#374151")
      .text(order.customer.address, 300, 178, { width: 245 })
      .text(`${order.customer.postalCode} ${order.customer.city}`, 300, 194, { width: 245 })
      .text(order.customer.email, 300, 210, { width: 245 })
      .text(order.customer.phone, 300, 224, { width: 245 });

    let cursorY = 282;
    cursorY = drawTableHeader(doc, cursorY);

    doc.font("Helvetica").fontSize(9).fillColor("#1f2937");

    for (const item of order.items) {
      if (cursorY > doc.page.height - 190) {
        doc.addPage();
        cursorY = 50;
        cursorY = drawTableHeader(doc, cursorY);
        doc.font("Helvetica").fontSize(9).fillColor("#1f2937");
      }

      const rowTop = cursorY;
      const rowHeight = 22;
      const lineY = rowTop + rowHeight;

      doc.text(truncate(item.name, 58), 56, rowTop + 7, { width: 246, lineBreak: false });
      doc.text(String(item.quantity), 308, rowTop + 7, { width: 40 });
      doc.text(formatPrice(item.unitPrice), 356, rowTop + 7, { width: 84 });
      doc.text(formatPrice(item.unitPrice * item.quantity), 452, rowTop + 7, { width: 90, align: "right" });

      doc.moveTo(50, lineY).lineTo(545, lineY).strokeColor("#f4e4eb").lineWidth(1).stroke();
      cursorY += rowHeight;
    }

    if (cursorY > doc.page.height - 210) {
      doc.addPage();
      cursorY = 50;
    }

    const totalsY = cursorY + 20;

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#1f2937")
      .text("Sous-total", 360, totalsY)
      .text("Livraison", 360, totalsY + 18)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Total", 360, totalsY + 42)
      .font("Helvetica")
      .fontSize(10)
      .text(formatPrice(order.subtotal), 450, totalsY, { width: 92, align: "right" })
      .text(order.shipping === 0 ? "Offerte" : formatPrice(order.shipping), 450, totalsY + 18, {
        width: 92,
        align: "right",
      })
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(formatPrice(order.total), 450, totalsY + 42, { width: 92, align: "right" });

    let extraInfoY = totalsY + 78;

    if (order.paymentMethod === "bank_transfer") {
      if (extraInfoY > doc.page.height - 120) {
        doc.addPage();
        extraInfoY = 50;
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#e62e74")
        .text("Paiement par virement", 50, extraInfoY)
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#1f2937")
        .text(`Beneficiaire: ${bankConfig.beneficiary || legalCompanyProfile.legalName}`, 50, extraInfoY + 16)
        .text(`IBAN: ${bankConfig.iban || "A configurer"}`, 50, extraInfoY + 30)
        .text(`BIC: ${bankConfig.bic || "A configurer"}`, 50, extraInfoY + 44)
        .text(`Reference a indiquer: ${order.reference}`, 50, extraInfoY + 58)
        .text(`Delai de paiement: ${bankConfig.paymentWindowHours}h`, 50, extraInfoY + 72);

      if (bankConfig.instructions) {
        doc.text(`Instructions: ${truncate(bankConfig.instructions, 140)}`, 50, extraInfoY + 86, { width: 495 });
      }

      extraInfoY += 112;
    }

    if (extraInfoY > doc.page.height - 70) {
      doc.addPage();
      extraInfoY = 50;
    }

    doc.moveTo(50, extraInfoY + 6).lineTo(545, extraInfoY + 6).strokeColor("#f1d8e3").lineWidth(1).stroke();

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#6b7280")
      .text(
        `${legalCompanyProfile.legalName} - ${legalCompanyProfile.legalForm} - SIREN ${legalCompanyProfile.siren} - TVA ${legalCompanyProfile.vatNumber}`,
        50,
        extraInfoY + 14,
        { width: 495, align: "center" },
      )
      .text(`${legalCompanyProfile.headOffice} - ${legalContact.email}`, 50, extraInfoY + 26, {
        width: 495,
        align: "center",
      });

    doc.end();
  });
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

  const invoiceUrl = `${input.origin}/api/invoices/${order.id}`;

  order.invoiceUrl = invoiceUrl;

  orders.push(order);
  await writeOrders(orders);

  const emailResult = await Promise.race([
    sendInvoiceEmail({
      to: order.customer.email,
      customerName: order.customer.fullName,
      reference: order.reference,
      invoiceUrl,
      total: order.total,
    }),
    new Promise<{ status: "failed"; error: string }>((resolve) => {
      setTimeout(() => resolve({ status: "failed", error: "EMAIL_TIMEOUT" }), 8000);
    }),
  ]);

  order.emailStatus = emailResult.status;
  order.emailError = emailResult.error;

  try {
    await writeOrders(orders);
  } catch (error) {
    console.error("ORDER_EMAIL_STATUS_UPDATE_FAILED", error);
  }

  return order;
}
