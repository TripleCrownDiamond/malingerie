"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  FlaskConical,
  Gamepad2,
  Gem,
  Heart,
  Leaf,
  Menu,
  Percent,
  Search,
  Shield,
  Shirt,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useSyncExternalStore, useTransition } from "react";

import { useCartStore } from "@/features/cart/store/cart-store";
import { sourceMenuLinks } from "@/features/source/data/source-data";
import { resolveSourceMenuHref } from "@/features/source/lib/navigation";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";

const categoryIcons: Record<string, LucideIcon> = {
  promotions: Percent,
  sextoys: Sparkles,
  lingerie: Shirt,
  bdsm: Shield,
  "bien-etre": Leaf,
  aphrodisiaques: FlaskConical,
  "jeux-et-librairie": Gamepad2,
  marques: Gem,
  conseils: BookOpen,
};

function getCategoryIcon(slug: string) {
  return categoryIcons[slug] ?? Sparkles;
}

export function SiteHeader() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchPending, startSearchTransition] = useTransition();
  const isClientReady = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const cartCount = useCartStore((state) => state.itemCount());
  const openDrawer = useCartStore((state) => state.openDrawer);

  const wishlistCount = useWishlistStore((state) => state.itemCount());

  const safeCartCount = isClientReady ? cartCount : 0;
  const safeWishlistCount = isClientReady ? wishlistCount : 0;

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();

    startSearchTransition(() => {
      if (!query) {
        router.push("/catalogue");
      } else {
        router.push(`/catalogue?q=${encodeURIComponent(query)}`);
      }
    });

    setSearchOpen(false);
    setMobileOpen(false);
  }

  return (
    <>
      <Show when="signed-out">
        <div className="w-full border-b border-[var(--accent)]/35 bg-[#1a1a1a] px-4 py-2.5 text-center text-[10px] uppercase tracking-[0.2em] text-white">
          Livraison offerte des 80EUR d&apos;achat - <span className="text-[#f3c3d1]">-20% sur votre premiere commande</span> - Retours gratuits
        </div>
      </Show>

      <header className="sticky top-0 z-50 border-b border-rose-200 bg-white/95 backdrop-blur-md">
        <nav className="mx-auto w-full max-w-[1600px] px-4 sm:px-8">
          <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:pt-4">
            <div className="flex items-center justify-start gap-6">
              <button type="button" onClick={() => setSearchOpen((prev) => !prev)} className="text-gray-800 transition hover:text-[var(--accent)]" aria-label="Rechercher">
                <Search size={23} />
              </button>

              <Show when="signed-out">
                <Link href="/sign-in" className="text-gray-800 transition hover:text-[var(--accent)]" aria-label="Connexion">
                  <User size={23} />
                </Link>
              </Show>

              <Show when="signed-in">
                <div className="flex items-center gap-3" aria-label="Mon profil">
                  <UserButton />
                  <Link href="/admin" className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-800 transition hover:text-[var(--accent)]">
                    Dashboard
                  </Link>
                </div>
              </Show>
            </div>

            <Link href="/" className="justify-self-center" aria-label="Accueil Ma Petite Lingerie">
              <div className="flex flex-col items-center">
                <Image
                  src="/logo-nav-femme.png"
                  alt="Logo Ma Petite Lingerie"
                  width={640}
                  height={480}
                  className="h-[72px] w-auto"
                  priority
                />
                <span className="-mt-1 text-[10px] font-bold uppercase tracking-[0.34em] text-rose-900">Ma Petite Lingerie</span>
              </div>
            </Link>

            <div className="flex items-center justify-end gap-6">
              <Link href="/wishlist" className="group relative flex items-center text-gray-800 transition hover:text-[var(--accent-strong)]" aria-label="Wishlist">
                <Heart size={23} className="transition group-hover:text-[var(--accent)]" />
                <span className="absolute -right-2 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-strong)] px-1 text-[9px] font-bold text-white shadow-sm">
                  {safeWishlistCount}
                </span>
              </Link>
              <button
                type="button"
                onClick={openDrawer}
                className="group relative flex items-center text-gray-800"
                aria-label="Ouvrir le panier"
              >
                <ShoppingBag size={23} className="transition group-hover:text-[var(--accent)]" />
                <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-strong)] text-[9px] font-bold text-white shadow-sm">
                  {safeCartCount}
                </span>
              </button>
            </div>
          </div>

          {searchOpen ? (
            <form onSubmit={submitSearch} className="hidden items-center gap-3 pb-2 pt-3 lg:flex">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher un produit, une marque, une categorie..."
                disabled={isSearchPending}
                className="w-full rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm text-[var(--ink)] outline-none ring-[var(--accent)]/25 transition focus:ring disabled:cursor-not-allowed disabled:opacity-70"
              />
              <button
                type="submit"
                disabled={isSearchPending}
                className="rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSearchPending ? "Recherche..." : "Search"}
              </button>
            </form>
          ) : null}

          <div className="hidden items-center justify-center gap-7 pb-4 pt-3 text-[11px] font-bold uppercase tracking-[0.12em] lg:flex">
            {sourceMenuLinks.map((item) => {
              const Icon = getCategoryIcon(item.slug);

              const resolvedHref = resolveSourceMenuHref(item.slug, item.href);

              return (
                <Link
                  key={item.slug}
                  href={resolvedHref}
                  className="nav-link relative inline-flex items-center gap-2 py-1 text-gray-700 transition hover:text-[var(--accent)]"
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="grid h-24 grid-cols-[auto_1fr_auto] items-center gap-3 lg:hidden">
            <button type="button" onClick={() => setMobileOpen((prev) => !prev)} className="p-2" aria-label="Ouvrir le menu">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="justify-self-center" aria-label="Accueil Ma Petite Lingerie">
              <div className="flex flex-col items-center">
                <Image
                  src="/logo-nav-femme.png"
                  alt="Logo Ma Petite Lingerie"
                  width={640}
                  height={480}
                  className="h-[54px] w-auto"
                  priority
                />
                <span className="-mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-rose-900">Ma Petite Lingerie</span>
              </div>
            </Link>

            <div className="flex items-center justify-end gap-4">
              <Link href="/wishlist" className="group relative flex items-center text-gray-800 transition hover:text-[var(--accent-strong)]" aria-label="Wishlist">
                <Heart size={22} className="transition group-hover:text-[var(--accent)]" />
                <span className="absolute -right-2 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-strong)] px-1 text-[9px] font-bold text-white shadow-sm">
                  {safeWishlistCount}
                </span>
              </Link>

              <Show when="signed-out">
                <Link href="/sign-in" className="text-gray-800 transition hover:text-[var(--accent)]" aria-label="Connexion">
                  <User size={22} />
                </Link>
              </Show>

              <Show when="signed-in">
                <div className="flex items-center gap-3" aria-label="Mon profil">
                  <UserButton />
                  <Link href="/admin" className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-800 transition hover:text-[var(--accent)]">
                    Dashboard
                  </Link>
                </div>
              </Show>

              <button
                type="button"
                onClick={openDrawer}
                className="group relative flex items-center text-gray-800"
                aria-label="Ouvrir le panier"
              >
                <ShoppingBag size={22} className="transition group-hover:text-[var(--accent)]" />
                <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-strong)] text-[9px] font-bold text-white shadow-sm">
                  {safeCartCount}
                </span>
              </button>
            </div>
          </div>
        </nav>

        {mobileOpen ? (
          <div className="border-t border-rose-200 bg-white px-6 pb-5 pt-4 lg:hidden">
            <form onSubmit={submitSearch} className="mb-4 flex items-center gap-2">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search..."
                disabled={isSearchPending}
                className="w-full rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--ink)] outline-none disabled:cursor-not-allowed disabled:opacity-70"
              />
              <button
                type="submit"
                disabled={isSearchPending}
                className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSearchPending ? "..." : "Go"}
              </button>
            </form>

            <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-700">
              {sourceMenuLinks.map((item) => {
                const Icon = getCategoryIcon(item.slug);

                const resolvedHref = resolveSourceMenuHref(item.slug, item.href);

                return (
                  <Link key={`mobile-${item.slug}`} href={resolvedHref} onClick={() => setMobileOpen(false)} className="inline-flex items-center gap-2">
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <Link href="/wishlist" onClick={() => setMobileOpen(false)}>
                Wishlist ({safeWishlistCount})
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openDrawer();
                }}
                className="text-left"
              >
                Panier ({safeCartCount})
              </button>

              <Link href="/panier" onClick={() => setMobileOpen(false)}>
                Checkout
              </Link>

              <Show when="signed-out">
                <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                  Connexion
                </Link>
              </Show>

              <Show when="signed-in">
                <Link href="/admin" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
              </Show>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
