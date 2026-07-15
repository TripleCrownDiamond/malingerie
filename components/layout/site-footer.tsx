"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const shopLinks = [
  { label: "Lingerie", href: "/lingerie" },
  { label: "BDSM", href: "/bdsm" },
  { label: "Bien-etre", href: "/bien-etre" },
  { label: "Aphrodisiaques", href: "/aphrodisiaques" },
  { label: "Jeux et librairie", href: "/jeux-et-librairie" },
  { label: "Marques", href: "/marques" },
];

const assistanceLinks = [
  { label: "Expedition express", href: "/expedition-express" },
  { label: "Paiement securise", href: "/paiement-securise" },
  { label: "Livraison discrete", href: "/livraison-discrete" },
  { label: "Retours et remboursements", href: "/cgu-cgv#retours-remboursements" },
  { label: "Garanties legales", href: "/cgu-cgv#garanties-legales" },
  { label: "Nous contacter", href: "/nous-contacter" },
];

const maisonLinks = [
  { label: "Notre histoire", href: "/notre-histoire" },
  { label: "Conseils et guides", href: "/conseils" },
  { label: "Mentions legales", href: "/mentions-legales" },
  { label: "Conditions generales", href: "/cgu-cgv" },
  { label: "Politique de confidentialite", href: "/politique-confidentialite" },
  { label: "Politique cookies", href: "/politique-cookies" },
];

function isFooterLinkActive(pathname: string, href: string) {
  const currentPath = pathname.replace(/\/$/, "") || "/";
  const hrefPath = href.split("#")[0].replace(/\/$/, "") || "/";

  if (hrefPath === "/") {
    return currentPath === "/";
  }

  return currentPath === hrefPath || currentPath.startsWith(`${hrefPath}/`);
}

function footerLinkClass(isActive: boolean) {
  return isActive
    ? "inline-flex rounded-full bg-white/80 px-3 py-1 text-[var(--accent-strong)] shadow-sm shadow-rose-200"
    : "inline-flex rounded-full px-3 py-1 hover:text-[var(--accent)]";
}

export function SiteFooter() {
  const pathname = usePathname();

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
              Une maison de creation francaise qui celebre l&apos;intimite avec elegance. Inspiration premium, produits selectionnes et experience discrete.
            </p>
            <div className="flex items-center gap-8 text-sm uppercase tracking-[0.2em] text-rose-900">
              <Link href="#" className="hover:text-[var(--accent)]">Instagram</Link>
              <Link href="#" className="hover:text-[var(--accent)]">Pinterest</Link>
              <Link href="#" className="hover:text-[var(--accent)]">Facebook</Link>
            </div>
            <div className="flex items-center gap-3 text-sm text-rose-900">
              <a href="tel:+33630883529" className="hover:text-[var(--accent)]">+33 6 30 88 35 29</a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-rose-900">La boutique</h4>
            <ul className="space-y-4 text-[14px] font-medium text-gray-600">
              {shopLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isFooterLinkActive(pathname, item.href) ? "page" : undefined}
                    className={footerLinkClass(isFooterLinkActive(pathname, item.href))}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-rose-900">Assistance</h4>
            <ul className="space-y-4 text-[14px] font-medium text-gray-600">
              {assistanceLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isFooterLinkActive(pathname, item.href) ? "page" : undefined}
                    className={footerLinkClass(isFooterLinkActive(pathname, item.href))}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-rose-900">Maison</h4>
            <ul className="space-y-4 text-[14px] font-medium text-gray-600">
              {maisonLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isFooterLinkActive(pathname, item.href) ? "page" : undefined}
                    className={footerLinkClass(isFooterLinkActive(pathname, item.href))}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
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
            <span>Virement bancaire</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

