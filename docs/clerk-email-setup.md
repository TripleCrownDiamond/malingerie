# Configuration Emails Clerk

Ce projet utilise Clerk pour l'authentification. Pour activer l'envoi d'emails (verification, welcome, reset password) avec Mailtrap:

1. Ouvrir le dashboard Clerk: https://dashboard.clerk.com/
2. Aller dans `Email, SMS, and Web3` > `Email`.
3. Choisir `Custom SMTP`.
4. Renseigner:
   - Host: `sandbox.smtp.mailtrap.io`
   - Port: `587`
   - Username: `54b32e521c02eb`
   - Password: utiliser votre mot de passe Mailtrap
   - Auth: `PLAIN` ou `LOGIN`
   - TLS: `STARTTLS` (optionnel)
5. Sauvegarder puis tester:
   - Inscription
   - Verification email
   - Reinitialisation mot de passe

## SMTP du projet (commandes/factures)

Le projet envoie aussi les factures via `nodemailer` (checkout). Variables `.env.local` utilisees:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Conseils prod

- Utiliser un domaine dedie (ex: `auth.mapetitelingerie.com`).
- Activer SPF + DKIM + DMARC pour la delivrabilite.
- Verifier les URLs de redirection dans Clerk.
