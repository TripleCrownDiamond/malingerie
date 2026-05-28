import { NextResponse } from "next/server";

import { getRequiredAdminUserId } from "@/lib/server/admin-auth";
import { readOrders } from "@/lib/server/config-store";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function buildSearchIndex(order: Awaited<ReturnType<typeof readOrders>>[number]) {
  return [order.reference, order.customer.fullName, order.customer.email].join(" ").toLowerCase();
}

export async function GET(request: Request) {
  try {
    await getRequiredAdminUserId();
  } catch (error) {
    const code = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: "Acces admin requis" }, { status: code });
  }

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const status = (url.searchParams.get("status") ?? "all").trim().toLowerCase();

  const page = parsePositiveInt(url.searchParams.get("page"), 1);
  const limit = Math.min(100, parsePositiveInt(url.searchParams.get("limit"), 20));

  const orders = await readOrders();
  const sortedOrders = [...orders].reverse();

  const paidOrders = orders.filter((order) => order.status === "paid");
  const pendingOrders = orders.filter((order) => order.status === "pending_payment");

  const stats = {
    totalOrders: orders.length,
    paidOrders: paidOrders.length,
    pendingOrders: pendingOrders.length,
    paidRevenue: paidOrders.reduce((sum, order) => sum + order.total, 0),
    grossRevenue: orders.reduce((sum, order) => sum + order.total, 0),
  };

  const filteredOrders = sortedOrders.filter((order) => {
    if (status !== "all" && order.status.toLowerCase() !== status) {
      return false;
    }

    if (!query) {
      return true;
    }

    return buildSearchIndex(order).includes(query);
  });

  const total = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const paginatedOrders = filteredOrders.slice(start, start + limit);

  return NextResponse.json({
    ok: true,
    orders: paginatedOrders,
    stats,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  });
}
