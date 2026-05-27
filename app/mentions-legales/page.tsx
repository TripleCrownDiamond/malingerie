import Link from "next/link";

import { Container } from "@/components/ui/container";
import { LegalLinks } from "@/features/legal/components/legal-links";
import { legalCompanyProfile, legalContact, legalHost } from "@/features/legal/data/legal-company";

export default function MentionsLegalesPage() {
  return (
    <Container>
      <section className="space-y-8 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Legal</p>
          <h1 className="font-display text-5xl text-[var(--ink)]">Mentions legales</h1>
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            Informations legales de l&apos;editeur du site {legalCompanyProfile.brandName} et references societaires basees sur la fiche officielle disponible sur Societe.com.
          </p>
        </header>

        <LegalLinks currentHref="/mentions-legales" />

        <article className="space-y-6 rounded-3xl border border-[var(--line)] bg-white/90 p-6 sm:p-8 text-[var(--muted)]">
          <section className="space-y-3">
            <h2 className="font-display text-3xl text-[var(--ink)]">Editeur du site</h2>
            <p>
              {legalCompanyProfile.legalName} ({legalCompanyProfile.brandName}) - {legalCompanyProfile.legalForm}
            </p>
            <p>Siege social: {legalCompanyProfile.headOffice}</p>
            <p>SIREN: {legalCompanyProfile.siren}</p>
            <p>SIRET (siege): {legalCompanyProfile.siret}</p>
            <p>TVA intracommunautaire: {legalCompanyProfile.vatNumber}</p>
            <p>Code NAF/APE: {legalCompanyProfile.nafCode} - {legalCompanyProfile.nafLabel}</p>
            <p>Immatriculation: societe active depuis le {legalCompanyProfile.foundedOn}</p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Direction de publication</h2>
            <p>Responsable de la publication: {legalCompanyProfile.publicationDirector}</p>
            <p>
              Contact: <a className="underline" href={`mailto:${legalContact.email}`}>{legalContact.email}</a>
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Hebergement</h2>
            <p>{legalHost.name}</p>
            <p>{legalHost.address}</p>
            <p>
              Site hebergeur: <a className="underline" href={legalHost.website} target="_blank" rel="noreferrer">{legalHost.website}</a>
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Propriete intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus du site (textes, visuels, photos, logos, structure, code) est protege par le droit d&apos;auteur et le droit des marques.
              Toute reproduction, representation, adaptation ou exploitation partielle ou totale sans autorisation ecrite prealable est interdite.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Responsabilite</h2>
            <p>
              L&apos;editeur met tout en oeuvre pour fournir des informations exactes et a jour mais ne peut garantir l&apos;absence d&apos;erreur ou d&apos;indisponibilite temporaire.
              L&apos;utilisateur reste responsable de l&apos;usage qu&apos;il fait des informations et contenus du site.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Source des informations societaires</h2>
            <p>
              Les donnees d&apos;identification (SIREN, SIRET, TVA, adresse, dirigeant) sont alignees sur la fiche:
              {" "}
              <a className="underline" href={legalCompanyProfile.sourceUrl} target="_blank" rel="noreferrer">{legalCompanyProfile.sourceUrl}</a>
              {" "}
              (consultation du {legalCompanyProfile.sourceCheckedOn}).
            </p>
            <p>
              En cas de mise a jour officielle, ces informations seront actualisees dans les plus brefs delais.
            </p>
          </section>
        </article>

        <p className="text-xs text-[var(--muted)]">
          Besoin d&apos;une correction legale ou societaire ? Ecris-nous via <Link className="underline" href={legalContact.supportPage}>la page conseils/contact</Link>.
        </p>
      </section>
    </Container>
  );
}