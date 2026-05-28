import { NextResponse } from "next/server";

import { readBankTransferConfig, readOrders } from "@/lib/server/config-store";
import { createInvoicePdfBuffer } from "@/lib/server/order-service";

type InvoiceRouteParams = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_request: Request, { params }: InvoiceRouteParams) {
  const { orderId } = await params;
  const orders = await readOrders();
  const order = orders.find(
    (item) => item.id === orderId || item.reference === orderId || item.invoiceNumber === orderId,
  );

  if (!order) {
    return NextResponse.json({ ok: false, error: "Facture introuvable" }, { status: 404 });
  }

  const bankConfig = await readBankTransferConfig();
  const pdf = await createInvoicePdfBuffer(order, bankConfig);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${order.invoiceNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
