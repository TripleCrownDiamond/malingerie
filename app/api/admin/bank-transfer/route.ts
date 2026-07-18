import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequiredAdminUserId } from "@/lib/server/admin-auth";
import { readBankTransferConfig, writeBankTransferConfig } from "@/lib/server/config-store";

const bankTransferSchema = z.object({
  enabled: z.boolean(),
  beneficiary: z.string().min(2),
  iban: z.string().min(10),
  bic: z.string().min(4),
  bankName: z.string().min(2),
  referencePrefix: z.string().min(2),
  paymentWindowHours: z.coerce.number().int().positive(),
  instructions: z.string().min(4),
  phone: z.string().min(6),
});

async function requireAdmin() {
  try {
    await getRequiredAdminUserId();
    return null;
  } catch (error) {
    const code = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: "Acces admin requis" }, { status: code });
  }
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  const config = await readBankTransferConfig();
  return NextResponse.json({ ok: true, config });
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  try {
    const payload = bankTransferSchema.parse(await request.json());
    await writeBankTransferConfig(payload);
    return NextResponse.json({ ok: true, config: payload });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Configuration invalide", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: "Impossible de sauvegarder la config" }, { status: 500 });
  }
}