export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  subcategorySlug?: string;
  subcategoryLabel?: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  sku: string;
  image: string;
  gallery: string[];
  specifications?: Array<{ label: string; value: string }>;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  size: string;
  color: string;
};

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  categorySlug: string;
  defaultSize: string;
  defaultColor: string;
};