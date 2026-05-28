export const footerCategoryPages = {
  lingerie: {
    slug: "lingerie",
    eyebrow: "La boutique",
    title: "Lingerie",
    description: "Pieces choisies pour accompagner le quotidien comme les moments plus intimes: ensembles, nuisettes, bas, bodies et silhouettes sensuelles.",
    guidance: [
      "Choisis une coupe qui soutient sans contraindre et privilegie les matieres agreables au contact de la peau.",
      "Pour offrir, les tailles ajustables, nuisettes et accessoires sont souvent plus faciles a selectionner.",
      "Les fiches produits indiquent les tailles, couleurs, matieres et conseils utiles avant commande.",
    ],
  },
  bdsm: {
    slug: "bdsm",
    eyebrow: "La boutique",
    title: "BDSM",
    description: "Accessoires de contrainte, jeux sensoriels et coffrets pour explorer en confiance, avec communication, consentement et progression douce.",
    guidance: [
      "Definis toujours les limites, le rythme et un mot de securite avant toute pratique.",
      "Commence par des accessoires simples et confortables avant d'aller vers des sensations plus intenses.",
      "Verifie les matieres, attaches et recommandations d'usage pour une experience sure et complice.",
    ],
  },
  "bien-etre": {
    slug: "bien-etre",
    eyebrow: "La boutique",
    title: "Bien-etre",
    description: "Lubrifiants, huiles, massage, preservatifs et essentiels du confort intime pour prendre soin de soi avec discretion.",
    guidance: [
      "Lis les compositions et choisis les textures selon l'usage: massage, confort intime ou protection.",
      "Les produits de bien-etre intime doivent etre conserves selon les indications du fabricant.",
      "En cas de doute ou de sensibilite particuliere, demande conseil a un professionnel de sante.",
    ],
  },
  aphrodisiaques: {
    slug: "aphrodisiaques",
    eyebrow: "La boutique",
    title: "Aphrodisiaques",
    description: "Complements, gels et rituels de stimulation du desir selectionnes pour accompagner l'energie, la confiance et la sensualite.",
    guidance: [
      "Respecte les doses conseillees et les precautions indiquees sur chaque fiche produit.",
      "Les complements ne remplacent pas une alimentation variee ni un avis medical en cas de traitement.",
      "Choisis une formule adaptee a ton besoin: desir, endurance, stimulation ou confort.",
    ],
  },
  "jeux-et-librairie": {
    slug: "jeux-et-librairie",
    eyebrow: "La boutique",
    title: "Jeux et librairie",
    description: "Cartes, livres, guides et idees complices pour nourrir la curiosite, ouvrir le dialogue et renouveler les moments a deux.",
    guidance: [
      "Les jeux sont une facon simple de lancer une conversation et d'explorer les envies sans pression.",
      "Les guides et livres apportent des reperes utiles pour mieux comprendre le corps, le plaisir et le consentement.",
      "Choisis selon l'ambiance recherchee: decouverte, humour, sensualite, education ou inspiration.",
    ],
  },
} as const;

export const assistancePages = {
  "expedition-express": {
    eyebrow: "Assistance",
    title: "Expedition express",
    description: "Toutes les informations utiles sur la preparation, l'expedition et le suivi des commandes Ma Petite Lingerie.",
    sections: [
      { title: "Preparation", body: "Les commandes sont preparees avec soin apres validation du paiement. Chaque colis est controle avant expedition afin de limiter les erreurs et ruptures." },
      { title: "Delais", body: "Le delai estime de livraison est de 3 a 7 jours ouvres apres validation de la commande et reception effective du paiement." },
      { title: "Suivi", body: "Lorsqu'un suivi transporteur est disponible, il est communique au client par email afin de suivre l'acheminement du colis." },
    ],
  },
  "paiement-securise": {
    eyebrow: "Assistance",
    title: "Paiement securise",
    description: "Paiement par virement bancaire disponible et paiement par carte affiche selon la configuration technique du site.",
    sections: [
      { title: "Virement bancaire", body: "Le virement bancaire est le moyen de paiement actuellement disponible. La reference de commande doit etre indiquee dans le libelle du virement." },
      { title: "Carte bancaire", body: "Le paiement par carte peut etre temporairement indisponible. Lorsqu'il est active, les donnees sensibles sont traitees par un prestataire de paiement securise." },
      { title: "Validation", body: "La commande est confirmee uniquement apres reception effective du paiement. Un email de confirmation est envoye au client." },
    ],
  },
  "livraison-discrete": {
    eyebrow: "Assistance",
    title: "Livraison discrete",
    description: "Une experience d'achat pensee pour la confidentialite: emballage neutre, preparation soignee et communication claire.",
    sections: [
      { title: "Emballage neutre", body: "Les colis sont prepares de maniere discrete, sans mention explicite du contenu sur l'emballage exterieur." },
      { title: "Confidentialite", body: "Les informations de commande sont utilisees uniquement pour traiter l'achat, la livraison, le service client et les obligations legales." },
      { title: "Reception", body: "A reception, le client doit verifier l'etat du colis et signaler toute anomalie au service client dans les meilleurs delais." },
    ],
  },
  "nous-contacter": {
    eyebrow: "Assistance",
    title: "Nous contacter",
    description: "Une question sur une commande, un produit, une facture ou une information legale ? L'equipe peut etre contactee par email.",
    sections: [
      { title: "Email client", body: "Pour toute demande, ecris a contact@ma-petite-lingerie.com en indiquant si possible la reference de commande." },
      { title: "Commandes", body: "Pour une commande en cours, joins le nom utilise lors de l'achat, l'email de commande et la reference afin de faciliter le traitement." },
      { title: "Informations legales", body: "Les demandes relatives aux donnees personnelles, factures ou mentions legales peuvent etre envoyees a la meme adresse de contact." },
    ],
    ctaHref: "mailto:contact@ma-petite-lingerie.com",
    ctaLabel: "Envoyer un email",
  },
} as const;

export const storyPage = {
  eyebrow: "Maison",
  title: "Notre histoire",
  description: "Ma Petite Lingerie est une maison francaise dediee a l'intimite, au style et au conseil, avec une approche discrete et respectueuse.",
  sections: [
    { title: "Une maison francaise", body: "MA P'TITE LINGERIE est une societe par actions simplifiee immatriculee depuis le 18 mai 2017, dont l'activite declaree est la vente au detail de lingerie, sous-vetements et accessoires." },
    { title: "Notre vision", body: "Nous voulons proposer une experience claire, elegante et rassurante autour de la lingerie, du bien-etre intime et des univers plaisir." },
    { title: "Notre engagement", body: "Selection produit, discretion, informations detaillees et service client attentif guident la construction de chaque page du site." },
  ],
} as const;
