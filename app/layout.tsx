import type { Metadata } from "next";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { ConsentBanners } from "@/features/legal/components/consent-banners";
import { clerkAppearance } from "@/lib/clerk-appearance";

import "./globals.css";

export const metadata: Metadata = {
  title: "Ma Petite Lingerie | Premium & Sensuel",
  description:
    "Maison premium de lingerie et bien-etre intime: collections couture, sextoys design et experience e-commerce haut de gamme.",
  icons: {
    icon: "/logo-ma-petite-lingerie.png",
    shortcut: "/logo-ma-petite-lingerie.png",
    apple: "/logo-ma-petite-lingerie.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-[var(--paper)] text-[var(--ink)]" suppressHydrationWarning>
        <ClerkProvider appearance={clerkAppearance}>
          <div className="min-h-screen">
            <div className="border-b border-[var(--line)] bg-white/90 px-4 py-2">
              <div className="mx-auto flex w-full max-w-[1600px] items-center justify-end gap-2">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)] transition hover:border-[var(--accent)]"
                    >
                      Connexion
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className="rounded-full bg-[var(--ink)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--paper)] transition hover:opacity-90"
                    >
                      Inscription
                    </button>
                  </SignUpButton>
                </Show>

                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </div>

            <SiteHeader />
            <CartDrawer />
            <main>{children}</main>
            <SiteFooter />
            <ConsentBanners />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}