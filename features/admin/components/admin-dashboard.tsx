"use client";

import { type FormEvent, useEffect, useState } from "react";

import { categories } from "@/features/catalog/data/categories";
import type { BankTransferConfig, GoogleShoppingConfig } from "@/types/admin";
import type { OrderRecord } from "@/types/order";
import type { Product } from "@/types/shop";

type ProductDraft = {
  name: string;
  slug: string;
  categorySlug: string;
  subcategorySlug: string;
  subcategoryLabel: string;
  shortDescription: string;
  longDescription: string;
  price: string;
  compareAtPrice: string;
  tags: string;
  image: string;
  gallery: string;
  sku: string;
  stock: string;
  colors: string;
  sizes: string;
};

const defaultBankConfig: BankTransferConfig = {
  enabled: true,
  beneficiary: "MA PETITE LINGERIE SAS",
  iban: "",
  bic: "",
  bankName: "",
  referencePrefix: "MPL",
  paymentWindowHours: 72,
  instructions: "Indiquez la reference de commande dans le motif de virement.",
};

const defaultGoogleConfig: GoogleShoppingConfig = {
  enabled: true,
  currency: "EUR",
  country: "FR",
  language: "fr",
  brand: "Ma Petite Lingerie",
  condition: "new",
  defaultGoogleProductCategory: "1604",
  shipping: {
    country: "FR",
    service: "Standard",
    price: 7.9,
  },
};

const defaultDraft: ProductDraft = {
  name: "",
  slug: "",
  categorySlug: "lingerie",
  subcategorySlug: "",
  subcategoryLabel: "",
  shortDescription: "",
  longDescription: "",
  price: "",
  compareAtPrice: "",
  tags: "",
  image: "",
  gallery: "",
  sku: "",
  stock: "20",
  colors: "Unique",
  sizes: "TU",
};

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [bankConfig, setBankConfig] = useState<BankTransferConfig>(defaultBankConfig);
  const [googleConfig, setGoogleConfig] = useState<GoogleShoppingConfig>(defaultGoogleConfig);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const [draft, setDraft] = useState<ProductDraft>(defaultDraft);

  const [productStatus, setProductStatus] = useState<string | null>(null);
  const [bankStatus, setBankStatus] = useState<string | null>(null);
  const [googleStatus, setGoogleStatus] = useState<string | null>(null);

  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isSavingBankConfig, setIsSavingBankConfig] = useState(false);
  const [isSavingGoogleConfig, setIsSavingGoogleConfig] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      try {
        const [bankResponse, googleResponse, productsResponse, ordersResponse] = await Promise.all([
          fetch("/api/admin/bank-transfer", { cache: "no-store" }),
          fetch("/api/admin/google-shopping", { cache: "no-store" }),
          fetch("/api/admin/products", { cache: "no-store" }),
          fetch("/api/admin/orders", { cache: "no-store" }),
        ]);

        if (!mounted) {
          return;
        }

        if (bankResponse.ok) {
          const bankJson = (await bankResponse.json()) as { config: BankTransferConfig };
          setBankConfig(bankJson.config);
        }

        if (googleResponse.ok) {
          const googleJson = (await googleResponse.json()) as { config: GoogleShoppingConfig };
          setGoogleConfig(googleJson.config);
        }

        if (productsResponse.ok) {
          const productJson = (await productsResponse.json()) as { products: Product[] };
          setRecentProducts(productJson.products);
        }

        if (ordersResponse.ok) {
          const ordersJson = (await ordersResponse.json()) as { orders: OrderRecord[] };
          setRecentOrders(ordersJson.orders);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadAll();

    return () => {
      mounted = false;
    };
  }, []);

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmittingProduct) {
      return;
    }

    setIsSubmittingProduct(true);
    setProductStatus("Enregistrement du produit...");

    try {
      const payload = {
        name: draft.name,
        slug: draft.slug || undefined,
        categorySlug: draft.categorySlug,
        subcategorySlug: draft.subcategorySlug || undefined,
        subcategoryLabel: draft.subcategoryLabel || undefined,
        shortDescription: draft.shortDescription,
        longDescription: draft.longDescription,
        price: Number.parseFloat(draft.price || "0"),
        compareAtPrice: draft.compareAtPrice ? Number.parseFloat(draft.compareAtPrice) : undefined,
        tags: splitCsv(draft.tags),
        image: draft.image,
        gallery: splitCsv(draft.gallery),
        sku: draft.sku || undefined,
        stock: Number.parseInt(draft.stock || "0", 10),
        colors: splitCsv(draft.colors),
        sizes: splitCsv(draft.sizes),
        specifications: [],
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        setProductStatus(`Erreur: ${json.error ?? "Impossible d'ajouter le produit"}`);
        return;
      }

      setProductStatus("Produit ajoute avec succes.");
      setDraft(defaultDraft);

      const refreshProducts = await fetch("/api/admin/products", { cache: "no-store" });
      if (refreshProducts.ok) {
        const data = (await refreshProducts.json()) as { products: Product[] };
        setRecentProducts(data.products);
      }
    } finally {
      setIsSubmittingProduct(false);
    }
  }

  async function saveBankConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSavingBankConfig) {
      return;
    }

    setIsSavingBankConfig(true);
    setBankStatus("Sauvegarde en cours...");

    try {
      const response = await fetch("/api/admin/bank-transfer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankConfig),
      });

      const json = await response.json();

      if (!response.ok) {
        setBankStatus(`Erreur: ${json.error ?? "Impossible de sauvegarder"}`);
        return;
      }

      setBankStatus("Configuration virement mise a jour.");
    } finally {
      setIsSavingBankConfig(false);
    }
  }

  async function saveGoogleConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSavingGoogleConfig) {
      return;
    }

    setIsSavingGoogleConfig(true);
    setGoogleStatus("Sauvegarde en cours...");

    try {
      const response = await fetch("/api/admin/google-shopping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleConfig),
      });

      const json = await response.json();

      if (!response.ok) {
        setGoogleStatus(`Erreur: ${json.error ?? "Impossible de sauvegarder"}`);
        return;
      }

      setGoogleStatus("Configuration Google Shopping mise a jour.");
    } finally {
      setIsSavingGoogleConfig(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-[var(--line)] bg-white p-8 text-sm text-[var(--muted)]">
        Chargement du panneau admin...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-[var(--ink)]">Ajouter un produit</h2>
          {productStatus ? <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">{productStatus}</p> : null}
        </div>

        <form onSubmit={submitProduct} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Nom *</span>
            <input value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" required />
          </label>
          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Slug (optionnel)</span>
            <input value={draft.slug} onChange={(event) => setDraft((prev) => ({ ...prev, slug: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Categorie *</span>
            <select value={draft.categorySlug} onChange={(event) => setDraft((prev) => ({ ...prev, categorySlug: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]">
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Sous-categorie slug</span>
            <input value={draft.subcategorySlug} onChange={(event) => setDraft((prev) => ({ ...prev, subcategorySlug: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2">
            <span>Sous-categorie label</span>
            <input value={draft.subcategoryLabel} onChange={(event) => setDraft((prev) => ({ ...prev, subcategoryLabel: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Prix *</span>
            <input type="number" step="0.01" value={draft.price} onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" required />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Prix compare (optionnel)</span>
            <input type="number" step="0.01" value={draft.compareAtPrice} onChange={(event) => setDraft((prev) => ({ ...prev, compareAtPrice: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2">
            <span>Description courte *</span>
            <input value={draft.shortDescription} onChange={(event) => setDraft((prev) => ({ ...prev, shortDescription: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" required />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2">
            <span>Description longue *</span>
            <textarea value={draft.longDescription} onChange={(event) => setDraft((prev) => ({ ...prev, longDescription: event.target.value }))} rows={4} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" required />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2">
            <span>Image principale URL *</span>
            <input type="url" value={draft.image} onChange={(event) => setDraft((prev) => ({ ...prev, image: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" required />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2">
            <span>Galerie URLs (separees par virgule)</span>
            <input value={draft.gallery} onChange={(event) => setDraft((prev) => ({ ...prev, gallery: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Tags (virgule)</span>
            <input value={draft.tags} onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>
          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>SKU</span>
            <input value={draft.sku} onChange={(event) => setDraft((prev) => ({ ...prev, sku: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Stock</span>
            <input type="number" value={draft.stock} onChange={(event) => setDraft((prev) => ({ ...prev, stock: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>
          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Couleurs (virgule)</span>
            <input value={draft.colors} onChange={(event) => setDraft((prev) => ({ ...prev, colors: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2">
            <span>Tailles (virgule)</span>
            <input value={draft.sizes} onChange={(event) => setDraft((prev) => ({ ...prev, sizes: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmittingProduct}
              className="rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmittingProduct ? "Ajout en cours..." : "Ajouter ce produit"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-[var(--ink)]">Configuration virement</h2>
          {bankStatus ? <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">{bankStatus}</p> : null}
        </div>

        <form onSubmit={saveBankConfig} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Activer</span>
            <select
              value={bankConfig.enabled ? "true" : "false"}
              onChange={(event) => setBankConfig((prev) => ({ ...prev, enabled: event.target.value === "true" }))}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Beneficiaire</span>
            <input value={bankConfig.beneficiary} onChange={(event) => setBankConfig((prev) => ({ ...prev, beneficiary: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>IBAN</span>
            <input value={bankConfig.iban} onChange={(event) => setBankConfig((prev) => ({ ...prev, iban: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>BIC</span>
            <input value={bankConfig.bic} onChange={(event) => setBankConfig((prev) => ({ ...prev, bic: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Banque</span>
            <input value={bankConfig.bankName} onChange={(event) => setBankConfig((prev) => ({ ...prev, bankName: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Prefixe reference</span>
            <input value={bankConfig.referencePrefix} onChange={(event) => setBankConfig((prev) => ({ ...prev, referencePrefix: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2">
            <span>Instructions</span>
            <textarea value={bankConfig.instructions} onChange={(event) => setBankConfig((prev) => ({ ...prev, instructions: event.target.value }))} rows={3} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSavingBankConfig}
              className="rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingBankConfig ? "Sauvegarde..." : "Sauvegarder virement"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-[var(--ink)]">Google Shopping</h2>
          {googleStatus ? <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">{googleStatus}</p> : null}
        </div>

        <form onSubmit={saveGoogleConfig} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Activer feed</span>
            <select
              value={googleConfig.enabled ? "true" : "false"}
              onChange={(event) => setGoogleConfig((prev) => ({ ...prev, enabled: event.target.value === "true" }))}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Marque</span>
            <input value={googleConfig.brand} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, brand: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Devise</span>
            <input value={googleConfig.currency} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Pays</span>
            <input value={googleConfig.country} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, country: event.target.value.toUpperCase() }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Condition</span>
            <select value={googleConfig.condition} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, condition: event.target.value as GoogleShoppingConfig["condition"] }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]">
              <option value="new">new</option>
              <option value="used">used</option>
              <option value="refurbished">refurbished</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Google product category</span>
            <input value={googleConfig.defaultGoogleProductCategory} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, defaultGoogleProductCategory: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Service livraison</span>
            <input value={googleConfig.shipping.service} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, shipping: { ...prev.shipping, service: event.target.value } }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2 text-sm text-[var(--muted)]">
            <span>Prix livraison</span>
            <input type="number" step="0.01" value={googleConfig.shipping.price} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, shipping: { ...prev.shipping, price: Number.parseFloat(event.target.value || "0") } }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" />
          </label>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSavingGoogleConfig}
              className="rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingGoogleConfig ? "Sauvegarde..." : "Sauvegarder feed"}
            </button>
            <a href="/google-shopping.xml" target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]">
              Ouvrir le feed XML
            </a>
          </div>
        </form>
      </section>


      <section className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
        <h2 className="font-display text-3xl text-[var(--ink)]">Dernieres commandes</h2>
        {recentOrders.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">Aucune commande enregistree.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-[var(--muted)]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                  <th className="px-2 py-3">Reference</th>
                  <th className="px-2 py-3">Client</th>
                  <th className="px-2 py-3">Total</th>
                  <th className="px-2 py-3">Paiement</th>
                  <th className="px-2 py-3">Facture</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 20).map((order) => (
                  <tr key={order.id} className="border-b border-[var(--line)] last:border-b-0">
                    <td className="px-2 py-3">{order.reference}</td>
                    <td className="px-2 py-3">{order.customer.fullName}</td>
                    <td className="px-2 py-3">{order.total.toFixed(2)} EUR</td>
                    <td className="px-2 py-3">{order.paymentMethod}</td>
                    <td className="px-2 py-3">
                      <a href={order.invoiceUrl} target="_blank" rel="noreferrer" className="text-[var(--accent)] underline">
                        Ouvrir
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
        <h2 className="font-display text-3xl text-[var(--ink)]">Derniers produits ajoutes</h2>
        {recentProducts.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">Aucun produit recent.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-[var(--muted)]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                  <th className="px-2 py-3">Produit</th>
                  <th className="px-2 py-3">Categorie</th>
                  <th className="px-2 py-3">Prix</th>
                  <th className="px-2 py-3">Stock</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.slice(0, 15).map((product) => (
                  <tr key={product.id} className="border-b border-[var(--line)] last:border-b-0">
                    <td className="px-2 py-3">{product.name}</td>
                    <td className="px-2 py-3">{product.categorySlug}</td>
                    <td className="px-2 py-3">{product.price.toFixed(2)} EUR</td>
                    <td className="px-2 py-3">{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}