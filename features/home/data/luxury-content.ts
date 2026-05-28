import {
  sourceFeaturedCategories,
  sourceMenuLinks,
  sourceStoryHighlights,
} from "@/features/source/data/source-data";
import type { Product } from "@/types/shop";

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
];

const featuredLabelBySlug: Record<string, string> = {
  lingerie: "Lingerie",
  sextoys: "Plaisir",
  "bien-etre": "Bien-etre",
  bdsm: "BDSM",
  aphrodisiaques: "Aphrodisiaques",
  "jeux-et-librairie": "Jeux et librairie",
};

const fallbackFeaturedImageBySlug = new Map(sourceFeaturedCategories.map((item) => [item.slug, item.image] as const));

function getCategoryRepresentativeImage(slug: string, products: Product[]) {
  const categoryProduct = products.find((product) => product.categorySlug === slug && Boolean(product.image));

  if (slug === "promotions") {
    const promoProduct = products.find((product) => {
      const compareAtPrice = product.compareAtPrice ?? 0;
      return compareAtPrice > product.price && Boolean(product.image);
    });

    if (promoProduct?.image) {
      return promoProduct.image;
    }
  }

  return (
    categoryProduct?.image ??
    fallbackFeaturedImageBySlug.get(slug) ??
    products.find((product) => product.categorySlug === "lingerie" && Boolean(product.image))?.image ??
    "/hero-slide-01-lingerie-custom.webp"
  );
}

export function buildCategoryCards(products: Product[]) {
  const featuredBySlug = new Map(sourceFeaturedCategories.map((item) => [item.slug, item] as const));

  return featuredOrder.map((slug, index) => {
    const sourceItem = featuredBySlug.get(slug);

    return {
      id: sourceItem?.id ?? `home-featured-${slug}`,
      label: sourceItem?.label ?? featuredLabelBySlug[slug] ?? slug,
      href: sourceItem?.href ?? `/catalogue?categorie=${slug}`,
      image: getCategoryRepresentativeImage(slug, products),
      featured: index < 2,
    };
  });
}

export function buildSourcePromoBanners(products: Product[]): HomePromoBanner[] {
  return [
    {
      label: "Lingerie premium importee de nos sources",
      ctaLabel: "Explorer",
      href: "/catalogue?categorie=lingerie",
      sourceUrl: "https://www.maisonlejaby.com/fr-bj/collections/lingerie",
      image: getCategoryRepresentativeImage("lingerie", products),
    },
    {
      label: "Plaisir premium importee de nos sources",
      ctaLabel: "Explorer",
      href: "/catalogue?categorie=sextoys",
      sourceUrl: "https://www.espaceplaisir.fr/939-sextoys",
      image: getCategoryRepresentativeImage("sextoys", products),
    },
    {
      label: "Bien-etre premium importee de nos sources",
      ctaLabel: "Explorer",
      href: "/catalogue?categorie=bien-etre",
      sourceUrl: "https://www.espaceplaisir.fr/991-bien-etre",
      image: getCategoryRepresentativeImage("bien-etre", products),
    },
  ];
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

export const sourceNavigationLinks = sourceMenuLinks;
export const sourceStoryCards = sourceStoryHighlights;
