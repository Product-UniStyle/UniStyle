export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  description: string;
  images: string[];
  category: string;
  university?: string;
  colors?: ProductColor[];
  sizes?: string[];
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  countdownEnd?: string;
  gender?: ('men' | 'women')[];
}

// Product data is served by the backend — see src/hooks/useProducts.ts.
export const categories = ['Bags', 'Glases', 'Jewelry', 'Men', 'Shoes', 'Women'];

export const blogCategories = ['Athleisure', 'Fashion Lab', 'Minimalism', 'News', 'Street Style'];
