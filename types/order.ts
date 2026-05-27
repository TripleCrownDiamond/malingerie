import type { CartItem } from "@/types/shop";

export type OrderPaymentMethod = "bank_transfer" | "card";
export type OrderDeliveryMethod = "standard" | "express";

export type OrderCustomer = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
};

export type OrderEmailStatus = "sent" | "skipped" | "failed";

export type OrderRecord = {
  id: string;
  reference: string;
  invoiceNumber: string;
  invoiceUrl: string;
  createdAt: string;
  status: "pending_payment" | "paid";
  paymentMethod: OrderPaymentMethod;
  deliveryMethod: OrderDeliveryMethod;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  emailStatus: OrderEmailStatus;
  emailError?: string;
};
