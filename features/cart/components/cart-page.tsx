"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useCartStore } from "@/features/cart/store/cart-store";
import type { BankTransferConfig } from "@/types/admin";
import type { CartItem } from "@/types/shop";

type CheckoutStep = "panier" | "informations" | "paiement";
type DeliveryMethod = "standard" | "express";
type PaymentMethod = "bank_transfer";

type CustomerForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
};

type CompletedOrder = {
  reference: string;
  invoiceUrl: string;
  createdAt: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  customer: CustomerForm;
  items: CartItem[];
  emailStatus: "sent" | "skipped" | "failed";
  emailError?: string;
  emailProvider?: "resend" | "smtp";
  customerEmailStatus?: "sent" | "skipped" | "failed";
  adminEmailStatus?: "sent" | "skipped" | "failed";
  customerEmailError?: string;
  adminEmailError?: string;
  customerEmailMessageId?: string;
  adminEmailMessageId?: string;
};

const checkoutSteps: Array<{ id: CheckoutStep; label: string }> = [
  { id: "panier", label: "Panier" },
  { id: "informations", label: "Infos" },
  { id: "paiement", label: "Paiement" },
];

const nextStepByStep: Record<CheckoutStep, CheckoutStep | null> = {
  panier: "informations",
  informations: "paiement",
  paiement: null,
};

const prevStepByStep: Record<CheckoutStep, CheckoutStep | null> = {
  panier: null,
  informations: "panier",
  paiement: "informations",
};

const ctaByStep: Record<Exclude<CheckoutStep, "paiement">, string> = {
  panier: "Continuer",
  informations: "Passer au paiement",
};

const defaultBankConfig: BankTransferConfig = {
  enabled: true,
  beneficiary: "MA PETITE LINGERIE SAS",
  iban: "FR76 3000 4000 5000 6000 7000 891",
  bic: "BNPAFRPPXXX",
  bankName: "BNP Paribas",
  referencePrefix: "MPL",
  paymentWindowHours: 72,
  instructions: "Indiquez la reference de commande dans le motif de virement.",
};

function formatPrice(value: number) {
  return `${value.toFixed(2)} EUR`;
}

function getDeliveryPrice(method: DeliveryMethod, subtotal: number) {
  if (method === "express") {
    return 11.9;
  }

  return subtotal >= 120 ? 0 : 7.9;
}

function getPaymentLabel(method: PaymentMethod) {
  return method === "bank_transfer" ? "Virement bancaire" : "Carte bancaire";
}

function getDeliveryLabel(method: DeliveryMethod) {
  return method === "express" ? "Express 3-7 jours" : "Standard 3-7 jours";
}

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.subtotal());

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("panier");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [bankConfig, setBankConfig] = useState<BankTransferConfig>(defaultBankConfig);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [customer, setCustomer] = useState<CustomerForm>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    let mounted = true;

    fetch("/api/payment/bank-transfer", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (mounted && data?.config) {
          setBankConfig(data.config as BankTransferConfig);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const shipping = getDeliveryPrice(deliveryMethod, subtotal);
  const total = subtotal + shipping;

  function updateCustomerField(field: keyof CustomerForm, value: string) {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  }

  function validateInformations() {
    if (!customer.fullName.trim()) {
      return "Le nom complet est obligatoire.";
    }
    if (!customer.email.trim() || !/^\S+@\S+\.\S+$/.test(customer.email)) {
      return "Merci de renseigner une adresse email valide.";
    }
    if (!customer.phone.trim()) {
      return "Le numero de telephone est obligatoire.";
    }
    if (customer.address.trim().length < 6) {
      return "Merci de renseigner une adresse de livraison complete.";
    }
    if (!/\d/.test(customer.address)) {
      return "L'adresse doit inclure un numero de voirie (ex: 12 rue des Fleurs).";
    }
    if (customer.city.trim().length < 2) {
      return "Merci de renseigner la ville de livraison.";
    }
    if (!/^\d{5}$/.test(customer.postalCode.trim())) {
      return "Merci de renseigner un code postal valide (5 chiffres).";
    }

    return null;
  }

  async function goNext() {
    if (isStepTransitioning || isSubmittingOrder) {
      return;
    }

    setError(null);

    if (currentStep === "panier" && items.length === 0) {
      setError("Ton panier est vide. Ajoute au moins un produit pour continuer.");
      return;
    }

    if (currentStep === "informations") {
      const validationError = validateInformations();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    const nextStep = nextStepByStep[currentStep];
    if (!nextStep) {
      return;
    }

    setIsStepTransitioning(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 220));
      setCurrentStep(nextStep);
    } finally {
      setIsStepTransitioning(false);
    }
  }

  function goBack() {
    setError(null);
    const previousStep = prevStepByStep[currentStep];
    if (previousStep) {
      setCurrentStep(previousStep);
    }
  }

  async function submitOrder() {
    if (isSubmittingOrder) {
      return;
    }

    setError(null);

    const validationError = validateInformations();
    if (validationError) {
      setError(validationError);
      setCurrentStep("informations");
      return;
    }

    if (!bankConfig.enabled) {
      setError("Le virement bancaire est desactive. Active-le dans la configuration admin.");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items,
          paymentMethod,
          deliveryMethod,
          subtotal,
          shipping,
          total,
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        order?: CompletedOrder;
      };

      if (!response.ok || !payload.order) {
        setError(payload.error ?? "Impossible d'enregistrer la commande.");
        return;
      }

      setCompletedOrder(payload.order);
      clearCart();
      setCurrentStep("panier");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  if (completedOrder) {
    return (
      <div className="rounded-3xl border border-[var(--line)] bg-white p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Commande confirmee</p>
        <h1 className="mt-2 font-display text-4xl text-[var(--ink)]">Merci pour votre commande</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Reference: <span className="font-semibold text-[var(--ink)]">{completedOrder.reference}</span> - {completedOrder.createdAt}
        </p>

        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Votre commande est en attente de paiement.</p>
          <p className="mt-1">Elle ne sera preparee et expediee qu&apos;apres reception du paiement par virement.</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[var(--line)] bg-[var(--paper)]/70 p-4 text-sm text-[var(--muted)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Client</p>
            <p className="mt-2 text-[var(--ink)]">{completedOrder.customer.fullName}</p>
            <p>{completedOrder.customer.email}</p>
            <p>{completedOrder.customer.phone}</p>
            <p className="mt-2">
              {completedOrder.customer.address}, {completedOrder.customer.postalCode} {completedOrder.customer.city}, France
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--line)] bg-[var(--paper)]/70 p-4 text-sm text-[var(--muted)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Paiement et livraison</p>
            <p className="mt-2">Paiement: {getPaymentLabel(completedOrder.paymentMethod)}</p>
            <p>Livraison: {getDeliveryLabel(completedOrder.deliveryMethod)}</p>
            <p className="mt-3 font-semibold text-[var(--ink)]">Total: {formatPrice(completedOrder.total)}</p>
          </article>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--accent-soft)]/30 p-4 text-sm text-[var(--ink)]">
          <p className="font-semibold uppercase tracking-[0.12em]">Virement bancaire</p>
          <p className="mt-2">Beneficiaire: {bankConfig.beneficiary}</p>
          <p>IBAN: {bankConfig.iban}</p>
          <p>BIC: {bankConfig.bic}</p>
          <p>Banque: {bankConfig.bankName}</p>
          <p className="mt-2 text-xs">
            {bankConfig.instructions} Reference: {completedOrder.reference}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
          <p>
            Facture: <a href={completedOrder.invoiceUrl} target="_blank" rel="noreferrer" className="font-semibold text-[var(--accent)] underline">Voir la facture</a>
          </p>
          <p className="mt-2">
            Envoi email client: {completedOrder.emailStatus === "sent" ? "envoye" : completedOrder.emailStatus === "skipped" ? "non configure" : "echec"}
          </p>
          {completedOrder.emailProvider || completedOrder.emailError ? (
            <div className="mt-2 space-y-1 break-words text-xs text-[var(--muted)]">
              {completedOrder.emailProvider ? <p>Service: {completedOrder.emailProvider}</p> : null}
              <p>Client: {completedOrder.customerEmailStatus ?? completedOrder.emailStatus}{completedOrder.customerEmailError ? ` - ${completedOrder.customerEmailError}` : null}</p>
              <p>Admin: {completedOrder.adminEmailStatus ?? completedOrder.emailStatus}{completedOrder.adminEmailError ? ` - ${completedOrder.adminEmailError}` : null}</p>
              {completedOrder.emailError ? <p>Detail: {completedOrder.emailError}</p> : null}
            </div>
          ) : null}
          {completedOrder.customerEmailMessageId || completedOrder.adminEmailMessageId ? (
            <p className="mt-1 break-words text-xs text-[var(--muted)]">
              ID client: {completedOrder.customerEmailMessageId ?? "-"} | ID admin: {completedOrder.adminEmailMessageId ?? "-"}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/catalogue"
            className="rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)]"
          >
            Continuer mes achats
          </Link>
          <button
            type="button"
            onClick={() => setCompletedOrder(null)}
            className="rounded-full border border-[var(--line)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]"
          >
            Nouveau checkout
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--line)] bg-white p-10 text-center">
        <h1 className="font-display text-4xl text-[var(--ink)]">Panier vide</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Ajoute quelques pieces de la collection premium pour continuer.</p>
        <Link
          href="/catalogue"
          className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)]"
        >
          Retour catalogue
        </Link>
      </div>
    );
  }

  const currentStepIndex = checkoutSteps.findIndex((step) => step.id === currentStep);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <ol className="grid grid-cols-3 gap-2">
          {checkoutSteps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <li
                key={step.id}
                className={`rounded-xl border px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]/45 text-[var(--ink)]"
                    : isCompleted
                      ? "border-[var(--accent)]/50 bg-white text-[var(--accent)]"
                      : "border-[var(--line)] bg-white text-[var(--muted)]"
                }`}
              >
                {step.label}
              </li>
            );
          })}
        </ol>

        {currentStep === "panier" ? (
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={`${item.productId}-${item.size}-${item.color}`}
                className="grid grid-cols-[110px_1fr] gap-4 rounded-3xl border border-[var(--line)] bg-white/85 p-4"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--line)]">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="120px" />
                </div>

                <div className="space-y-3">
                  <Link href={`/produit/${item.slug}`} className="font-display text-2xl text-[var(--ink)]">
                    {item.name}
                  </Link>
                  <p className="text-sm text-[var(--muted)]">
                    {item.color} - {item.size}
                  </p>
                  <p className="text-sm font-semibold text-[var(--ink)]">{formatPrice(item.unitPrice)}</p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      className="h-8 w-8 rounded-full border border-[var(--line)] text-[var(--ink)]"
                    >
                      -
                    </button>
                    <span className="min-w-8 text-center text-sm text-[var(--ink)]">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      className="h-8 w-8 rounded-full border border-[var(--line)] text-[var(--ink)]"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      className="ml-2 text-xs uppercase tracking-[0.2em] text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {currentStep === "informations" ? (
          <section className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Informations de livraison</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Checkout simplifie: uniquement les champs essentiels.</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2">
                <span>Nom complet *</span>
                <input
                  value={customer.fullName}
                  onChange={(event) => updateCustomerField("fullName", event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--muted)]">
                <span>Email *</span>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(event) => updateCustomerField("email", event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--muted)]">
                <span>Telephone *</span>
                <input
                  value={customer.phone}
                  onChange={(event) => updateCustomerField("phone", event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2">
                <span>Adresse *</span>
                <input
                  value={customer.address}
                  onChange={(event) => updateCustomerField("address", event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--muted)]">
                <span>Code postal *</span>
                <input
                  value={customer.postalCode}
                  onChange={(event) => updateCustomerField("postalCode", event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--muted)]">
                <span>Ville *</span>
                <input
                  value={customer.city}
                  onChange={(event) => updateCustomerField("city", event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                />
              </label>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Mode de livraison</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="cursor-pointer rounded-2xl border border-[var(--line)] bg-white p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === "standard"}
                      onChange={() => setDeliveryMethod("standard")}
                      className="mt-1"
                    />
                    <div className="space-y-1 text-sm text-[var(--muted)]">
                      <p className="font-semibold text-[var(--ink)]">Standard 3-7 jours</p>
                      <p>Tarif: {subtotal >= 120 ? "Offerte" : "7.90 EUR"}</p>
                    </div>
                  </div>
                </label>

                <label className="cursor-pointer rounded-2xl border border-[var(--line)] bg-white p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === "express"}
                      onChange={() => setDeliveryMethod("express")}
                      className="mt-1"
                    />
                    <div className="space-y-1 text-sm text-[var(--muted)]">
                      <p className="font-semibold text-[var(--ink)]">Express 3-7 jours</p>
                      <p>Tarif: 11.90 EUR (traitement prioritaire)</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </section>
        ) : null}

        {currentStep === "paiement" ? (
          <section className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Paiement</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Paiement par virement bancaire.</p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">Virement bancaire</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Votre commande est reservee pendant {bankConfig.paymentWindowHours}h le temps de recevoir le virement.</p>

                <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--accent-soft)]/30 p-3 text-sm text-[var(--ink)]">
                  <p className="font-semibold">Coordonnees de virement</p>
                  <p className="mt-1">Beneficiaire: {bankConfig.beneficiary}</p>
                  <p>IBAN: {bankConfig.iban}</p>
                  <p>BIC: {bankConfig.bic}</p>
                  <p>Banque: {bankConfig.bankName}</p>
                  <p className="mt-2 text-xs">{bankConfig.instructions}</p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
          {prevStepByStep[currentStep] ? (
            <button
              type="button"
              onClick={goBack}
              disabled={isStepTransitioning || isSubmittingOrder}
              className="rounded-full border border-[var(--line)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Retour
            </button>
          ) : (
            <Link
              href="/catalogue"
              className="rounded-full border border-[var(--line)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]"
            >
              Continuer mes achats
            </Link>
          )}

          {currentStep === "paiement" ? (
            <button
              type="button"
              onClick={submitOrder}
              disabled={isSubmittingOrder}
              className="rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmittingOrder ? "Confirmation..." : "Confirmer la commande"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={isStepTransitioning || isSubmittingOrder}
              className="rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isStepTransitioning ? "Chargement..." : ctaByStep[currentStep]}
            </button>
          )}
        </div>

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      </div>

      <aside className="h-fit rounded-3xl border border-[var(--line)] bg-white/90 p-5">
        <h2 className="font-display text-3xl text-[var(--ink)]">Resume</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{items.length} ligne(s) produit</p>

        <div className="mt-5 space-y-2 text-sm text-[var(--muted)]">
          {items.slice(0, 4).map((item) => (
            <div key={`mini-${item.productId}-${item.size}-${item.color}`} className="flex items-start justify-between gap-2">
              <span className="line-clamp-2">{item.name}</span>
              <span>{item.quantity}x</span>
            </div>
          ))}
          {items.length > 4 ? <p className="text-xs">+ {items.length - 4} autre(s) article(s)</p> : null}
        </div>

        <div className="mt-5 space-y-2 border-t border-[var(--line)] pt-4 text-sm text-[var(--muted)]">
          <div className="flex items-center justify-between">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Livraison</span>
            <span>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 text-base font-semibold text-[var(--ink)]">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)]/70 p-4 text-sm text-[var(--muted)]">
          <p>
            Paiement actuel: <span className="font-semibold text-[var(--ink)]">{getPaymentLabel(paymentMethod)}</span>
          </p>
          <p className="mt-1">Livraison: {getDeliveryLabel(deliveryMethod)}</p>
        </div>
      </aside>
    </div>
  );
}


