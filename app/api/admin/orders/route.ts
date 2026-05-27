import { NextResponse } from "next/server";

import { getRequiredAdminUserId } from "@/lib/server/admin-auth";
import { readOrders } from "@/lib/server/config-store";

export async function GET() {
  try {
    await getRequiredAdminUserId();
  } catch (error) {
    const code = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: "Acces admin requis" }, { status: code });
  }

  const orders = await readOrders();
  return NextResponse.json({ ok: true, orders: orders.slice(-200).reverse() });
}
