import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/container";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { readAdminConfig } from "@/lib/server/config-store";

export default async function AdminPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return (
      <Container>
        <section className="space-y-4 py-12">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Admin</p>
          <h1 className="font-display text-5xl text-[var(--ink)]">Configuration requise</h1>
          <p className="max-w-2xl text-sm text-[var(--muted)]">
            Ajoute les variables Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY`) dans `.env.local` pour activer l&apos;acces admin securise.
          </p>
        </section>
      </Container>
    );
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const adminConfig = await readAdminConfig();
  const allowed = adminConfig.allowAnySignedInUser || adminConfig.adminUserIds.includes(userId);

  if (!allowed) {
    return (
      <Container>
        <section className="space-y-4 py-12">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Admin</p>
          <h1 className="font-display text-5xl text-[var(--ink)]">Acces refuse</h1>
          <p className="max-w-2xl text-sm text-[var(--muted)]">
            Ton compte n&apos;est pas encore autorise. Ajoute ton `userId` Clerk dans `config/admin.config.json`.
          </p>
          <Link href="/" className="inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)]">
            Retour accueil
          </Link>
        </section>
      </Container>
    );
  }

  return (
    <Container>
      <section className="space-y-6 py-12">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Admin</p>
        <h1 className="font-display text-5xl text-[var(--ink)]">Panneau de gestion</h1>
        <p className="max-w-3xl text-sm text-[var(--muted)]">
          Ajout produits, configuration virement et parametrage Google Shopping en mode minimaliste.
        </p>
        <AdminDashboard />
      </section>
    </Container>
  );
}