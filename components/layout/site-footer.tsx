import Image from "next/image";
import Link from "next/link";

import { sourceFooterShopLinks } from "@/features/source/data/source-data";
import { resolveSourceMenuHref } from "@/features/source/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="relative bg-[var(--rose-nude)] px-8 pb-16 pt-24 lg:pt-32" id="conseils">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-24 grid grid-cols-1 gap-14 lg:grid-cols-5 lg:gap-20">
          <div className="space-y-10 lg:col-span-2">
            <Link href="/" className="flex w-fit flex-col items-start" aria-label="Accueil Ma Petite Lingerie">
              <Image
                src="/logo-nav-femme.png"
                alt="Logo Ma Petite Lingerie Femme"
                width={250}
                height={278}
                className="h-auto w-[95px] sm:w-[120px]"
              />
              <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.32em] text-rose-900">
                Ma Petite Lingerie
              </span>
            </Link>
            <p className="max-w-md text-base leading-relaxed text-gray-600">
              Une maison de creation francaise qui celebre l&apos;intimite avec elegance. Inspiration premium, produits selectionnes et experience discretes.
            </p>
            <div className="flex items-center gap-8 text-sm uppercase tracking-[0.2em] text-rose-900">
              <Link href="#" className="hover:text-[var(--accent)]">Instagram</Link>
              <Link href="#" className="hover:text-[var(--accent)]">Pinterest</Link>
              <Link href="#" className="hover:text-[var(--accent)]">Facebook</Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-rose-900">La boutique</h4>
            <ul className="space-y-4 text-[14px] font-medium text-gray-600">
              {sourceFooterShopLinks.map((item) => {
                const resolvedHref = resolveSourceMenuHref(item.slug, item.href);

                return (
                  <li key={item.slug}>
                    <Link href={resolvedHref} className="hover:text-[var(--accent)]">
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-rose-900">Assistance</h4>
            <ul className="space-y-4 text-[14px] font-medium text-gray-600">
              <li><Link href="#" className="hover:text-[var(--accent)]">Expedition express</Link></li>
              <li><Link href="#" className="hover:text-[var(--accent)]">Paiement securise</Link></li>
              <li><Link href="#" className="hover:text-[var(--accent)]">Livraison discrete</Link></li>
              <li><Link href="#" className="hover:text-[var(--accent)]">Nous contacter</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-rose-900">Maison</h4>
            <ul className="space-y-4 text-[14px] font-medium text-gray-600">
              <li><Link href="#" className="hover:text-[var(--accent)]">Notre histoire</Link></li>
              <li><Link href="/conseils" className="hover:text-[var(--accent)]">Conseils et guides</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-[var(--accent)]">Mentions legales</Link></li>
              <li><Link href="/cgu-cgv" className="hover:text-[var(--accent)]">CGU et CGV</Link></li>
              <li><Link href="/politique-confidentialite" className="hover:text-[var(--accent)]">Confidentialite</Link></li>
              <li><Link href="/politique-cookies" className="hover:text-[var(--accent)]">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-8 border-t border-rose-300 pt-10 md:flex-row">
          <p className="text-[11px] font-bold uppercase tracking-widest text-rose-800">
            Copyright 2026 Ma Petite Lingerie Paris. Pense pour vous avec soin.
          </p>
          <div className="flex items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Stripe</span>
            <span>Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

