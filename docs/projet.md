Crée un site e-commerce premium complet nommé **“Ma Petite Lingerie”**, inspiré de l’expérience utilisateur, du niveau de finition et de l’architecture e-commerce du site [https://www.espaceplaisir.fr/](https://www.espaceplaisir.fr/), tout en conservant une identité visuelle originale, moderne, élégante et haut de gamme.

Le projet doit être **100% fonctionnel, full-stack, autonome, déployable immédiatement**, avec frontend, backend, administration, système e-commerce complet et base de données locale sans dépendance à une API externe pour les produits.

---

# Stack technique imposée

* Next.js 15 (App Router)
* TypeScript
* Prisma ORM
* SQLite
* TailwindCSS
* shadcn/ui
* Clerk Auth → [https://clerk.com/](https://clerk.com/)
* Zustand ou Context API
* Resend pour les emails → [https://resend.com/](https://resend.com/)
* Stripe-ready pour carte bancaire → [https://stripe.com/](https://stripe.com/)
* Architecture propre scalable
* Compatible Vercel → [https://vercel.com/](https://vercel.com/)
* Compatible auto-host
* SEO optimisé
* Responsive mobile-first

---

# Objectif du site

Créer une boutique e-commerce premium spécialisée dans :

* lingerie,
* ensembles,
* nuisettes,
* accessoires,
* collants,
* bodys,
* vêtements féminins élégants,
* collections premium.

Le site doit être visuellement :

* féminin,
* luxueux,
* fluide,
* moderne,
* rapide,
* minimaliste,
* immersif,
* orienté conversion e-commerce.

---

# Inspiration design

S’inspirer fortement :

* du menu,
* du catalogue,
* du système de catégories,
* des fiches produits,
* du tunnel d’achat,
* des animations,
* du responsive,
* des sections marketing,
* des blocs promotions,
  du site de référence :
  [https://www.espaceplaisir.fr/](https://www.espaceplaisir.fr/)

⚠️ Ne jamais copier directement le design source.

Créer une identité unique avec :

* noir premium,
* rose poudré,
* beige clair,
* blanc cassé,
* accents gold.

Ajouter :

* micro animations,
* transitions fluides,
* hover premium,
* skeleton loading,
* animations Framer Motion → [https://www.framer.com/motion/](https://www.framer.com/motion/)

---

# Architecture complète attendue

## Frontend

Créer :

* homepage premium,
* catalogue,
* catégories,
* sous-catégories,
* fiches produits,
* wishlist,
* panier,
* checkout,
* compte client,
* historique commandes,
* suivi commande,
* blog,
* contact,
* FAQ,
* CGV,
* politique de confidentialité,
* mentions légales.

---

# Système e-commerce complet

## Produits

Chaque produit doit gérer :

* nom,
* slug SEO,
* description courte,
* description longue,
* galerie images,
* vidéos,
* prix,
* ancien prix,
* promotions,
* stock,
* SKU,
* variantes,
* tailles,
* couleurs,
* badges,
* produits associés,
* upsell,
* cross-sell,
* avis clients,
* notation étoiles,
* disponibilité.

---

# Système de catégories

Créer :

* catégories dynamiques,
* sous-catégories,
* filtres avancés,
* recherche instantanée,
* tri produits,
* pagination,
* navigation fluide.

---

# Système de panier

Créer :

* add to cart AJAX,
* mini-cart animé,
* panier persistant,
* sauvegarde session,
* gestion quantité,
* suppression produit,
* calcul automatique total,
* coupons promo,
* réductions,
* livraison dynamique.

---

# Checkout avancé

Créer un tunnel d’achat professionnel :

* informations client,
* adresse livraison,
* adresse facturation,
* choix livraison,
* choix paiement,
* résumé commande,
* validation commande.

Ajouter :

* progression visuelle checkout,
* validation formulaire,
* UX conversion optimisée.

---

# Système de paiement

## Carte bancaire

Préparer une intégration Stripe propre :
[https://stripe.com/](https://stripe.com/)

## Virement bancaire

Créer un système administrable :

* IBAN,
* BIC,
* titulaire,
* instructions,
* validation manuelle.

## Gestion paiement

Créer :

* statuts paiement,
* commandes en attente,
* paiements confirmés,
* remboursements manuels,
* historique transactions.

---

# Système d’authentification

Utiliser Clerk avec :

* connexion,
* inscription,
* récupération mot de passe,
* espace client,
* rôles admin/client,
* sécurisation routes.

Documentation :
[https://clerk.com/docs](https://clerk.com/docs)

---

# Dashboard administration complet

Créer un admin panel premium permettant :

## Gestion catalogue

* ajouter produit,
* modifier produit,
* supprimer produit,
* gestion stock,
* gestion catégories,
* gestion variantes,
* upload images.

## Gestion commandes

* voir commandes,
* changer statut,
* confirmer paiement,
* imprimer facture,
* exporter commandes.

## Gestion clients

* voir utilisateurs,
* historique achats,
* gestion comptes.

## Gestion marketing

* coupons promo,
* bannières,
* homepage,
* newsletter,
* popups marketing.

## Gestion contenu

* pages CMS,
* FAQ,
* articles blog.

## Paramètres boutique

* méthodes paiement,
* frais livraison,
* TVA,
* devise,
* emails,
* SEO global.

---

# Système email

Utiliser Resend :
[https://resend.com/](https://resend.com/)

Pour :

* confirmation commande,
* facture,
* création compte,
* récupération mot de passe,
* changement statut commande,
* notifications admin.

Créer des templates HTML modernes et responsive.

---

# Système d’avis clients

Créer :

* notation étoiles,
* commentaires,
* validation admin,
* moyenne automatique,
* affichage sur fiche produit.

---

# Système SEO avancé

Optimiser :

* metadata dynamiques,
* Open Graph,
* Twitter Cards,
* sitemap.xml,
* robots.txt,
* URLs propres,
* schema.org,
* performances Lighthouse 95+.

Utiliser :
[https://nextjs.org/docs/app/building-your-application/optimizing/metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

---

# Performance & UX

Optimiser :

* lazy loading,
* image optimization,
* server actions,
* cache,
* pagination optimisée,
* chargement ultra rapide,
* responsive parfait.

---

# Sécurité

Ajouter :

* validation backend,
* sanitization,
* protection admin,
* rate limiting,
* gestion erreurs,
* CSRF protection,
* secure auth flow.

---

# Base de données

Créer les modèles Prisma complets pour :

* users,
* products,
* categories,
* variants,
* orders,
* order_items,
* payments,
* reviews,
* addresses,
* coupons,
* newsletters,
* settings.

Ajouter :

* migrations Prisma,
* seed database,
* données de démonstration.

Documentation Prisma :
[https://www.prisma.io/docs](https://www.prisma.io/docs)

---

# Données démo

Pré-remplir :

* catégories,
* sous-catégories,
* produits réalistes,
* bannières,
* avis clients,
* homepage marketing,
* collections premium.

Utiliser des images libres de droits provenant par exemple de :

* [https://unsplash.com/](https://unsplash.com/)
* [https://pexels.com/](https://pexels.com/)

---

# Fonctionnalités premium supplémentaires

Ajouter :

* dark mode,
* newsletter popup,
* wishlist,
* recently viewed,
* produits tendance,
* recommandations intelligentes simples,
* sticky add to cart,
* quick view produit,
* zoom image,
* galerie produit moderne,
* animations premium.

---

# Architecture technique avancée

Créer une architecture professionnelle avec :

## Backend

* API Routes Next.js
* Server Actions
* validation Zod → [https://zod.dev/](https://zod.dev/)
* services séparés
* repositories
* gestion centralisée des erreurs
* middlewares auth/admin

## Frontend

* composants réutilisables,
* hooks personnalisés,
* architecture feature-based,
* types TypeScript stricts,
* bonnes pratiques Next.js 15.

## Structure dossier propre

Exemple :

* /app
* /components
* /features
* /lib
* /services
* /actions
* /prisma
* /emails
* /hooks
* /types
* /store

---

# Fonctionnalités système avancées

Ajouter :

* système de logs,
* gestion erreurs globale,
* toasts notifications,
* loaders globaux,
* fallback UI,
* upload image drag-and-drop,
* optimisation image automatique,
* mode maintenance,
* système de paramètres globaux,
* génération facture PDF,
* export CSV commandes,
* recherche admin avancée,
* analytics dashboard simple,
* système de rôles,
* protection routes admin,
* middleware sécurité,
* pagination serveur,
* cache intelligent,
* système favoris,
* historique navigation produit,
* gestion newsletter.

---

# DevOps & Déploiement

Le projet doit inclure :

* README ultra détaillé,
* variables d’environnement `.env.example`,
* commandes installation,
* commandes Prisma,
* scripts seed,
* configuration Vercel,
* configuration build production,
* optimisation SEO,
* optimisation performances.

Documentation :

* [https://nextjs.org/docs](https://nextjs.org/docs)
* [https://vercel.com/docs](https://vercel.com/docs)

---

# Livraison attendue

Le projet doit être :

* immédiatement lançable,
* sans fonctionnalités mockées,
* entièrement fonctionnel,
* prêt pour production,
* prêt déploiement Vercel,
* avec code propre et maintenable,
* avec architecture professionnelle,
* avec UX/UI premium comparable à une vraie boutique e-commerce moderne haut de gamme.
