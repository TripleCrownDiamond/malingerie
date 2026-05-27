import { NextResponse } from "next/server";

import { readBankTransferConfig } from "@/lib/server/config-store";

export async function GET() {
  const config = await readBankTransferConfig();
  return NextResponse.json({ ok: true, config });
}