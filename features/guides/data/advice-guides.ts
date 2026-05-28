export type AdviceGuide = {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  heroCategory: string;
  ctaHref: string;
  ctaLabel: string;
  sections: Array<{ title: string; body: string }>;
  checklist: string[];
};

export const adviceGuides: AdviceGuide[] = [
  {
    slug: "choisir-selon-ton-niveau",
    eyebrow: "Debuter",
    title: "Choisir selon ton niveau",
    summary: "Des reperes simples pour commencer avec des formats progressifs, des matieres douces et une vraie sensation de confiance.",
    heroCategory: "sextoys",
    ctaHref: "/catalogue?categorie=sextoys",
    ctaLabel: "Voir la selection debutant",
    sections: [
      { title: "Commencer progressivement", body: "Privilegie les produits faciles a prendre en main, aux dimensions raisonnables et aux modes d'utilisation clairs. Le confort doit passer avant la performance." },
      { title: "Lire les caracteristiques", body: "Regarde la matiere, les dimensions, la flexibilite, l'autonomie et l'etancheite. Ces details changent beaucoup l'experience au quotidien." },
      { title: "Ecouter le corps", body: "Avance a ton rythme, fais des pauses et garde une communication claire si l'experience se partage a deux." },
    ],
    checklist: ["Formats progressifs", "Matiere douce", "Nettoyage simple", "Lubrifiant adapte"],
  },
  {
    slug: "lubrification-et-douceur",
    eyebrow: "Confort",
    title: "Lubrification et douceur",
    summary: "Le bon lubrifiant transforme le confort, reduit les frictions et rend les sensations plus naturelles.",
    heroCategory: "bien-etre",
    ctaHref: "/catalogue?souscategorie=lubrifiant-et-gel-lubrifiant",
    ctaLabel: "Explorer les lubrifiants",
    sections: [
      { title: "Choisir la bonne base", body: "Les formules a base d'eau sont polyvalentes et compatibles avec la majorite des accessoires. Les textures plus riches conviennent mieux au massage selon les usages." },
      { title: "Adapter selon la pratique", body: "Chaque pratique demande un niveau de glisse different. Mieux vaut renouveler l'application que forcer lorsque le confort diminue." },
      { title: "Respecter les sensibilites", body: "En cas de peau reactive, commence par des compositions simples et evite les parfums ou effets chauffants trop intenses." },
    ],
    checklist: ["Base compatible", "Texture confortable", "Application genereuse", "Composition lisible"],
  },
  {
    slug: "construire-une-complicite",
    eyebrow: "Couple",
    title: "Construire une complicite",
    summary: "Des idees pour parler des envies, poser les limites et transformer la curiosite en moment partage.",
    heroCategory: "jeux-et-librairie",
    ctaHref: "/catalogue?categorie=jeux-et-librairie",
    ctaLabel: "Decouvrir les jeux",
    sections: [
      { title: "Ouvrir la conversation", body: "Les jeux, cartes et guides peuvent aider a formuler les envies sans pression. L'objectif est de creer un cadre leger et respectueux." },
      { title: "Definir les limites", body: "Avant d'essayer, precisez ce qui attire, ce qui intrigue et ce qui reste hors limite. Le consentement doit rester explicite et reversible." },
      { title: "Debriefer simplement", body: "Apres l'experience, prenez quelques minutes pour dire ce qui a plu, ce qui etait moins confortable et ce que vous aimeriez ajuster." },
    ],
    checklist: ["Consentement clair", "Limites partagees", "Mot de securite si besoin", "Feedback apres"],
  },
  {
    slug: "hygiene-et-durabilite",
    eyebrow: "Entretien",
    title: "Hygiene et durabilite",
    summary: "Les bons gestes pour garder ses produits propres, agreables et durables dans le temps.",
    heroCategory: "bien-etre",
    ctaHref: "/catalogue?categorie=bien-etre",
    ctaLabel: "Voir les essentiels bien-etre",
    sections: [
      { title: "Nettoyer avant et apres", body: "Un nettoyage regulier limite les residus et preserve les matieres. Suis toujours les recommandations indiquees sur la fiche produit." },
      { title: "Bien secher et ranger", body: "Laisse secher completement avant rangement et evite le contact direct entre matieres incompatibles." },
      { title: "Verifier l'etat", body: "Si une surface devient poreuse, craquelee ou difficile a nettoyer, il vaut mieux remplacer le produit." },
    ],
    checklist: ["Nettoyage doux", "Sechage complet", "Rangement separe", "Controle regulier"],
  },
];

export function getAdviceGuide(slug: string) {
  return adviceGuides.find((guide) => guide.slug === slug);
}
