# Ma Petite Lingerie

Boutique e-commerce premium en Next.js (App Router) avec une base produits large, un checkout, des factures PDF et un back-office minimal.

## Stack

- Next.js 16 + TypeScript
- Tailwind CSS v4
- Supabase (state + storage factures)
- Clerk (auth)
- Resend (emails commandes/factures)
- Zustand, Framer Motion, Zod

## Installation locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Variables d'environnement

Voir `.env.example`.

En prod Vercel, les variables obligatoires sont:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM=Ma Petite Lingerie <noreply@ma-petite-lingerie.com>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=https://ma-petite-lingerie.com
```

## Setup Supabase

1. Executer le SQL: `supabase/schema.sql`
2. Verifier que le bucket `invoices` existe
3. Deployer sur Vercel avec les variables ci-dessus

Documentation detaillee:

- `docs/supabase-setup.md`
- `docs/vercel-resend-supabase.md`

## Scripts utiles

```bash
npm run dev
npm run build
npm run lint
npm run scrape:multi
```