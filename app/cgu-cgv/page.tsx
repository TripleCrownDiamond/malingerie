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
            <p>
              Les photographies et visuels sont fournis a titre indicatif. Une variation de couleur, d&apos;emballage ou de presentation peut exister selon les lots,
              sans modifier les caracteristiques essentielles du produit commande.
            </p>
            <p>
              Pour les produits relevant de l&apos;intimite, le client est invite a lire attentivement les dimensions, matieres, precautions d&apos;usage,
              recommandations d&apos;hygiene et eventuelles restrictions avant validation de la commande.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">3. Prix et commande</h2>
            <p>
              Les prix sont affiches en EUR. Le client verifie sa commande avant validation et s&apos;engage a fournir des informations exactes.
            </p>
            <p>
              La validation de la commande vaut confirmation du panier, de l&apos;adresse de livraison, du mode de livraison choisi, du moyen de paiement et de
              l&apos;acceptation des presentes conditions generales.
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
            <p>
              En cas de paiement par virement, le client doit indiquer la reference de commande dans le libelle du virement afin de permettre le rapprochement bancaire.
              A defaut de reception du paiement dans le delai indique lors du checkout, la commande peut etre annulee ou remise en stock.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">5. Livraison</h2>
            <p>
              Le delai de livraison estime est de 3 a 7 jours ouvres apres validation de la commande et reception du paiement.
            </p>
            <p>
              Le client doit verifier l&apos;etat du colis a reception et signaler toute anomalie dans un delai maximal de 48h.
            </p>
            <p>
              Les delais sont donnes a titre indicatif et peuvent varier en cas de forte activite, incident transporteur, adresse incomplete, paiement non rapproche
              ou cas de force majeure. Les colis sont prepares de facon discrete, sans mention explicite du contenu sur l&apos;emballage exterieur.
            </p>
          </section>

          <section id="retours-remboursements" className="scroll-mt-28 space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">6. Droit de retractation, retours et remboursements</h2>
            <p>
              Le client consommateur dispose en principe d&apos;un delai de 14 jours pour exercer son droit de retractation a compter de la reception des produits,
              sous reserve des exceptions legales (produits intimes descelles, hygiene, etc.).
            </p>
            <p>
              Le remboursement intervient apres reception et controle des articles retournes selon les conditions communiquees par le service client.
            </p>
            <p>
              Pour exercer son droit de retractation, le client doit contacter le service client a l&apos;adresse <a className="underline" href={`mailto:${legalContact.email}`}>{legalContact.email}</a>
              en indiquant son nom, son email de commande, la reference de commande, les articles concernes et le motif du retour lorsque le client souhaite le preciser.
            </p>
            <p>
              Les produits doivent etre retournes complets, non utilises, non laves, non deteriores, dans leur emballage d&apos;origine lorsque cela est possible,
              avec etiquettes, notices, accessoires et protections intactes. Pour des raisons d&apos;hygiene et de protection de la sante, les produits intimes,
              sous-vetements, sextoys, cosmetiques, lubrifiants, gels, huiles, aphrodisiaques et produits scelles ne sont pas repris lorsqu&apos;ils ont ete descelles,
              ouverts, essayes au contact du corps ou utilises.
            </p>
            <p>
              Les frais de retour sont a la charge du client sauf erreur imputable au vendeur, produit non conforme ou produit defectueux confirme apres controle.
              Le client reste responsable du colis retour jusqu&apos;a sa reception; un mode de retour avec suivi est recommande.
            </p>
            <p>
              Le remboursement est effectue apres reception et verification des articles retournes, dans un delai maximal de 14 jours suivant la recuperation
              des produits ou la fourniture d&apos;une preuve d&apos;expedition conforme. Le remboursement porte sur le prix des produits retournes et, lorsque la loi l&apos;impose,
              sur les frais de livraison standard initiaux. Les frais supplementaires lies a un mode de livraison express ou prioritaire choisi par le client peuvent rester a sa charge.
            </p>
            <p>
              Si le retour est refuse pour non-respect des conditions d&apos;hygiene, deterioration, utilisation ou absence d&apos;element essentiel, le client en est informe.
              Les produits peuvent alors etre renvoyes au client selon les modalites indiquees par le service client.
            </p>
          </section>

          <section id="garanties-legales" className="scroll-mt-28 space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">7. Garanties legales</h2>
            <p>
              Les produits vendus beneficient des garanties legales applicables en droit francais, notamment la garantie legale de conformite et la garantie
              contre les vices caches.
            </p>
            <p>
              La garantie legale de conformite s&apos;applique aux defauts de conformite existant lors de la delivrance du bien, dans les conditions et delais prevus
              par le Code de la consommation. En cas de defaut confirme, le client peut demander la reparation, le remplacement ou, selon les cas prevus par la loi,
              une reduction du prix ou la resolution de la vente.
            </p>
            <p>
              La garantie des vices caches s&apos;applique lorsque le produit presente un defaut cache le rendant impropre a l&apos;usage attendu ou diminuant tellement
              cet usage que le client ne l&apos;aurait pas acquis, ou en aurait donne un moindre prix, s&apos;il l&apos;avait connu.
            </p>
            <p>
              Les garanties ne couvrent pas l&apos;usure normale, l&apos;utilisation non conforme, les dommages causes par un mauvais entretien, un choc, une modification,
              une mauvaise conservation, l&apos;utilisation d&apos;un lubrifiant ou produit incompatible, ou le non-respect des consignes de nettoyage et d&apos;usage.
            </p>
            <p>
              Pour toute demande de garantie, le client doit contacter le service client avec la reference de commande, une description precise du probleme,
              des photos lorsque cela est utile et tout element permettant d&apos;identifier le produit concerne.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">8. Responsabilite</h2>
            <p>
              {legalCompanyProfile.legalName} ne saurait etre tenue responsable des dommages indirects ou de l&apos;usage non conforme des produits.
              L&apos;utilisateur reste responsable de l&apos;utilisation de son compte et de ses identifiants.
            </p>
            <p>
              Le client s&apos;engage a utiliser les produits dans un cadre legal, responsable, consenti et conforme aux notices et recommandations. Les contenus conseils
              publies sur le site sont informatifs et ne remplacent pas un avis medical, juridique ou professionnel adapte a une situation particuliere.
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
            <p>
              Toute reclamation doit etre adressee avec les elements permettant son traitement: identite du client, reference de commande, description du probleme,
              photos si necessaire et solution souhaitee. Une reponse est apportee dans les meilleurs delais.
            </p>
            <p>
              Conformement aux dispositions relatives au reglement amiable des litiges de consommation, le client consommateur peut recourir gratuitement a un
              mediateur de la consommation competent apres demarche ecrite prealable restee infructueuse aupres du service client.
            </p>
          </section>
        </article>
      </section>
    </Container>
  );
}

