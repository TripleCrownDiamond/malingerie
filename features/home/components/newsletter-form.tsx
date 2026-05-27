"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setStatus("Merci de renseigner une adresse email.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setStatus("Inscription prise en compte. Bienvenue dans le cercle prive.");
      setEmail("");
    } catch {
      setStatus("Impossible de finaliser l'inscription pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-4 sm:flex-row sm:gap-5">
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Votre adresse enchantee"
        className="flex-1 rounded-full border-2 border-rose-100 bg-rose-50/50 px-8 py-5 text-base text-gray-700 outline-none transition focus:border-[var(--accent)]/60"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="rounded-full bg-[#1a1a1a] px-10 py-5 text-[12px] font-bold uppercase tracking-[0.3em] text-white shadow-lg transition-all hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Inscription..." : "M'abonner"}
      </button>
      {status ? <p className="w-full text-left text-xs text-[var(--muted)] sm:col-span-2">{status}</p> : null}
    </form>
  );
}