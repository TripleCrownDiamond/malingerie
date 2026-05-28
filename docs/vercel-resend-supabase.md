# Deploy Vercel + Supabase + Resend

## 1) Preparer Supabase

- Creer (ou reutiliser) le projet Supabase.
- Executer `supabase/schema.sql` dans SQL Editor.
- Verifier le bucket `invoices` en public read.

## 2) Importer les variables dans Vercel

Dans `Project Settings > Environment Variables`, ajouter:

```env
NEXT_PUBLIC_SITE_URL=https://ma-petite-lingerie.com

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_APP_STATE_TABLE=app_state
SUPABASE_INVOICES_BUCKET=invoices

RESEND_API_KEY=
RESEND_FROM=Ma Petite Lingerie <noreply@ma-petite-lingerie.com>
ADMIN_NOTIFICATION_EMAIL=admin@ma-petite-lingerie.com

# optionnel fallback SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Ma Petite Lingerie <no-reply@ma-petite-lingerie.com>

IMAGE_API_BASE_URL=https://build.lewisnote.com
IMAGE_API_KEY=
```

## 3) Connecter le repo sur Vercel

- Import Project depuis GitHub
- Framework detecte: Next.js
- Build command: `next build` (default)
- Output: `.next` (default)

## 4) Verifications post-deploy

1. Home et catalogue chargent normalement.
2. Login Clerk fonctionne.
3. Creation commande cree une facture PDF.
4. Lien facture pointe vers URL Supabase Storage.
5. Email client/admin part via Resend.

## Notes

- L'app utilise Resend en priorite.
- Si Resend est indisponible, fallback SMTP est tente automatiquement.
- Si Supabase est indisponible, l'app garde un fallback JSON local (utile en dev), mais en prod Vercel il faut Supabase actif.