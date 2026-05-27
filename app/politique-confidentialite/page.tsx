import { Container } from "@/components/ui/container";
import { LegalLinks } from "@/features/legal/components/legal-links";
import { legalCompanyProfile, legalContact } from "@/features/legal/data/legal-company";

export default function PolitiqueConfidentialitePage() {
  return (
    <Container>
      <section className="space-y-8 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Legal</p>
          <h1 className="font-display text-5xl text-[var(--ink)]">Politique de confidentialite</h1>
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            Cette politique explique comment {legalCompanyProfile.brandName} collecte, utilise et protege les donnees personnelles des utilisateurs du site.
          </p>
        </header>

        <LegalLinks currentHref="/politique-confidentialite" />

        <article className="space-y-6 rounded-3xl border border-[var(--line)] bg-white/90 p-6 sm:p-8 text-[var(--muted)]">
          <section className="space-y-3">
            <h2 className="font-display text-3xl text-[var(--ink)]">Responsable du traitement</h2>
            <p>{legalCompanyProfile.legalName}, {legalCompanyProfile.headOffice}</p>
            <p>
              Contact donnees personnelles: <a className="underline" href={`mailto:${legalContact.email}`}>{legalContact.email}</a>
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Donnees collectees</h2>
            <p>Selon votre usage du site, nous pouvons collecter:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>donnees d&apos;identification et de contact (nom, email, telephone, adresse de livraison);</li>
              <li>donnees de commande (produits, montant, moyen de paiement, reference);</li>
              <li>donnees de compte (authentification via Clerk, identifiant utilisateur);</li>
              <li>donnees techniques et de navigation (cookies, logs, pages consultees).</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Finalites et bases legales</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>traitement des commandes et execution du contrat;</li>
              <li>gestion du service client et suivi post-achat (interet legitime et contrat);</li>
              <li>securisation du site et prevention des fraudes (interet legitime);</li>
              <li>envoi d&apos;informations commerciales si consentement ou relation client existante.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Destinataires des donnees</h2>
            <p>
              Les donnees sont accessibles uniquement aux equipes habilitees et a certains sous-traitants techniques (hebergement, authentification, paiement, analytics)
              strictement necessaires au fonctionnement du service.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Duree de conservation</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>compte client: pendant la duree d&apos;activite du compte puis archivage limite;</li>
              <li>commandes/facturation: conservation legale comptable et fiscale;</li>
              <li>logs techniques: conservation limitee a la securite du service;</li>
              <li>prospection: jusqu&apos;au retrait du consentement ou opposition.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Vos droits</h2>
            <p>
              Conformement au RGPD et a la loi Informatique et Libertes, vous disposez des droits d&apos;acces, rectification, effacement, limitation,
              opposition et portabilite de vos donnees.
            </p>
            <p>
              Pour exercer vos droits: <a className="underline" href={`mailto:${legalContact.email}`}>{legalContact.email}</a>
            </p>
            <p>
              Vous pouvez egalement introduire une reclamation aupres de la CNIL (www.cnil.fr).
            </p>
          </section>
        </article>
      </section>
    </Container>
  );
}