"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useMemo, useState } from "react";

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

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ProductStats = {
  totalProducts: number;
  categoryCount: number;
  subcategoryCount: number;
  totalStock: number;
  averagePrice: number;
};

type OrderStats = {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  paidRevenue: number;
  grossRevenue: number;
};

type AdminProductsResponse = {
  ok: boolean;
  products: Product[];
  stats?: ProductStats;
  pagination: Pagination;
  error?: string;
};

type AdminOrdersResponse = {
  ok: boolean;
  orders: OrderRecord[];
  stats?: OrderStats;
  pagination: Pagination;
  error?: string;
};

type AdminImageUploadResponse = {
  ok: boolean;
  image?: {
    optimizedUrl: string;
    secureUrl: string;
  };
  error?: string;
};

type AdminMenu = "products" | "orders" | "bank" | "google";
type ProductPanel = "list" | "create" | "edit";

const defaultPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const defaultProductStats: ProductStats = {
  totalProducts: 0,
  categoryCount: 0,
  subcategoryCount: 0,
  totalStock: 0,
  averagePrice: 0,
};

const defaultOrderStats: OrderStats = {
  totalOrders: 0,
  paidOrders: 0,
  pendingOrders: 0,
  paidRevenue: 0,
  grossRevenue: 0,
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

function pageNumbers(currentPage: number, totalPages: number) {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);

  const numbers: number[] = [];
  for (let page = start; page <= end; page += 1) {
    numbers.push(page);
  }

  return numbers;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function imageFileName(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split("/").filter(Boolean).at(-1) ?? "image produit";
  } catch {
    return "image produit";
  }
}

function productToDraft(product: Product): ProductDraft {
  return {
    name: product.name,
    slug: product.slug,
    categorySlug: product.categorySlug,
    subcategorySlug: product.subcategorySlug ?? "",
    subcategoryLabel: product.subcategoryLabel ?? "",
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    tags: product.tags.join(", "),
    image: product.image,
    gallery: product.gallery.join(", "),
    sku: product.sku,
    stock: String(product.stock),
    colors: product.colors.join(", "),
    sizes: product.sizes.join(", "),
  };
}

export function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState<AdminMenu>("products");
  const [productPanel, setProductPanel] = useState<ProductPanel>("list");

  const [bankConfig, setBankConfig] = useState<BankTransferConfig>(defaultBankConfig);
  const [googleConfig, setGoogleConfig] = useState<GoogleShoppingConfig>(defaultGoogleConfig);

  const [productItems, setProductItems] = useState<Product[]>([]);
  const [ordersItems, setOrdersItems] = useState<OrderRecord[]>([]);

  const [productsPagination, setProductsPagination] = useState<Pagination>(defaultPagination);
  const [ordersPagination, setOrdersPagination] = useState<Pagination>(defaultPagination);
  const [productStats, setProductStats] = useState<ProductStats>(defaultProductStats);
  const [orderStats, setOrderStats] = useState<OrderStats>(defaultOrderStats);

  const [productsRequest, setProductsRequest] = useState({ page: 1, query: "", category: "all", limit: 25 });
  const [ordersRequest, setOrdersRequest] = useState({ page: 1, query: "", status: "all" });

  const [productQueryInput, setProductQueryInput] = useState("");
  const [productCategoryInput, setProductCategoryInput] = useState("all");
  const [productLimitInput, setProductLimitInput] = useState("25");
  const [orderQueryInput, setOrderQueryInput] = useState("");
  const [orderStatusInput, setOrderStatusInput] = useState("all");

  const [draft, setDraft] = useState<ProductDraft>(defaultDraft);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isSavingBankConfig, setIsSavingBankConfig] = useState(false);
  const [isSavingGoogleConfig, setIsSavingGoogleConfig] = useState(false);
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const [isUploadingGalleryImages, setIsUploadingGalleryImages] = useState(false);

  const [productStatus, setProductStatus] = useState<string | null>(null);
  const [bankStatus, setBankStatus] = useState<string | null>(null);
  const [googleStatus, setGoogleStatus] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const productPages = useMemo(
    () => pageNumbers(productsPagination.page, productsPagination.totalPages),
    [productsPagination.page, productsPagination.totalPages],
  );

  const orderPages = useMemo(
    () => pageNumbers(ordersPagination.page, ordersPagination.totalPages),
    [ordersPagination.page, ordersPagination.totalPages],
  );

  useEffect(() => {
    let mounted = true;

    async function loadConfigs() {
      try {
        const [bankResponse, googleResponse] = await Promise.all([
          fetch("/api/admin/bank-transfer", { cache: "no-store" }),
          fetch("/api/admin/google-shopping", { cache: "no-store" }),
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
      } finally {
        if (mounted) {
          setIsConfigLoading(false);
        }
      }
    }

    loadConfigs();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setIsProductsLoading(true);
      setProductsError(null);

      const params = new URLSearchParams({
        page: String(productsRequest.page),
        limit: String(productsRequest.limit),
      });

      if (productsRequest.query.trim()) {
        params.set("q", productsRequest.query.trim());
      }

      if (productsRequest.category !== "all") {
        params.set("category", productsRequest.category);
      }

      try {
        const response = await fetch(`/api/admin/products?${params.toString()}`, { cache: "no-store" });
        const json = (await response.json()) as AdminProductsResponse;

        if (!mounted) {
          return;
        }

        if (!response.ok || !json.ok) {
          setProductsError(json.error ?? "Impossible de charger les produits.");
          setProductItems([]);
          setProductsPagination(defaultPagination);
          setProductStats(defaultProductStats);
          return;
        }

        setProductItems(json.products);
        setProductsPagination(json.pagination ?? defaultPagination);
        setProductStats(json.stats ?? defaultProductStats);
      } catch {
        if (mounted) {
          setProductsError("Erreur reseau lors du chargement des produits.");
        }
      } finally {
        if (mounted) {
          setIsProductsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [productsRequest]);

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      setIsOrdersLoading(true);
      setOrdersError(null);

      const params = new URLSearchParams({
        page: String(ordersRequest.page),
        limit: "20",
      });

      if (ordersRequest.query.trim()) {
        params.set("q", ordersRequest.query.trim());
      }

      if (ordersRequest.status !== "all") {
        params.set("status", ordersRequest.status);
      }

      try {
        const response = await fetch(`/api/admin/orders?${params.toString()}`, { cache: "no-store" });
        const json = (await response.json()) as AdminOrdersResponse;

        if (!mounted) {
          return;
        }

        if (!response.ok || !json.ok) {
          setOrdersError(json.error ?? "Impossible de charger les commandes.");
          setOrdersItems([]);
          setOrdersPagination(defaultPagination);
          setOrderStats(defaultOrderStats);
          return;
        }

        setOrdersItems(json.orders);
        setOrdersPagination(json.pagination ?? defaultPagination);
        setOrderStats(json.stats ?? defaultOrderStats);
      } catch {
        if (mounted) {
          setOrdersError("Erreur reseau lors du chargement des commandes.");
        }
      } finally {
        if (mounted) {
          setIsOrdersLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [ordersRequest]);

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmittingProduct) {
      return;
    }

    setIsSubmittingProduct(true);
    setProductStatus("Enregistrement du produit...");

    try {
      const payload = {
        id: editingProductId ?? undefined,
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
        method: editingProductId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        setProductStatus(`Erreur: ${json.error ?? (editingProductId ? "Impossible de modifier le produit" : "Impossible d'ajouter le produit")}`);
        return;
      }

      setProductStatus(editingProductId ? "Produit modifie avec succes." : "Produit ajoute avec succes.");
      setDraft(defaultDraft);
      setEditingProductId(null);
      setProductPanel("list");
      setProductQueryInput("");
      setProductCategoryInput("all");
      setProductLimitInput("25");
      setProductsRequest({ page: 1, query: "", category: "all", limit: 25 });
    } finally {
      setIsSubmittingProduct(false);
    }
  }

  async function uploadAdminProductImage(file: File, suffix: string) {
    const formData = new FormData();
    const namePart = draft.slug || draft.name || "produit";
    formData.set("file", file);
    formData.set("publicId", `admin/${namePart}-${suffix}-${Date.now()}`);

    const response = await fetch("/api/admin/images", {
      method: "POST",
      body: formData,
    });
    const json = (await response.json()) as AdminImageUploadResponse;

    if (!response.ok || !json.ok || !json.image) {
      throw new Error(json.error ?? "Upload image impossible");
    }

    return json.image.optimizedUrl || json.image.secureUrl;
  }

  async function uploadMainProductImage(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || isUploadingMainImage) {
      return;
    }

    setIsUploadingMainImage(true);
    setProductStatus("Upload de l'image principale vers Cloudinary...");

    try {
      const imageUrl = await uploadAdminProductImage(file, "main");
      setDraft((prev) => ({
        ...prev,
        image: imageUrl,
        gallery: Array.from(new Set([imageUrl, ...splitCsv(prev.gallery)])).join(", "),
      }));
      setProductStatus("Image principale envoyee et compressee sur Cloudinary.");
    } catch (error) {
      setProductStatus(`Erreur upload: ${error instanceof Error ? error.message : "Cloudinary indisponible"}`);
    } finally {
      setIsUploadingMainImage(false);
    }
  }

  async function uploadGalleryProductImages(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0 || isUploadingGalleryImages) {
      return;
    }

    setIsUploadingGalleryImages(true);
    setProductStatus(`Upload de ${files.length} image(s) galerie vers Cloudinary...`);

    try {
      const uploadedUrls: string[] = [];
      for (const [index, file] of files.entries()) {
        uploadedUrls.push(await uploadAdminProductImage(file, `gallery-${index + 1}`));
      }

      setDraft((prev) => ({
        ...prev,
        image: prev.image || uploadedUrls[0] || "",
        gallery: Array.from(new Set([...splitCsv(prev.gallery), ...uploadedUrls])).join(", "),
      }));
      setProductStatus("Galerie envoyee et compressee sur Cloudinary.");
    } catch (error) {
      setProductStatus(`Erreur upload: ${error instanceof Error ? error.message : "Cloudinary indisponible"}`);
    } finally {
      setIsUploadingGalleryImages(false);
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

  function startProductEdit(product: Product) {
    setDraft(productToDraft(product));
    setEditingProductId(product.id);
    setProductStatus(null);
    setProductPanel("edit");
  }

  function resetProductForm() {
    setDraft(defaultDraft);
    setEditingProductId(null);
    setProductStatus(null);
    setProductPanel("create");
  }

  function submitProductFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductsRequest({
      page: 1,
      query: productQueryInput,
      category: productCategoryInput,
      limit: Number.parseInt(productLimitInput, 10),
    });
  }

  function submitOrderFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrdersRequest({
      page: 1,
      query: orderQueryInput,
      status: orderStatusInput,
    });
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2 rounded-2xl border border-[var(--line)] bg-white/85 p-2">
        {[
          { key: "products", label: "Produits" },
          { key: "orders", label: "Commandes" },
          { key: "bank", label: "Virement" },
          { key: "google", label: "Google Shopping" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveMenu(item.key as AdminMenu)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              activeMenu === item.key
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <article className="rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Produits</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{productStats.totalProducts}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Categories</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{productStats.categoryCount}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Sous-categories</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{productStats.subcategoryCount}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Stock total</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{productStats.totalStock}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Prix moyen</p>
          <p className="mt-2 text-xl font-semibold text-[var(--ink)]">{formatCurrency(productStats.averagePrice)}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Commandes</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{orderStats.totalOrders}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Payees</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{orderStats.paidOrders}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">En attente</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{orderStats.pendingOrders}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">CA paye</p>
          <p className="mt-2 text-xl font-semibold text-[var(--ink)]">{formatCurrency(orderStats.paidRevenue)}</p>
        </article>
      </section>

      {activeMenu === "products" ? (
        <section className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[var(--ink)]">Gestion des produits</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setProductPanel("list")}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  productPanel === "list"
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
                }`}
              >
                Liste complete
              </button>
              <button
                type="button"
                onClick={resetProductForm}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  productPanel === "create" || productPanel === "edit"
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
                }`}
              >
{editingProductId ? "Edition en cours" : "Ajouter un produit"}
              </button>
            </div>
          </div>

          {productPanel === "list" ? (
            <div className="mt-6 space-y-5">
              <form onSubmit={submitProductFilters} className="grid gap-3 md:grid-cols-[1fr_240px_160px_auto]">
                <input
                  value={productQueryInput}
                  onChange={(event) => setProductQueryInput(event.target.value)}
                  placeholder="Rechercher nom, slug, SKU, tag..."
                  className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                />
                <select
                  value={productCategoryInput}
                  onChange={(event) => setProductCategoryInput(event.target.value)}
                  className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                >
                  <option value="all">Toutes categories</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  value={productLimitInput}
                  onChange={(event) => setProductLimitInput(event.target.value)}
                  className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                >
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                </select>
                <button
                  type="submit"
                  disabled={isProductsLoading}
                  className="rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isProductsLoading ? "Chargement..." : "Filtrer"}
                </button>
              </form>

              <div className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                {productsPagination.total} produits au total - page {productsPagination.page}/{productsPagination.totalPages} - {productItems.length} affiches
              </div>

              {productsError ? (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{productsError}</p>
              ) : null}

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-[var(--muted)]">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                      <th className="px-2 py-3">Produit</th>
                      <th className="px-2 py-3">Categorie</th>
                      <th className="px-2 py-3">Sous-categorie</th>
                      <th className="px-2 py-3">Prix</th>
                      <th className="px-2 py-3">Stock</th>
                      <th className="px-2 py-3">SKU</th>
                      <th className="px-2 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isProductsLoading ? (
                      <tr>
                        <td className="px-2 py-4 text-sm text-[var(--muted)]" colSpan={7}>
                          Chargement des produits...
                        </td>
                      </tr>
                    ) : productItems.length === 0 ? (
                      <tr>
                        <td className="px-2 py-4 text-sm text-[var(--muted)]" colSpan={7}>
                          Aucun produit trouve avec ces filtres.
                        </td>
                      </tr>
                    ) : (
                      productItems.map((product) => (
                        <tr key={product.id} className="border-b border-[var(--line)] last:border-b-0">
                          <td className="px-2 py-3">
                            <p className="font-semibold text-[var(--ink)]">{product.name}</p>
                            <p className="text-xs text-[var(--muted)]">/{product.slug}</p>
                          </td>
                          <td className="px-2 py-3">{product.categorySlug}</td>
                          <td className="px-2 py-3">{product.subcategoryLabel ?? product.subcategorySlug ?? "-"}</td>
                          <td className="px-2 py-3">{product.price.toFixed(2)} EUR</td>
                          <td className="px-2 py-3">{product.stock}</td>
                          <td className="px-2 py-3">{product.sku}</td>
                          <td className="px-2 py-3">
                            <button
                              type="button"
                              onClick={() => startProductEdit(product)}
                              className="rounded-full border border-[var(--line)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            >
                              Modifier
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={productsPagination.page <= 1 || isProductsLoading}
                  onClick={() => setProductsRequest((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Precedent
                </button>

                {productPages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setProductsRequest((prev) => ({ ...prev, page }))}
                    className={`h-9 w-9 rounded-full border text-center text-sm transition ${
                      page === productsPagination.page
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={productsPagination.page >= productsPagination.totalPages || isProductsLoading}
                  onClick={() => setProductsRequest((prev) => ({ ...prev, page: Math.min(productsPagination.totalPages, prev.page + 1) }))}
                  className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  {editingProductId ? "Modification du produit selectionne" : "Creation d'un nouveau produit"}
                </p>
                {editingProductId ? (
                  <button type="button" onClick={resetProductForm} className="rounded-full border border-[var(--line)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]">
                    Annuler edition
                  </button>
                ) : null}
              </div>
              {productStatus ? <p className="mb-4 text-xs uppercase tracking-[0.16em] text-[var(--accent)]">{productStatus}</p> : null}

              <form onSubmit={submitProduct} className="grid gap-4 sm:grid-cols-2">
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
                      <option key={category.slug} value={category.slug}>{category.name}</option>
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

                <label className="space-y-2 text-sm text-[var(--muted)]"><span>Prix *</span><input type="number" step="0.01" value={draft.price} onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" required /></label>
                <label className="space-y-2 text-sm text-[var(--muted)]"><span>Prix compare</span><input type="number" step="0.01" value={draft.compareAtPrice} onChange={(event) => setDraft((prev) => ({ ...prev, compareAtPrice: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>

                <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2"><span>Description courte *</span><input value={draft.shortDescription} onChange={(event) => setDraft((prev) => ({ ...prev, shortDescription: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" required /></label>
                <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2"><span>Description longue *</span><textarea value={draft.longDescription} onChange={(event) => setDraft((prev) => ({ ...prev, longDescription: event.target.value }))} rows={4} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" required /></label>
                <div className="space-y-3 text-sm text-[var(--muted)] sm:col-span-2">
                  <label className="space-y-3">
                    <span>Image principale *</span>
                    <input type="file" accept="image/*" onChange={(event) => uploadMainProductImage(event.target.files)} className="w-full rounded-xl border border-dashed border-[var(--line)] bg-white px-4 py-3 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:text-[var(--paper)] focus:border-[var(--accent)]" />
                  </label>
                  {draft.image ? (
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-3">
                      <div className="relative aspect-[4/3] max-w-sm overflow-hidden rounded-xl bg-rose-50">
                        <Image src={draft.image} alt="Apercu image principale" fill className="object-cover" sizes="384px" />
                      </div>
                      <p className="mt-2 truncate text-xs text-[var(--muted)]" title={draft.image}>Image principale: {imageFileName(draft.image)}</p>
                    </div>
                  ) : null}
                  {isUploadingMainImage ? <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">Upload en cours...</p> : null}
                </div>
                <div className="space-y-3 text-sm text-[var(--muted)] sm:col-span-2">
                  <label className="space-y-3">
                    <span>Galerie produit</span>
                    <input type="file" accept="image/*" multiple onChange={(event) => uploadGalleryProductImages(event.target.files)} className="w-full rounded-xl border border-dashed border-[var(--line)] bg-white px-4 py-3 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.18em] file:text-[var(--paper)] focus:border-[var(--accent)]" />
                  </label>
                  {splitCsv(draft.gallery).length > 0 ? (
                    <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-3 sm:grid-cols-2 lg:grid-cols-4">
                      {splitCsv(draft.gallery).map((imageUrl) => (
                        <div key={imageUrl} className="space-y-2">
                          <div className="relative aspect-square overflow-hidden rounded-xl bg-rose-50">
                            <Image src={imageUrl} alt="Apercu galerie produit" fill className="object-cover" sizes="180px" />
                          </div>
                          <p className="truncate text-[11px] text-[var(--muted)]" title={imageUrl}>{imageFileName(imageUrl)}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {isUploadingGalleryImages ? <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">Upload galerie en cours...</p> : null}
                </div>

                <label className="space-y-2 text-sm text-[var(--muted)]"><span>Tags (virgule)</span><input value={draft.tags} onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
                <label className="space-y-2 text-sm text-[var(--muted)]"><span>SKU</span><input value={draft.sku} onChange={(event) => setDraft((prev) => ({ ...prev, sku: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
                <label className="space-y-2 text-sm text-[var(--muted)]"><span>Stock</span><input type="number" value={draft.stock} onChange={(event) => setDraft((prev) => ({ ...prev, stock: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
                <label className="space-y-2 text-sm text-[var(--muted)]"><span>Couleurs (virgule)</span><input value={draft.colors} onChange={(event) => setDraft((prev) => ({ ...prev, colors: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
                <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2"><span>Tailles (virgule)</span><input value={draft.sizes} onChange={(event) => setDraft((prev) => ({ ...prev, sizes: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>

                <div className="sm:col-span-2">
                  <button type="submit" disabled={isSubmittingProduct || isUploadingMainImage || isUploadingGalleryImages} className="rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70">
                    {isSubmittingProduct ? (editingProductId ? "Modification..." : "Ajout en cours...") : editingProductId ? "Enregistrer les modifications" : "Ajouter ce produit"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      ) : null}

      {activeMenu === "orders" ? (
        <section className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[var(--ink)]">Commandes</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {ordersPagination.total} commandes - page {ordersPagination.page}/{ordersPagination.totalPages}
            </p>
          </div>

          <form onSubmit={submitOrderFilters} className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <input value={orderQueryInput} onChange={(event) => setOrderQueryInput(event.target.value)} placeholder="Recherche reference, client, email..." className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
            <select value={orderStatusInput} onChange={(event) => setOrderStatusInput(event.target.value)} className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]">
              <option value="all">Tous les statuts</option>
              <option value="paid">Payees</option>
              <option value="pending_payment">En attente de paiement</option>
            </select>
            <button type="submit" disabled={isOrdersLoading} className="rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70">
              {isOrdersLoading ? "Chargement..." : "Filtrer"}
            </button>
          </form>

          {ordersError ? <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{ordersError}</p> : null}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-[var(--muted)]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]">
                  <th className="px-2 py-3">Reference</th>
                  <th className="px-2 py-3">Client</th>
                  <th className="px-2 py-3">Total</th>
                  <th className="px-2 py-3">Statut</th>
                  <th className="px-2 py-3">Paiement</th>
                  <th className="px-2 py-3">Email</th>
                  <th className="px-2 py-3">Facture</th>
                </tr>
              </thead>
              <tbody>
                {isOrdersLoading ? (
                  <tr><td className="px-2 py-4 text-sm text-[var(--muted)]" colSpan={7}>Chargement des commandes...</td></tr>
                ) : ordersItems.length === 0 ? (
                  <tr><td className="px-2 py-4 text-sm text-[var(--muted)]" colSpan={7}>Aucune commande trouvee.</td></tr>
                ) : (
                  ordersItems.map((order) => (
                    <tr key={order.id} className="border-b border-[var(--line)] last:border-b-0">
                      <td className="px-2 py-3">{order.reference}</td>
                      <td className="px-2 py-3"><p className="font-semibold text-[var(--ink)]">{order.customer.fullName}</p><p className="text-xs text-[var(--muted)]">{order.customer.email}</p></td>
                      <td className="px-2 py-3">{order.total.toFixed(2)} EUR</td>
                      <td className="px-2 py-3">{order.status}</td>
                      <td className="px-2 py-3">{order.paymentMethod}</td>
                      <td className="px-2 py-3"><p className="font-semibold text-[var(--ink)]">Client: {order.customerEmailStatus ?? order.emailStatus}</p><p className="font-semibold text-[var(--ink)]">Admin: {order.adminEmailStatus ?? order.emailStatus}</p><p className="max-w-[260px] truncate text-xs text-[var(--muted)]" title={order.emailError || order.customerEmailError || order.adminEmailError || order.customerEmailMessageId || order.adminEmailMessageId || ""}>{order.emailError || order.customerEmailError || order.adminEmailError || order.emailProvider || "-"}</p></td>
                      <td className="px-2 py-3"><a href={order.invoiceUrl} target="_blank" rel="noreferrer" className="text-[var(--accent)] underline">Ouvrir</a></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button type="button" disabled={ordersPagination.page <= 1 || isOrdersLoading} onClick={() => setOrdersRequest((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))} className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-40">Precedent</button>
            {orderPages.map((page) => (
              <button key={page} type="button" onClick={() => setOrdersRequest((prev) => ({ ...prev, page }))} className={`h-9 w-9 rounded-full border text-center text-sm transition ${page === ordersPagination.page ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--accent)]"}`}>{page}</button>
            ))}
            <button type="button" disabled={ordersPagination.page >= ordersPagination.totalPages || isOrdersLoading} onClick={() => setOrdersRequest((prev) => ({ ...prev, page: Math.min(ordersPagination.totalPages, prev.page + 1) }))} className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-40">Suivant</button>
          </div>
        </section>
      ) : null}

      {activeMenu === "bank" ? (
        <section className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[var(--ink)]">Configuration virement</h2>
            {bankStatus ? <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">{bankStatus}</p> : null}
          </div>

          {isConfigLoading ? (
            <p className="mt-4 text-sm text-[var(--muted)]">Chargement de la configuration...</p>
          ) : (
            <form onSubmit={saveBankConfig} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Activer</span><select value={bankConfig.enabled ? "true" : "false"} onChange={(event) => setBankConfig((prev) => ({ ...prev, enabled: event.target.value === "true" }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]"><option value="true">Oui</option><option value="false">Non</option></select></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Beneficiaire</span><input value={bankConfig.beneficiary} onChange={(event) => setBankConfig((prev) => ({ ...prev, beneficiary: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>IBAN</span><input value={bankConfig.iban} onChange={(event) => setBankConfig((prev) => ({ ...prev, iban: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>BIC</span><input value={bankConfig.bic} onChange={(event) => setBankConfig((prev) => ({ ...prev, bic: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Banque</span><input value={bankConfig.bankName} onChange={(event) => setBankConfig((prev) => ({ ...prev, bankName: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Prefixe reference</span><input value={bankConfig.referencePrefix} onChange={(event) => setBankConfig((prev) => ({ ...prev, referencePrefix: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <label className="space-y-2 text-sm text-[var(--muted)] sm:col-span-2"><span>Instructions</span><textarea value={bankConfig.instructions} onChange={(event) => setBankConfig((prev) => ({ ...prev, instructions: event.target.value }))} rows={3} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <div className="sm:col-span-2"><button type="submit" disabled={isSavingBankConfig} className="rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70">{isSavingBankConfig ? "Sauvegarde..." : "Sauvegarder virement"}</button></div>
            </form>
          )}
        </section>
      ) : null}

      {activeMenu === "google" ? (
        <section className="rounded-3xl border border-[var(--line)] bg-white/90 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl text-[var(--ink)]">Google Shopping</h2>
            {googleStatus ? <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">{googleStatus}</p> : null}
          </div>

          {isConfigLoading ? (
            <p className="mt-4 text-sm text-[var(--muted)]">Chargement de la configuration...</p>
          ) : (
            <form onSubmit={saveGoogleConfig} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Activer feed</span><select value={googleConfig.enabled ? "true" : "false"} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, enabled: event.target.value === "true" }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]"><option value="true">Oui</option><option value="false">Non</option></select></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Marque</span><input value={googleConfig.brand} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, brand: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Devise</span><input value={googleConfig.currency} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Pays</span><input value={googleConfig.country} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, country: event.target.value.toUpperCase() }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Condition</span><select value={googleConfig.condition} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, condition: event.target.value as GoogleShoppingConfig["condition"] }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]"><option value="new">new</option><option value="used">used</option><option value="refurbished">refurbished</option></select></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Google product category</span><input value={googleConfig.defaultGoogleProductCategory} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, defaultGoogleProductCategory: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Service livraison</span><input value={googleConfig.shipping.service} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, shipping: { ...prev.shipping, service: event.target.value } }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <label className="space-y-2 text-sm text-[var(--muted)]"><span>Prix livraison</span><input type="number" step="0.01" value={googleConfig.shipping.price} onChange={(event) => setGoogleConfig((prev) => ({ ...prev, shipping: { ...prev.shipping, price: Number.parseFloat(event.target.value || "0") } }))} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--accent)]" /></label>
              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                <button type="submit" disabled={isSavingGoogleConfig} className="rounded-full bg-[var(--ink)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70">{isSavingGoogleConfig ? "Sauvegarde..." : "Sauvegarder feed"}</button>
                <a href="/google-shopping.xml" target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]">Ouvrir le feed XML</a>
              </div>
            </form>
          )}
        </section>
      ) : null}
    </div>
  );
}
