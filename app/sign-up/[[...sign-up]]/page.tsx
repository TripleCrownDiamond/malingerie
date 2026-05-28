import { SignUp } from "@clerk/nextjs";

import { Container } from "@/components/ui/container";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <Container>
        <section className="py-16 text-center">
          <h1 className="font-display text-4xl text-[var(--ink)]">Inscription indisponible</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">Ajoutez les cles Clerk dans .env.local pour activer l&apos;authentification.</p>
        </section>
      </Container>
    );
  }

  return (
    <Container>
      <section className="relative flex min-h-[72vh] items-center justify-center overflow-hidden py-12">
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-8 h-52 w-52 rounded-full bg-[var(--accent)]/15 blur-3xl" />
        <SignUp
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
          appearance={clerkAppearance}
        />
      </section>
    </Container>
  );
}

