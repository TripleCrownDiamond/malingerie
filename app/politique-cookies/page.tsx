import Link from "next/link";

import { Container } from "@/components/ui/container";
import { LegalLinks } from "@/features/legal/components/legal-links";
import { legalContact } from "@/features/legal/data/legal-company";

export default function PolitiqueCookiesPage() {
  return (
    <Container>
      <section className="space-y-8 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Legal</p>
          <h1 className="font-display text-5xl text-[var(--ink)]">Politique cookies</h1>
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            Cette page explique les cookies et traceurs utilises sur le site, leur role, leur duree et les moyens disponibles pour gerer votre consentement.
          </p>
        </header>

        <LegalLinks currentHref="/politique-cookies" />

        <article className="space-y-6 rounded-3xl border border-[var(--line)] bg-white/90 p-6 sm:p-8 text-[var(--muted)]">
          <section className="space-y-3">
            <h2 className="font-display text-3xl text-[var(--ink)]">Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte depose sur votre terminal lors de la consultation du site. Il permet de memoriser des informations
              de navigation, de maintenir une session, de securiser certaines actions ou d&apos;ameliorer votre experience.
            </p>
            <p>
              Des technologies proches peuvent egalement etre utilisees: stockage local du navigateur, pixels, identifiants de session ou journaux techniques.
              Par simplicite, le terme cookie designe l&apos;ensemble de ces traceurs dans cette politique.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Categories de cookies</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>Cookies essentiels: necessaires au panier, checkout, securite, connexion, anti-fraude, consentement age et gestion des choix cookies.</li>
              <li>Cookies de preferences: memorisation de certains choix d&apos;interface, langue, affichage ou preferences utilisateur.</li>
              <li>Cookies de mesure d&apos;audience: statistiques de consultation, pages vues, performance et erreurs pour ameliorer le site.</li>
              <li>Cookies marketing: personnalisation publicitaire, mesure de campagne ou reciblage, uniquement si ces outils sont actives et acceptes.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Cookies strictement necessaires</h2>
            <p>
              Certains cookies sont indispensables et ne peuvent pas etre desactives depuis le bandeau car ils permettent le fonctionnement normal du site:
              conservation du panier, securisation du checkout, maintien de la connexion, protection contre les abus, affichage du bandeau de consentement
              et memorisation de votre confirmation d&apos;age.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Cookies soumis au consentement</h2>
            <p>
              Les cookies non essentiels, notamment certains cookies de mesure d&apos;audience, personnalisation ou marketing, ne sont deposes qu&apos;apres votre accord.
              Vous pouvez les accepter, les refuser ou modifier vos choix a tout moment lorsque l&apos;outil de consentement est disponible.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Duree de conservation</h2>
            <p>
              Les cookies de session disparaissent generalement a la fermeture du navigateur. Les cookies persistants restent stockes pour une duree limitee
              selon leur finalite. Le choix de consentement peut etre conserve jusqu&apos;a 6 mois, sauf modification manuelle ou suppression par l&apos;utilisateur.
            </p>
            <p>
              Les cookies techniques peuvent etre renouveles lorsque vous utilisez le service afin de maintenir la securite, le panier ou la session.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Base legale</h2>
            <p>
              Les cookies strictement necessaires reposent sur l&apos;interet legitime et la necessite technique du service. Les cookies non essentiels reposent
              sur votre consentement, qui peut etre retire sans remettre en cause la legalite des traitements deja effectues.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Gestion de vos choix</h2>
            <p>
              Vous pouvez accepter, refuser ou personnaliser vos choix depuis le bandeau de consentement. Si le bouton de gestion n&apos;est pas visible,
              vous pouvez supprimer les cookies du site depuis les reglages de votre navigateur afin de faire reapparaitre le bandeau.
            </p>
            <p>
              Vous pouvez aussi configurer votre navigateur pour bloquer tout ou partie des cookies. Le refus de certains cookies peut limiter certaines
              fonctionnalites comme la connexion, la personnalisation, le panier, l&apos;analyse d&apos;usage ou certains outils de support.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Services tiers</h2>
            <p>
              Certains services techniques peuvent deposer leurs propres cookies ou utiliser des identifiants: authentification, hebergement, securite,
              paiement, mesure d&apos;audience, gestion d&apos;emails ou outils d&apos;administration. Leur usage depend des fonctionnalites activees sur le site.
            </p>
            <p>
              Pour toute question sur un cookie ou traceur specifique, vous pouvez nous contacter a <a className="underline" href={`mailto:${legalContact.email}`}>{legalContact.email}</a>.
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
