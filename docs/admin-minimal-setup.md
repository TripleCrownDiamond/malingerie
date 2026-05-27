# Admin Minimaliste - Ma Petite Lingerie

## Fichiers de configuration

- `config/admin.config.json`
  - `allowAnySignedInUser`: si `true`, tout utilisateur connecte Clerk peut acceder a `/admin`.
  - `adminUserIds`: liste des `userId` Clerk autorises si `allowAnySignedInUser=false`.

- `config/bank-transfer.config.json`
  - Coordonnees de virement affichees au checkout.
  - Modifiable depuis `/admin`.

- `config/google-shopping.config.json`
  - Parametres du feed Google Shopping.
  - Modifiable depuis `/admin`.

## URLs utiles

- Admin: `/admin`
- Wishlist: `/wishlist`
- Checkout: `/panier`
- Feed Google Shopping XML: `/google-shopping.xml`

## Variables d'environnement Clerk

Ajouter dans `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_ou_pk_test
CLERK_SECRET_KEY=sk_live_ou_sk_test
```

## Notes d'exploitation

- Ajout produit via admin ecrit dans `features/source/data/source-products.json`.
- Les nouveaux produits sont disponibles pour le feed Google Shopping.
- Selon le mode d'execution/deploiement, un redemarrage peut etre necessaire pour que toutes les pages statiques utilisent le nouveau catalogue.