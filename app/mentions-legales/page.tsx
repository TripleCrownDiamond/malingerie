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
            Informations legales de l&apos;editeur du site {legalCompanyProfile.brandName} avec les donnees societaires officielles.
          </p>
        </header>

        <LegalLinks currentHref="/mentions-legales" />

        <article className="space-y-6 rounded-3xl border border-[var(--line)] bg-white/90 p-6 text-[var(--muted)] sm:p-8">
          <section className="space-y-3">
            <h2 className="font-display text-3xl text-[var(--ink)]">Editeur du site</h2>
            <p>
              {legalCompanyProfile.legalName} ({legalCompanyProfile.tradeName}) - {legalCompanyProfile.legalForm}
            </p>
            <p>Nom de domaine: {legalCompanyProfile.domain}</p>
            <p>
              Site officiel: <a className="underline" href={legalCompanyProfile.website} target="_blank" rel="noreferrer">{legalCompanyProfile.website}</a>
            </p>
            <p>Siege social: {legalCompanyProfile.headOffice}</p>
            <p>Capital social: {legalCompanyProfile.capitalSocial}</p>
            <p>SIREN: {legalCompanyProfile.siren}</p>
            <p>SIRET (siege): {legalCompanyProfile.siret}</p>
            <p>TVA intracommunautaire: {legalCompanyProfile.vatNumber}</p>
            <p>Code NAF/APE: {legalCompanyProfile.nafCode} - {legalCompanyProfile.nafLabel}</p>
            <p>Activite principale declaree: {legalCompanyProfile.activityDeclared}</p>
            <p>Type d&apos;activite: {legalCompanyProfile.activityType}</p>
            <p>Convention collective deduite: {legalCompanyProfile.collectiveAgreement}</p>
            <p>Statut RCS/INSEE/RNE: Inscrite le {legalCompanyProfile.foundedOn}</p>
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
            <h2 className="font-display text-3xl text-[var(--ink)]">Acces au site</h2>
            <p>
              Le site est accessible sous reserve des interruptions necessaires a la maintenance, a la securite, aux mises a jour ou a tout incident technique
              independant de la volonte de l&apos;editeur. L&apos;editeur peut modifier, suspendre ou retirer une fonctionnalite afin d&apos;ameliorer le service ou de proteger les utilisateurs.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Service client et reclamations</h2>
            <p>
              Pour toute question relative a une commande, une facture, une livraison, un retour, un remboursement ou une garantie, le client peut contacter
              le service client a <a className="underline" href={`mailto:${legalContact.email}`}>{legalContact.email}</a> en indiquant la reference de commande lorsque disponible.
            </p>
            <p>
              Les demandes doivent contenir les informations utiles au traitement: nom, email de commande, produit concerne, description du probleme,
              photos en cas de colis endommage ou produit defectueux, et solution souhaitee lorsque cela est pertinent.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Donnees personnelles et cookies</h2>
            <p>
              Les modalites de traitement des donnees personnelles sont detaillees dans la <Link className="underline" href="/politique-confidentialite">politique de confidentialite</Link>.
              Les cookies et traceurs sont presentes dans la <Link className="underline" href="/politique-cookies">politique cookies</Link>.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Sources et mises a jour</h2>
            <p>
              Source principale:
              {" "}
              <a className="underline" href={legalCompanyProfile.sourceUrl} target="_blank" rel="noreferrer">{legalCompanyProfile.sourceUrl}</a>
            </p>
            <p>Sources consultees et mises a jour le {legalCompanyProfile.sourceCheckedOn}.</p>
            <p>Derniere verification interne des pages legales: {legalCompanyProfile.sourceUpdatedOn}.</p>
          </section>
        </article>

        <p className="text-xs text-[var(--muted)]">
          Besoin d&apos;une correction legale ou societaire ? Ecris-nous via <Link className="underline" href={legalContact.supportPage}>la page conseils/contact</Link>.
        </p>
      </section>
    </Container>
  );
}
