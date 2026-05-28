import nodemailer from "nodemailer";
import { Resend } from "resend";

import { legalCompanyProfile, legalContact } from "@/features/legal/data/legal-company";

type SendInvoiceEmailInput = {
  to: string;
  customerName: string;
  reference: string;
  invoiceUrl: string;
  total: number;
};

type SendInvoiceEmailResult = {
  status: "sent" | "skipped" | "failed";
  error?: string;
};

type BuiltEmail = {
  from: string;
  customerSubject: string;
  customerText: string;
  customerHtml: string;
  adminSubject: string;
  adminText: string;
  adminHtml: string;
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

function normalizeSiteUrl(value?: string) {
  const fallback = "https://ma-petite-lingerie.com";
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/$/, "");
}

function buildCompanyInfoHtml() {
  return `
    <div style="margin-top:20px;padding:14px;border:1px solid #f1d8e3;border-radius:12px;background:#fff8fb;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#e62e74;">Informations entreprise</p>
      <p style="margin:2px 0;font-size:13px;"><strong>${escapeHtml(legalCompanyProfile.legalName)}</strong> - ${escapeHtml(legalCompanyProfile.legalForm)}</p>
      <p style="margin:2px 0;font-size:13px;">SIREN: ${escapeHtml(legalCompanyProfile.siren)} | SIRET: ${escapeHtml(legalCompanyProfile.siret)}</p>
      <p style="margin:2px 0;font-size:13px;">TVA: ${escapeHtml(legalCompanyProfile.vatNumber)}</p>
      <p style="margin:2px 0;font-size:13px;">Adresse: ${escapeHtml(legalCompanyProfile.headOffice)}</p>
      <p style="margin:2px 0;font-size:13px;">Contact: <a href="mailto:${escapeHtml(legalContact.email)}" style="color:#e62e74;text-decoration:underline;">${escapeHtml(legalContact.email)}</a></p>
    </div>
  `;
}

function buildCompanyInfoText() {
  return [
    "Informations entreprise:",
    `${legalCompanyProfile.legalName} - ${legalCompanyProfile.legalForm}`,
    `SIREN: ${legalCompanyProfile.siren}`,
    `SIRET: ${legalCompanyProfile.siret}`,
    `TVA: ${legalCompanyProfile.vatNumber}`,
    `Adresse: ${legalCompanyProfile.headOffice}`,
    `Contact: ${legalContact.email}`,
  ].join("\n");
}

function buildEmailPayload({
  to,
  customerName,
  reference,
  invoiceUrl,
  total,
}: SendInvoiceEmailInput): BuiltEmail {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || legalCompanyProfile.website);
  const logoUrl = `${siteUrl}/logo-ma-petite-lingerie.png`;
  const safeCustomerName = escapeHtml(customerName);
  const safeReference = escapeHtml(reference);
  const safeInvoiceUrl = escapeHtml(invoiceUrl);

  const from =
    process.env.RESEND_FROM ||
    process.env.SMTP_FROM ||
    "Ma Petite Lingerie <no-reply@ma-petite-lingerie.com>";

  const customerSubject = `Votre facture ${reference} - Ma Petite Lingerie`;
  const customerText = [
    `Bonjour ${customerName},`,
    "",
    `Merci pour votre commande ${reference}.`,
    `Montant total: ${formatPrice(total)}`,
    `Facture PDF: ${invoiceUrl}`,
    "",
    buildCompanyInfoText(),
    "",
    "A bientot,",
    "Ma Petite Lingerie",
  ].join("\n");

  const customerHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:680px;margin:0 auto;">
      <div style="padding:16px 0 8px;text-align:center;">
        <img src="${logoUrl}" alt="Ma Petite Lingerie" style="max-width:140px;height:auto;display:inline-block;" />
      </div>
      <div style="border:1px solid #f1d8e3;border-radius:16px;padding:20px;background:#ffffff;">
        <h2 style="margin:0 0 8px;color:#1a1a1a;">Merci pour votre commande</h2>
        <p style="margin:0 0 10px;">Bonjour ${safeCustomerName},</p>
        <p style="margin:0 0 10px;">Votre commande <strong>${safeReference}</strong> a bien ete enregistree.</p>
        <p style="margin:0 0 14px;"><strong>Montant total:</strong> ${formatPrice(total)}</p>
        <p style="margin:0 0 14px;">
          Votre facture PDF est disponible ici:<br />
          <a href="${safeInvoiceUrl}" target="_blank" rel="noreferrer" style="color:#e62e74;text-decoration:underline;">${safeInvoiceUrl}</a>
        </p>
        ${buildCompanyInfoHtml()}
      </div>
    </div>
  `;

  const adminSubject = `[Nouvelle commande] ${reference} - Ma Petite Lingerie`;
  const adminText = [
    "Nouvelle commande recue.",
    `Reference: ${reference}`,
    `Client: ${customerName}`,
    `Email client: ${to}`,
    `Montant total: ${formatPrice(total)}`,
    `Facture PDF: ${invoiceUrl}`,
    "",
    buildCompanyInfoText(),
  ].join("\n");

  const adminHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:680px;margin:0 auto;">
      <div style="padding:16px 0 8px;text-align:center;">
        <img src="${logoUrl}" alt="Ma Petite Lingerie" style="max-width:120px;height:auto;display:inline-block;" />
      </div>
      <div style="border:1px solid #f1d8e3;border-radius:16px;padding:20px;background:#ffffff;">
        <h2 style="margin:0 0 10px;color:#1a1a1a;">Notification admin - nouvelle commande</h2>
        <p style="margin:0 0 8px;"><strong>Reference:</strong> ${safeReference}</p>
        <p style="margin:0 0 8px;"><strong>Client:</strong> ${safeCustomerName}</p>
        <p style="margin:0 0 8px;"><strong>Email client:</strong> ${escapeHtml(to)}</p>
        <p style="margin:0 0 12px;"><strong>Montant total:</strong> ${formatPrice(total)}</p>
        <p style="margin:0 0 12px;">
          Facture PDF: <a href="${safeInvoiceUrl}" target="_blank" rel="noreferrer" style="color:#e62e74;text-decoration:underline;">${safeInvoiceUrl}</a>
        </p>
        ${buildCompanyInfoHtml()}
      </div>
    </div>
  `;

  return {
    from,
    customerSubject,
    customerText,
    customerHtml,
    adminSubject,
    adminText,
    adminHtml,
  };
}

async function sendViaResend({
  input,
  adminNotificationEmail,
}: {
  input: SendInvoiceEmailInput;
  adminNotificationEmail: string;
}): Promise<SendInvoiceEmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { status: "skipped", error: "RESEND_NON_CONFIGURE" };
  }

  const email = buildEmailPayload(input);
  const resend = new Resend(resendApiKey);

  try {
    const customerResult = await resend.emails.send({
      from: email.from,
      to: input.to,
      subject: email.customerSubject,
      text: email.customerText,
      html: email.customerHtml,
    });

    if (customerResult.error) {
      return { status: "failed", error: customerResult.error.message || "RESEND_CUSTOMER_SEND_FAILED" };
    }

    const adminResult = await resend.emails.send({
      from: email.from,
      to: adminNotificationEmail,
      subject: email.adminSubject,
      text: email.adminText,
      html: email.adminHtml,
    });

    if (adminResult.error) {
      return { status: "sent", error: `ADMIN_NOTIFICATION_FAILED: ${adminResult.error.message || "RESEND_ADMIN_SEND_FAILED"}` };
    }

    return { status: "sent" };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "RESEND_SEND_FAILED",
    };
  }
}

async function sendViaSmtp({
  input,
  adminNotificationEmail,
}: {
  input: SendInvoiceEmailInput;
  adminNotificationEmail: string;
}): Promise<SendInvoiceEmailResult> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !port || !user || !pass || !from) {
    return { status: "skipped", error: "SMTP_NON_CONFIGURE" };
  }

  const email = buildEmailPayload(input);

  try {
    const transport = nodemailer.createTransport({
      host,
      port: Number.parseInt(port, 10),
      secure: Number.parseInt(port, 10) === 465,
      auth: {
        user,
        pass,
      },
    });

    await transport.sendMail({
      from,
      to: input.to,
      subject: email.customerSubject,
      text: email.customerText,
      html: email.customerHtml,
    });

    let adminError: string | undefined;

    try {
      await transport.sendMail({
        from,
        to: adminNotificationEmail,
        subject: email.adminSubject,
        text: email.adminText,
        html: email.adminHtml,
      });
    } catch (error) {
      adminError = error instanceof Error ? error.message : "ADMIN_EMAIL_SEND_FAILED";
    }

    return adminError
      ? { status: "sent", error: `ADMIN_NOTIFICATION_FAILED: ${adminError}` }
      : { status: "sent" };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "EMAIL_SEND_FAILED",
    };
  }
}

export async function sendInvoiceEmail(input: SendInvoiceEmailInput): Promise<SendInvoiceEmailResult> {
  const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@ma-petite-lingerie.com";

  const resendResult = await sendViaResend({
    input,
    adminNotificationEmail,
  });

  if (resendResult.status === "sent") {
    return resendResult;
  }

  const smtpResult = await sendViaSmtp({
    input,
    adminNotificationEmail,
  });

  if (smtpResult.status === "sent") {
    return resendResult.error
      ? { status: "sent", error: `RESEND_FAILED_FALLBACK_SMTP_OK: ${resendResult.error}` }
      : smtpResult;
  }

  if (resendResult.status !== "skipped") {
    return resendResult;
  }

  return smtpResult;
}