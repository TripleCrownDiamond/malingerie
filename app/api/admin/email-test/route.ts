import { NextResponse } from "next/server";

import { getRequiredAdminUserId } from "@/lib/server/admin-auth";
import { sendInvoiceEmail } from "@/lib/server/mailer";

export const runtime = "nodejs";
export const maxDuration = 30;

async function requireAdmin() {
  try {
    await getRequiredAdminUserId();
    return null;
  } catch (error) {
    const code = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: "Acces admin requis" }, { status: code });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  const body = await request.json().catch(() => ({}));
  const to = typeof body.to === "string" && body.to.includes("@")
    ? body.to
    : process.env.ADMIN_NOTIFICATION_EMAIL || "contact@ma-petite-lingerie.com";

  const result = await sendInvoiceEmail({
    to,
    customerName: "Test Ma Petite Lingerie",
    reference: `TEST-${Date.now()}`,
    invoiceUrl: `${new URL(request.url).origin}/mentions-legales`,
    total: 1,
  });

  console.info("ADMIN_EMAIL_TEST_RESULT", { to, result });

  return NextResponse.json({ ok: result.status === "sent", to, result });
}
