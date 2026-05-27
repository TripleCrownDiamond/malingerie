import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequiredAdminUserId } from "@/lib/server/admin-auth";
import { readGoogleShoppingConfig, writeGoogleShoppingConfig } from "@/lib/server/config-store";

const googleShoppingSchema = z.object({
  enabled: z.boolean(),
  currency: z.string().min(3),
  country: z.string().min(2),
  language: z.string().min(2),
  brand: z.string().min(2),
  condition: z.enum(["new", "used", "refurbished"]),
  defaultGoogleProductCategory: z.string().min(2),
  shipping: z.object({
    country: z.string().min(2),
    service: z.string().min(2),
    price: z.coerce.number().nonnegative(),
  }),
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

  const config = await readGoogleShoppingConfig();
  return NextResponse.json({ ok: true, config });
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) {
    return authError;
  }

  try {
    const payload = googleShoppingSchema.parse(await request.json());
    await writeGoogleShoppingConfig(payload);
    return NextResponse.json({ ok: true, config: payload });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Configuration invalide", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: "Impossible de sauvegarder la config" }, { status: 500 });
  }
}