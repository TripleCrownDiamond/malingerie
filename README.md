# Ma Petite Lingerie

Boutique e-commerce premium en Next.js (App Router) avec un design inspire de la structure du site source (menu riche, categories fortes, fiches detaillees, parcours catalogue -> produit -> panier), tout en conservant une identite visuelle originale.

## Stack

- Next.js 16 + TypeScript
- Tailwind CSS v4
- Zustand (panier persistant)
- Framer Motion (animations)
- Zod (validation)
- API interne de generation d'images

## Fonctionnalites implementees

- Homepage premium (hero, categories, best-sellers)
- Catalogue filtre par categorie et recherche
- Fiche produit dynamique (`/produit/[slug]`)
- Panier persistant (`/panier`)
- Donnees source scrappees depuis `data.html` (menu, sections, categories, produits)
- Generation de visuels via endpoint interne `POST /api/images/generate`
- Script CLI pour generer des visuels dans `public/generated`

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Variables d'environnement

Configurer au minimum:

```bash
IMAGE_API_BASE_URL=https://build.lewisnote.com
IMAGE_API_KEY=...
```

## Generation d'images

### 1) Via l'interface

- Ouvrir la homepage
- Utiliser le bloc `Visual AI Lab`
- Saisir un prompt et generer

### 2) Via la CLI

```bash
npm run generate:visual -- --prompt="Luxury lingerie product photo on ivory background" --model=gpt-image-2 --size=1536x1024 --quality=high --output=hero-collection.png
```

L'image est enregistree dans `public/generated/hero-collection.png`.

## Scrape source

```bash
npm run scrape:source
```

Genere automatiquement:

- `features/source/data/source-ui.json`
- `features/source/data/source-categories.json`
- `features/source/data/source-products.json`

## Structure

- `app/` routes Next.js
- `components/` layout + UI communs
- `features/catalog/` data + cartes + filtres
- `features/cart/` store + composants panier
- `features/home/` sections et hero
- `features/source/` donnees generees depuis `data.html`
- `scripts/` scripts utilitaires
- `docs/research/` contexte source public

## Notes

- Le design est inspire de l'experience du site reference, sans copie visuelle directe.
- Les integrations Clerk/Resend/Stripe sont preparees via `.env.example` mais non branchees dans ce lot frontend.
