import Link from "next/link";

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
            Cette politique explique comment {legalCompanyProfile.brandName} collecte, utilise, conserve et protege les donnees personnelles des visiteurs,
            clients et utilisateurs du site.
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
            <p>
              Les demandes relatives a la confidentialite sont traitees par le service client ou toute personne habilitee par la societe. Pour faciliter
              la verification, une preuve d&apos;identite peut etre demandee lorsque la demande porte sur des donnees sensibles ou une commande precise.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Personnes concernees</h2>
            <p>
              Le site s&apos;adresse a des personnes majeures. Les produits et contenus lies a l&apos;intimite ne sont pas destines aux mineurs. En utilisant le site,
              l&apos;utilisateur declare disposer de la capacite juridique necessaire pour consulter le site, creer un compte ou passer commande.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Donnees collectees</h2>
            <p>Selon votre usage du site, nous pouvons collecter:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>donnees d&apos;identification et de contact: nom, prenom, email, telephone, adresses de livraison et de facturation;</li>
              <li>donnees de commande: produits, quantites, prix, reductions, statut, reference, facture, suivi de livraison et historique d&apos;echanges;</li>
              <li>donnees de paiement: moyen de paiement choisi, statut de paiement, reference de virement; les donnees completes de carte bancaire ne sont pas stockees par le site;</li>
              <li>donnees de compte: identifiant utilisateur, email de connexion, historique d&apos;authentification, role admin si applicable;</li>
              <li>donnees de service client: messages, pieces jointes, demandes de retour, garantie, remboursement ou reclamation;</li>
              <li>donnees marketing: inscription newsletter, consentements, desinscriptions et preferences de communication;</li>
              <li>donnees techniques: adresse IP, logs, navigateur, appareil, pages consultees, cookies, erreurs et evenements de securite.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Origine des donnees</h2>
            <p>
              Les donnees sont principalement fournies directement par le client lors de la navigation, de la creation de compte, du checkout, d&apos;une demande de contact
              ou d&apos;une inscription a une communication. Certaines donnees techniques sont generees automatiquement par le fonctionnement du site.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Finalites et bases legales</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>creation et gestion du compte client: execution du contrat ou mesures precontractuelles;</li>
              <li>traitement des commandes, factures, livraisons, retours, remboursements et garanties: execution du contrat;</li>
              <li>conservation comptable et fiscale des factures et justificatifs: obligation legale;</li>
              <li>gestion du service client, reclamations et suivi post-achat: execution du contrat et interet legitime;</li>
              <li>securisation du site, prevention des fraudes, controle des abus et maintenance: interet legitime;</li>
              <li>amelioration du site, mesure d&apos;audience et statistiques non essentielles: consentement lorsque requis;</li>
              <li>envoi d&apos;informations commerciales: consentement ou interet legitime pour des produits analogues, avec possibilite d&apos;opposition.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Destinataires et sous-traitants</h2>
            <p>
              Les donnees sont accessibles uniquement aux personnes habilitees et aux prestataires strictement necessaires au fonctionnement du service:
              hebergement, base de donnees, authentification, envoi d&apos;emails, paiement, livraison, facturation, securite, support et outils techniques.
            </p>
            <p>
              Ces prestataires agissent selon nos instructions ou en qualite de responsables independants lorsque la loi l&apos;impose. Des garanties contractuelles
              et techniques sont recherchees afin de limiter les acces aux donnees necessaires.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Transferts hors Union europeenne</h2>
            <p>
              Certains prestataires techniques peuvent etre situes hors de l&apos;Union europeenne ou traiter des donnees depuis des pays tiers. Dans ce cas,
              {" "}{legalCompanyProfile.brandName} veille a s&apos;appuyer sur les mecanismes prevus par le RGPD, notamment clauses contractuelles types,
              garanties equivalentes ou decisions d&apos;adequation lorsque disponibles.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Duree de conservation</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>compte client: pendant la duree d&apos;activite du compte, puis suppression ou archivage limite lorsqu&apos;une obligation legale subsiste;</li>
              <li>commandes, factures et elements comptables: jusqu&apos;aux durees legales applicables en matiere commerciale, comptable et fiscale;</li>
              <li>service client, retours, remboursements et garanties: pendant la duree necessaire au traitement, puis archivage pendant les delais de preuve;</li>
              <li>logs techniques et securite: conservation limitee aux besoins de securite, diagnostic et prevention des abus;</li>
              <li>cookies de consentement: selon la politique cookies et la duree affichee dans le bandeau de consentement;</li>
              <li>prospection: jusqu&apos;au retrait du consentement, opposition ou inactivite prolongee selon les regles applicables.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Securite et confidentialite</h2>
            <p>
              Nous mettons en place des mesures raisonnables de securite: acces restreints, authentification, separation des roles, sauvegardes lorsque necessaire,
              surveillance des erreurs, chiffrement des communications via HTTPS et limitation des donnees collectees. Aucun systeme n&apos;etant infaillible,
              l&apos;utilisateur doit aussi proteger ses identifiants et utiliser une adresse email securisee.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="font-display text-3xl text-[var(--ink)]">Vos droits</h2>
            <p>
              Conformement au RGPD et a la loi Informatique et Libertes, vous disposez des droits d&apos;acces, rectification, effacement, limitation,
              opposition et portabilite de vos donnees. Vous pouvez aussi retirer votre consentement a tout moment lorsque le traitement repose sur celui-ci.
            </p>
            <p>
              Pour exercer vos droits: <a className="underline" href={`mailto:${legalContact.email}`}>{legalContact.email}</a>. Merci d&apos;indiquer l&apos;objet de votre demande,
              l&apos;adresse email concernee et, si besoin, la reference de commande. Une reponse est apportee dans le delai legal applicable, sauf demande complexe.
            </p>
            <p>
              Vous pouvez egalement introduire une reclamation aupres de la CNIL: <Link className="underline" href="https://www.cnil.fr" target="_blank" rel="noreferrer">www.cnil.fr</Link>.
            </p>
          </section>
        </article>
      </section>
    </Container>
  );
}
