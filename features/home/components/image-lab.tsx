"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

type GeneratedImage = {
  url: string;
  revisedPrompt?: string;
  provider: string;
  model: string;
};

export function ImageLab() {
  const [prompt, setPrompt] = useState(
    "Editorial luxury lingerie product photo on ivory background, soft studio lighting, premium ecommerce style",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: "gpt-image-2",
          size: "1536x1024",
          quality: "medium",
        }),
      });

      if (!response.ok) {
        throw new Error("Generation impossible pour le moment");
      }

      const payload = (await response.json()) as GeneratedImage;
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[var(--line)] bg-white/80 p-6 backdrop-blur sm:p-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Visual AI Lab</p>
        <h3 className="font-display text-3xl text-[var(--ink)]">Generer un visuel premium</h3>
        <p className="text-sm text-[var(--muted)]">
          Utilise ta config API pour produire des bannières, photos produit ou hero visuals directement depuis le site.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="mt-5 space-y-4">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="min-h-28 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none ring-[var(--accent)]/25 transition focus:ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[var(--ink)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {loading ? "Generation..." : "Generer"}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      {result ? (
        <div className="mt-6 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {result.provider} / {result.model}
          </p>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[var(--line)]">
            <Image
              src={result.url}
              alt={result.revisedPrompt ?? prompt}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 60vw, 100vw"
              unoptimized
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
