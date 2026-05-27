import {
  sourceFeaturedCategories,
  sourceMenuLinks,
  sourceProducts,
  sourceStoryHighlights,
} from "@/features/source/data/source-data";

export type HeroSlide = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  highlight?: string;
  ctaLabel: string;
  ctaHref: string;
  theme: "light" | "dark";
};

export type HomePromoBanner = {
  label: string;
  ctaLabel: string;
  href: string;
  sourceUrl: string;
  image: string;
};

const featuredOrder = [
  "lingerie",
  "sextoys",
  "bien-etre",
  "bdsm",
  "aphrodisiaques",
  "jeux-et-librairie",
  "promotions",
];

const featuredLabelBySlug: Record<string, string> = {
  lingerie: "Lingerie",
  sextoys: "Plaisir",
  "bien-etre": "Bien-etre",
  bdsm: "BDSM",
  aphrodisiaques: "Aphrodisiaques",
  "jeux-et-librairie": "Jeux et librairie",
  promotions: "Promotions",
};

const categoryImageBySlug = new Map<string, string>();
for (const product of sourceProducts) {
  if (!product.image || categoryImageBySlug.has(product.categorySlug)) {
    continue;
  }

  categoryImageBySlug.set(product.categorySlug, product.image);
}

const fallbackFeaturedImageBySlug = new Map(sourceFeaturedCategories.map((item) => [item.slug, item.image] as const));

function getCategoryRepresentativeImage(slug: string) {
  if (slug === "promotions") {
    const promoProduct = sourceProducts.find((product) => {
      const compareAtPrice = product.compareAtPrice ?? 0;
      return compareAtPrice > product.price;
    });
    if (promoProduct?.image) {
      return promoProduct.image;
    }
  }

  return (
    categoryImageBySlug.get(slug) ??
    fallbackFeaturedImageBySlug.get(slug) ??
    categoryImageBySlug.get("lingerie") ??
    "/hero-slide-01-lingerie-custom.webp"
  );
}

export const heroSlides: HeroSlide[] = [
  {
    id: "slide-lingerie",
    image: "/hero-slide-01-lingerie-custom.webp",
    eyebrow: "Collection lingerie",
    title: "Lingerie d'exception",
    highlight: "Elegance revelee",
    ctaLabel: "Explorer la lingerie",
    ctaHref: "/catalogue?categorie=lingerie",
    theme: "light",
  },
  {
    id: "slide-plaisir",
    image: "/hero-slide-02-plaisir.jpg",
    eyebrow: "Rituels plaisir",
    title: "Univers plaisir",
    highlight: "Douceur et sensations",
    ctaLabel: "Explorer le plaisir",
    ctaHref: "/catalogue?categorie=sextoys",
    theme: "dark",
  },
];

const featuredBySlug = new Map(sourceFeaturedCategories.map((item) => [item.slug, item] as const));

export const categoryCards = featuredOrder.map((slug, index) => {
  const sourceItem = featuredBySlug.get(slug);

  return {
    id: sourceItem?.id ?? `home-featured-${slug}`,
    label: sourceItem?.label ?? featuredLabelBySlug[slug] ?? slug,
    href: sourceItem?.href ?? `/catalogue?categorie=${slug}`,
    image: getCategoryRepresentativeImage(slug),
    featured: index < 2,
  };
});

export const sourcePromoBanners: HomePromoBanner[] = [
  {
    label: "Lingerie premium importee de nos sources",
    ctaLabel: "Explorer",
    href: "/catalogue?categorie=lingerie",
    sourceUrl: "https://www.maisonlejaby.com/fr-bj/collections/lingerie",
    image: getCategoryRepresentativeImage("lingerie"),
  },
  {
    label: "Plaisir premium importee de nos sources",
    ctaLabel: "Explorer",
    href: "/catalogue?categorie=sextoys",
    sourceUrl: "https://www.espaceplaisir.fr/939-sextoys",
    image: getCategoryRepresentativeImage("sextoys"),
  },
  {
    label: "Bien-etre premium importee de nos sources",
    ctaLabel: "Explorer",
    href: "/catalogue?categorie=bien-etre",
    sourceUrl: "https://www.espaceplaisir.fr/991-bien-etre",
    image: getCategoryRepresentativeImage("bien-etre"),
  },
];

export const sourceNavigationLinks = sourceMenuLinks;
export const sourceStoryCards = sourceStoryHighlights;
