# Setup Supabase (BDD + Factures)

Ce projet stocke les donnees dynamiques dans Supabase:

- configuration admin
- configuration virement
- configuration Google Shopping
- produits source
- commandes
- factures PDF (bucket Storage)

## 1) Variables d'environnement

A renseigner dans `.env.local` et sur Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_APP_STATE_TABLE=app_state
SUPABASE_INVOICES_BUCKET=invoices
```

Important:

- `SUPABASE_SERVICE_ROLE_KEY` est obligatoire en production pour ecrire dans `app_state` et Storage.
- Ne jamais exposer cette cle en `NEXT_PUBLIC_*`.

## 2) Creer les objets Supabase

Executer le SQL:

- `supabase/schema.sql`

## 3) Import initial des donnees

Au premier appel, si `app_state` est vide, l'application lit les fichiers JSON locaux et les copie vers Supabase automatiquement.

## 4) Bucket factures

Le bucket `invoices` est en public read pour que les URLs de facture fonctionnent.
Les ecritures sont faites cote serveur avec la `SUPABASE_SERVICE_ROLE_KEY`.