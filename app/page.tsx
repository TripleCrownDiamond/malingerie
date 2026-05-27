import Image from "next/image";
import Link from "next/link";
import { Flower2, Gift, Sparkles } from "lucide-react";

import { products } from "@/features/catalog/data/products";
import { getCategoryLabel } from "@/features/catalog/lib/filters";
import { HeroCarousel } from "@/features/home/components/hero-carousel";
import {
  categoryCards,
  sourcePromoBanners,
  sourceStoryCards,
} from "@/features/home/data/luxury-content";
import { NewsletterForm } from "@/features/home/components/newsletter-form";

const priorityCategorySlugs = new Set(["lingerie", "sextoys"]);
const priorityProducts = products.filter((product) => priorityCategorySlugs.has(product.categorySlug));
const remainingProducts = products.filter((product) => !priorityCategorySlugs.has(product.categorySlug));
const bestSellers = [...priorityProducts, ...remainingProducts].slice(0, 12);

const storyIcons = [Flower2, Gift, Sparkles];

const editorialSections = [
  {
    slug: "lingerie",
    title: "Lingerie Signature",
    description: "Corseterie fine, ensembles et lignes sensuelles pour des silhouettes affirmees.",
  },
  {
    slug: "sextoys",
    title: "Plaisir Contemporain",
    description: "Objets design et sensations precises pour des moments intimes personnalises.",
  },
  {
    slug: "bdsm",
    title: "Atelier BDSM",
    description: "Selection dediee aux jeux de role, a l'exploration et au consentement eclaire.",
  },
];

const editorialProductSections = editorialSections
  .map((section) => ({
    ...section,
    products: products.filter((item) => item.categorySlug === section.slug).slice(0, 8),
  }))
  .filter((section) => section.products.length > 0);

export default function HomePage() {
  return (
    <>
      <HeroCarousel />

      <div className="divider-rose" />

      <section className="border-b border-rose-300 bg-[var(--rose-powder)] px-8 py-14">
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-12 md:grid-cols-3">
          {sourceStoryCards.map((item, index) => {
            const Icon = storyIcons[index] ?? Sparkles;
            return (
              <article
                key={item.title}
                className={`flex flex-col items-center space-y-3 text-center ${
                  index === 1 ? "md:border-x md:border-rose-300" : ""
                }`}
              >
                <Icon className="mb-2 h-9 w-9 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-rose-900">{item.title}</h3>
                <p className="max-w-xs text-sm italic text-gray-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-8 py-14 lg:py-16">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-8 text-center">
            <h2 className="font-display text-4xl text-rose-900">Lingerie et plaisir en priorite</h2>
            <p className="mt-3 text-sm uppercase tracking-[0.22em] text-gray-500">Les univers les plus recherches en premier</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {sourcePromoBanners.map((banner) => (
              <Link key={banner.image} href={banner.href} className="group relative block overflow-hidden rounded-2xl">
                <div className="relative aspect-[6/5]">
                  <Image src={banner.image} alt={banner.label} fill className="img-zoom object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="mb-3 text-base font-semibold leading-snug">{banner.label}</p>
                    <span className="inline-block border border-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]">
                      {banner.ctaLabel}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-24 lg:py-32">
        <div className="mb-20 text-center">
          <h2 className="font-display text-5xl text-rose-900">Nos categories phares</h2>
          <div className="mx-auto mb-4 mt-6 h-1 w-24 bg-[linear-gradient(135deg,var(--accent-soft)_0%,var(--accent)_100%)]" />
          <p className="text-lg italic uppercase tracking-[0.22em] text-gray-500">Structure inspiree de la source, adaptee a Ma Petite Lingerie</p>
        </div>

        <div className="mx-auto grid w-full max-w-[1800px] grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-7">
          {categoryCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className={`group relative block aspect-[3/4] overflow-hidden rounded-3xl shadow-xl shadow-rose-200/50 transition-all hover:-translate-y-2 ${
                card.featured ? "border-2 border-[var(--accent)] bg-white" : ""
              }`}
            >
              <Image src={card.image} alt={card.label} fill className="img-zoom object-cover" sizes="(min-width: 1024px) 14vw, 45vw" />
              <div
                className={`absolute inset-0 ${
                  card.featured
                    ? "bg-gradient-to-t from-[color:var(--accent)]/85 via-[color:var(--accent)]/25 to-transparent"
                    : "bg-gradient-to-t from-rose-900/80 via-rose-900/20 to-transparent"
                }`}
              />
              <span className="absolute bottom-8 left-0 w-full px-2 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                {card.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--rose-nude)] px-8 py-20 lg:py-24">
        <div className="divider-rose absolute left-0 top-0" />
        <div className="divider-rose absolute bottom-0 left-0" />
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display mb-8 text-5xl text-rose-900 md:text-6xl">Offre exclusive mensuelle</h2>
          <p className="mb-12 text-lg leading-relaxed text-gray-700">
            Ce mois-ci, profitez d&apos;une selection <span className="font-bold italic text-[var(--accent)]">plaisir & lingerie</span> avec une attention speciale sur les pieces iconiques du moment.
          </p>
          <Link
            href="/catalogue"
            className="inline-block bg-[linear-gradient(135deg,var(--accent-soft)_0%,var(--accent)_100%)] px-14 py-6 text-[11px] font-bold uppercase tracking-[0.4em] text-white shadow-lg transition-all hover:shadow-xl"
          >
            En profiter maintenant
          </Link>
        </div>
      </section>

      <section className="px-8 py-24 lg:py-32">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-16 flex flex-col items-start justify-between gap-8 lg:mb-20 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h2 className="font-display mb-6 text-5xl text-rose-900">Selection du catalogue</h2>
              <p className="text-lg italic uppercase tracking-[0.22em] text-gray-500">Lingerie et plaisir arrivent en tete, avant les autres univers.</p>
            </div>
            <Link
              href="/catalogue"
              className="border-b-2 border-[var(--accent)] pb-2 text-xs font-bold uppercase tracking-[0.4em] text-[var(--accent)] transition-all hover:border-rose-600 hover:text-rose-600"
            >
              Voir tout le catalogue
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {bestSellers.map((product) => (
              <article key={product.id} className="group relative">
                <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-[2rem] bg-[var(--rose-powder)]">
                  <Image src={product.image} alt={product.name} fill className="img-zoom object-cover" sizes="(min-width: 1024px) 16vw, 45vw" />
                  <span className="absolute left-6 top-6 rounded-full bg-[var(--accent-strong)] px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-white">
                    {product.tags[0] ?? "Selection"}
                  </span>
                  <Link
                    href={`/produit/${product.slug}`}
                    className="absolute bottom-6 left-6 right-6 translate-y-20 bg-white/95 py-4 text-center text-[10px] font-bold uppercase tracking-[0.3em] opacity-0 backdrop-blur-sm transition-all duration-500 hover:bg-[var(--accent)] hover:text-white group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    Vite, je le veux
                  </Link>
                </div>

                <div className="px-2">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-rose-900">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] italic text-gray-500">{product.shortDescription}</span>
                    <span className="text-sm font-bold text-gray-900">{product.price.toFixed(2)} EUR</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 pb-20 lg:pb-24">
        <div className="mx-auto max-w-[1800px] space-y-12">
          <div className="text-center">
            <h2 className="font-display text-5xl text-rose-900">Inspirations par categorie</h2>
            <p className="mt-3 text-sm uppercase tracking-[0.22em] text-gray-500">Des selections dediees a chaque univers</p>
          </div>

          <div className="space-y-10">
            {editorialProductSections.map((section) => (
              <section key={section.slug} className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">{getCategoryLabel(section.slug)}</p>
                    <h3 className="font-display text-4xl text-[var(--ink)]">{section.title}</h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">{section.description}</p>
                  </div>
                  <Link
                    href={`/catalogue?categorie=${section.slug}`}
                    className="border-b-2 border-[var(--accent)] pb-2 text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)] transition hover:border-rose-600 hover:text-rose-600"
                  >
                    Voir {getCategoryLabel(section.slug)}
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-8">
                  {section.products.map((product) => (
                    <Link key={`${section.slug}-${product.id}`} href={`/produit/${product.slug}`} className="group block">
                      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-105"
                          sizes="(min-width: 1024px) 11vw, 30vw"
                        />
                      </div>
                      <p className="line-clamp-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink)]">{product.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{product.price.toFixed(2)} EUR</p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--rose-powder)] px-8 py-24 text-center lg:py-36">
        <div className="divider-rose absolute left-0 top-0" />
        <div className="divider-rose absolute bottom-0 left-0" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <h2 className="font-display mb-10 text-5xl leading-tight text-rose-900 md:text-7xl">
            Revelez votre
            <br />
            <span className="italic text-[var(--accent)]">essentiel</span>
          </h2>
          <p className="mx-auto mb-14 max-w-3xl text-xl italic text-gray-600">
            Parce que chaque femme merite de se sentir puissante et belle dans son intimite. Nos collections allient style, confiance et douceur.
          </p>
          <Link
            href="#"
            className="border-2 border-rose-400 px-12 py-6 text-[11px] font-bold uppercase tracking-[0.4em] text-rose-900 transition-all hover:bg-rose-400 hover:text-white"
          >
            Decouvrir notre histoire
          </Link>
        </div>
      </section>

      <section className="relative px-8 py-24 lg:py-32">
        <div className="mx-auto max-w-5xl rounded-[3rem] border border-rose-100 bg-white p-12 text-center shadow-2xl shadow-rose-200/50 md:p-20">
          <h2 className="font-display mb-8 text-5xl text-rose-900">Rejoignez le cercle prive</h2>
          <p className="mb-12 text-lg text-gray-500">
            Inscrivez-vous pour recevoir nos <span className="font-bold text-[var(--accent)]">Secrets de Beaute</span> et profitez de <span className="font-bold underline">-10%</span> sur votre commande.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
