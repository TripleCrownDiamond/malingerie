import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { categories } from "@/features/catalog/data/categories";
import { products } from "@/features/catalog/data/products";

const guideCards = [
  {
    id: "guide-1",
    eyebrow: "Debuter",
    title: "Choisir selon ton niveau",
    description:
      "Commence par des formats simples, des matieres douces et des dimensions progressives. Le but est d'installer la confiance avant l'intensite.",
    href: "/catalogue?categorie=sextoys",
    cta: "Voir la selection debutant",
  },
  {
    id: "guide-2",
    eyebrow: "Confort",
    title: "Lubrification et douceur",
    description:
      "Adapte la texture et le type de lubrifiant a la pratique. Une bonne lubrification ameliore nettement le confort et la qualite des sensations.",
    href: "/catalogue?souscategorie=lubrifiant-et-gel-lubrifiant",
    cta: "Explorer les lubrifiants",
  },
  {
    id: "guide-3",
    eyebrow: "Couple",
    title: "Construire une complicite",
    description:
      "Parlez de vos envies avant, pendant et apres. Le consentement, les limites et le feedback rendent chaque experience plus sereine et plus plaisante.",
    href: "/catalogue?categorie=jeux-et-librairie",
    cta: "Decouvrir les jeux",
  },
  {
    id: "guide-4",
    eyebrow: "Entretien",
    title: "Hygiene et durabilite",
    description:
      "Nettoie avant et apres usage, stocke au sec et utilise des produits adaptes a la matiere. Un bon entretien preserve l'hygiene et la longivite.",
    href: "/catalogue?categorie=bien-etre",
    cta: "Voir les essentiels bien-etre",
  },
];

const faqItems = [
  {
    q: "Comment bien choisir une premiere piece ?",
    a: "Priorise les references les plus simples, evite les tailles extremes et regarde les caracteristiques (matiere, dimensions, mode d'utilisation).",
  },
  {
    q: "Comment savoir si un produit est adapte a moi ?",
    a: "Observe les dimensions, le type de stimulation recherche, la flexibilite, l'etancheite et les avis. Commencer progressif reste la meilleure approche.",
  },
  {
    q: "Quels points de securite ne pas oublier ?",
    a: "Consentement clair, communication, lubrification adaptee, hygiene avant/apres, et respect de ses limites physiques et emotionnelles.",
  },
  {
    q: "Comment creer une routine bien-etre intime ?",
    a: "Combine respiration, relaxation, produits de confort, et temps de qualite. L'important est la regularite et un cadre qui te met a l'aise.",
  },
];

const focusCategorySlugs = ["lingerie", "sextoys", "bdsm", "bien-etre", "aphrodisiaques", "jeux-et-librairie"];

const focusCollections = focusCategorySlugs
  .map((slug) => {
    const category = categories.find((item) => item.slug === slug);
    const categoryProducts = products.filter((product) => product.categorySlug === slug).slice(0, 4);

    if (!category || categoryProducts.length === 0) {
      return null;
    }

    return {
      slug,
      name: category.name,
      description: category.description,
      image: categoryProducts[0].image,
      products: categoryProducts,
    };
  })
  .filter((item): item is NonNullable<typeof item> => Boolean(item));

export default function ConseilsPage() {
  return (
    <Container>
      <section className="space-y-10 py-12 sm:py-16">
        <header className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/80">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5 p-7 sm:p-10 lg:p-12">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Conseils</p>
              <h1 className="font-display text-4xl leading-tight text-[var(--ink)] sm:text-5xl">Guides & conseils adaptes a Ma Petite Lingerie</h1>
              <p className="max-w-2xl text-sm text-[var(--muted)] sm:text-base">
                Cette page reprend l&apos;esprit d&apos;un centre de conseils: orientation, pedagogie et recommandations pratiques, adaptees a ton univers produit.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/catalogue"
                  className="rounded-full bg-[var(--ink)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--paper)]"
                >
                  Explorer le catalogue
                </Link>
                <Link
                  href="/marques"
                  className="rounded-full border border-[var(--line)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Voir les marques
                </Link>
              </div>
            </div>

            <div className="relative min-h-[280px] lg:min-h-full">
              <Image
                src={focusCollections[0]?.image ?? "/hero-slide-01-lingerie-custom.webp"}
                alt="Conseils Ma Petite Lingerie"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-[10px] uppercase tracking-[0.24em] opacity-90">Selection & accompagnement</p>
                <p className="mt-2 font-display text-2xl">Des repaires concrets pour mieux choisir</p>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-5">
          <h2 className="font-display text-3xl text-[var(--ink)]">Guides pratiques</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {guideCards.map((guide) => (
              <article key={guide.id} className="rounded-3xl border border-[var(--line)] bg-white/85 p-6">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">{guide.eyebrow}</p>
                <h3 className="font-display mt-3 text-2xl text-[var(--ink)]">{guide.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{guide.description}</p>
                <Link
                  href={guide.href}
                  className="mt-5 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)] hover:text-rose-600"
                >
                  {guide.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="font-display text-3xl text-[var(--ink)]">Conseils par univers</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {focusCollections.map((collection) => (
              <article key={collection.slug} className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/90">
                <div className="grid gap-0 sm:grid-cols-[0.9fr_1.1fr]">
                  <div className="relative min-h-[220px]">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 30vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  <div className="space-y-4 p-6">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">Univers</p>
                    <h3 className="font-display text-3xl text-[var(--ink)]">{collection.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{collection.description}</p>

                    <ul className="space-y-2 text-sm text-[var(--muted)]">
                      {collection.products.map((product) => (
                        <li key={product.id}>
                          <Link href={`/produit/${product.slug}`} className="hover:text-[var(--accent)]">
                            {product.name}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/catalogue?categorie=${collection.slug}`}
                      className="inline-block border-b-2 border-[var(--accent)] pb-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)] hover:border-rose-600 hover:text-rose-600"
                    >
                      Explorer {collection.name}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-[var(--line)] bg-white/90 p-7 sm:p-10">
          <h2 className="font-display text-3xl text-[var(--ink)]">Questions frequentes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.q} className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ink)]">{item.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{item.a}</p>
              </article>
            ))}
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Information generale uniquement. En cas de doute sante, consulte un professionnel qualifie.
          </p>
        </section>
      </section>
    </Container>
  );
}

