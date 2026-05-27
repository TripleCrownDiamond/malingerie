import sourceCategoriesJson from "@/features/source/data/source-categories.json";
import sourceProductsJson from "@/features/source/data/source-products.json";
import sourceUiJson from "@/features/source/data/source-ui.json";
import type { Product, ProductCategory } from "@/types/shop";

export type SourceMenuLink = {
  label: string;
  slug: string;
  href: string;
  sourceUrl: string;
};

export type SourceFeaturedCategory = {
  id: string;
  label: string;
  slug: string;
  href: string;
  sourceUrl: string;
  image: string;
  featured: boolean;
};

export type SourcePromoBanner = {
  label: string;
  ctaLabel: string;
  href: string;
  sourceUrl: string;
  image: string;
};

export type SourceStoryHighlight = {
  title: string;
  description: string;
};

type SourceUiData = {
  sourceHost: string;
  generatedAt: string;
  menuLinks: SourceMenuLink[];
  featuredCategories: SourceFeaturedCategory[];
  promoBanners: SourcePromoBanner[];
  storyHighlights: SourceStoryHighlight[];
  footerShopLinks: SourceMenuLink[];
};

export const sourceUi = sourceUiJson as SourceUiData;
export const sourceMenuLinks = sourceUi.menuLinks;
export const sourceFeaturedCategories = sourceUi.featuredCategories;
export const sourcePromoBanners = sourceUi.promoBanners;
export const sourceStoryHighlights = sourceUi.storyHighlights;
export const sourceFooterShopLinks = sourceUi.footerShopLinks;

export const sourceCategories = sourceCategoriesJson as ProductCategory[];
export const sourceProducts = sourceProductsJson as Product[];
