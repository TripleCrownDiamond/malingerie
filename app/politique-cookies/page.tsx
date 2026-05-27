import Link from "next/link";

import { Container } from "@/components/ui/container";
import { LegalLinks } from "@/features/legal/components/legal-links";

export default function PolitiqueCookiesPage() {
  return (
    <Container>
      <section className="space-y-8 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Legal</p>
          <h1 className="font-display text-5xl text-[var(--ink)]">Politique cookies</h1>
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            Cette page explique les cookies utilises sur le site, leur role et vos options de parametres.
          </p>
        </header>

        <LegalLinks currentHref="/politique-cookies" />

        <article className="space-y-6 rounded-3xl border border-[var(--line)] bg-white/90 p-6 sm:p-8 text-[var(--muted)]">
          <section className="space-y-3">
            <h2 className="font-display text-3xl text-[var(--ink)]">Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte depose sur votre terminal lors de la consultation du site. Il permet de memoriser des informations
              de navigation pour ameliorer votre experience.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Categories de cookies</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>Cookies essentiels: necessaires au fonctionnement du panier, checkout et securite.</li>
              <li>Cookies de preferences: memorisation de certains choix d&apos;interface.</li>
              <li>Cookies de mesure d&apos;audience: analyse des usages pour ameliorer le site.</li>
              <li>Cookies marketing: personnalisation publicitaire, uniquement avec consentement.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Base legale</h2>
            <p>
              Les cookies strictement necessaires reposent sur l&apos;interet legitime et la necessite technique.
              Les cookies non essentiels sont deposes uniquement apres votre consentement.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Gestion de vos choix</h2>
            <p>
              Vous pouvez accepter, refuser ou personnaliser vos choix de cookies depuis le bandeau de consentement ou les reglages de votre navigateur.
            </p>
            <p>
              Le refus de certains cookies peut limiter certaines fonctionnalites (connexion, personnalisation, analytics).
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Pour aller plus loin</h2>
            <p>
              Consultez aussi la <Link className="underline" href="/politique-confidentialite">politique de confidentialite</Link> pour le detail du traitement des donnees personnelles.
            </p>
          </section>
        </article>
      </section>
    </Container>
  );
}