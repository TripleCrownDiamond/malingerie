import { NextResponse } from "next/server";
import { z } from "zod";

import { createOrder } from "@/lib/server/order-service";

const createOrderSchema = z.object({
  customer: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    address: z.string().min(4),
    city: z.string().min(2),
    postalCode: z.string().min(2),
  }),
  items: z
    .array(
      z.object({
        productId: z.string(),
        slug: z.string(),
        name: z.string(),
        image: z.string(),
        unitPrice: z.number().nonnegative(),
        quantity: z.number().int().positive(),
        size: z.string(),
        color: z.string(),
      }),
    )
    .min(1),
  paymentMethod: z.enum(["bank_transfer", "card"]),
  deliveryMethod: z.enum(["standard", "express"]),
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

function getOrigin(request: Request) {
  const url = new URL(request.url);
  return url.origin;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = createOrderSchema.parse(body);

    const order = await createOrder({
      ...payload,
      origin: getOrigin(request),
    });

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Payload commande invalide",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("ORDER_CREATE_FAILED", error);

    return NextResponse.json({ ok: false, error: "Impossible d'enregistrer la commande" }, { status: 500 });
  }
}
