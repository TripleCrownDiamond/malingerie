import { Container } from "@/components/ui/container";
import { LegalLinks } from "@/features/legal/components/legal-links";
import { legalCompanyProfile, legalContact } from "@/features/legal/data/legal-company";

export default function CguCgvPage() {
  return (
    <Container>
      <section className="space-y-8 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Legal</p>
          <h1 className="font-display text-5xl text-[var(--ink)]">CGU et CGV</h1>
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            Conditions generales d&apos;utilisation (CGU) et de vente (CGV) applicables aux services et commandes effectues sur {legalCompanyProfile.brandName}.
          </p>
        </header>

        <LegalLinks currentHref="/cgu-cgv" />

        <article className="space-y-6 rounded-3xl border border-[var(--line)] bg-white/90 p-6 sm:p-8 text-[var(--muted)]">
          <section className="space-y-3">
            <h2 className="font-display text-3xl text-[var(--ink)]">1. Objet et champ d&apos;application</h2>
            <p>
              Les presentes CGU/CGV regissent l&apos;utilisation du site et les ventes de produits proposes par {legalCompanyProfile.legalName}.
              Toute commande implique l&apos;acceptation sans reserve des presentes conditions.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">2. Produits et disponibilite</h2>
            <p>
              Les fiches produits presentent les caracteristiques essentielles, prix et visuels. Les offres sont valables dans la limite des stocks disponibles.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">3. Prix et commande</h2>
            <p>
              Les prix sont affiches en EUR. Le client verifie sa commande avant validation et s&apos;engage a fournir des informations exactes.
            </p>
            <p>
              {legalCompanyProfile.brandName} se reserve le droit d&apos;annuler toute commande en cas de fraude ou d&apos;anomalie manifeste.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">4. Paiement</h2>
            <p>
              Le paiement par carte peut etre temporairement indisponible selon la configuration technique du site.
              Le virement bancaire est disponible avec reference de commande obligatoire.
            </p>
            <p>
              La commande est consideree comme confirmee a reception effective du paiement.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">5. Livraison</h2>
            <p>
              Les delais de livraison sont donnes a titre indicatif. Un retard raisonnable ne donne pas automatiquement droit a annulation ou indemnisation.
            </p>
            <p>
              Le client doit verifier l&apos;etat du colis a reception et signaler toute anomalie dans les meilleurs delais.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">6. Droit de retractation</h2>
            <p>
              Le client consommateur dispose en principe d&apos;un delai de 14 jours pour exercer son droit de retractation a compter de la reception des produits,
              sous reserve des exceptions legales (produits intimes descelles, hygiene, etc.).
            </p>
            <p>
              Le remboursement intervient apres reception et controle des articles retournes selon les conditions communiquees par le service client.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">7. Garanties legales</h2>
            <p>
              Les produits vendus beneficient des garanties legales applicables en droit francais, notamment la garantie legale de conformite et la garantie
              contre les vices caches.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">8. Responsabilite</h2>
            <p>
              {legalCompanyProfile.legalName} ne saurait etre tenue responsable des dommages indirects ou de l&apos;usage non conforme des produits.
              L&apos;utilisateur reste responsable de l&apos;utilisation de son compte et de ses identifiants.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">9. Donnees personnelles</h2>
            <p>
              Le traitement des donnees personnelles est decrit dans la politique de confidentialite et la politique cookies du site.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">10. Droit applicable et litiges</h2>
            <p>
              Les presentes conditions sont soumises au droit francais. En cas de litige, une resolution amiable est privilegiee avant toute action judiciaire.
            </p>
            <p>
              Contact reclamations: <a className="underline" href={`mailto:${legalContact.email}`}>{legalContact.email}</a>
            </p>
          </section>
        </article>
      </section>
    </Container>
  );
}