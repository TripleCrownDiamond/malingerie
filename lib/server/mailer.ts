import nodemailer from "nodemailer";

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

function formatPrice(value: number) {
  return `${value.toFixed(2)} EUR`;
}

export async function sendInvoiceEmail({
  to,
  customerName,
  reference,
  invoiceUrl,
  total,
}: SendInvoiceEmailInput): Promise<SendInvoiceEmailResult> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !port || !user || !pass || !from) {
    return { status: "skipped", error: "SMTP_NON_CONFIGURE" };
  }

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
      to,
      subject: `Votre facture ${reference} - Ma Petite Lingerie`,
      text: [
        `Bonjour ${customerName},`,
        "",
        `Merci pour votre commande ${reference}.`,
        `Montant total: ${formatPrice(total)}`,
        `Facture: ${invoiceUrl}`,
        "",
        "A bientot,",
        "Ma Petite Lingerie",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:640px">
          <h2 style="margin-bottom:8px">Merci pour votre commande</h2>
          <p>Bonjour ${customerName},</p>
          <p>Votre commande <strong>${reference}</strong> a bien ete enregistree.</p>
          <p><strong>Montant total:</strong> ${formatPrice(total)}</p>
          <p>
            Vous pouvez consulter votre facture ici:<br />
            <a href="${invoiceUrl}" target="_blank" rel="noreferrer">${invoiceUrl}</a>
          </p>
          <p style="margin-top:24px">Ma Petite Lingerie</p>
        </div>
      `,
    });

    return { status: "sent" };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "EMAIL_SEND_FAILED",
    };
  }
}
