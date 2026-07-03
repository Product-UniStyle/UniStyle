import type { BackendProduct } from '@/lib/api';
import type { Product } from '@/data/products';

function fallbackImages(p: BackendProduct): string[] {
  if (p.images.length > 0) return p.images;
  const colorWithImages = p.colors?.find(c => c.images?.length);
  return colorWithImages?.images ?? [];
}

export function adaptProduct(p: BackendProduct): Product {
  return {
    id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.compareAt ? p.compareAt / 100 : p.price / 100,
    salePrice: p.compareAt ? p.price / 100 : undefined,
    description: p.description,
    images: fallbackImages(p),
    category: p.category,
    university: p.university,
    gender: p.gender,
    colors: p.colors,
    sizes: p.sizes.length ? p.sizes : undefined,
    inStock: p.stock > 0,
    rating: p.rating,
    reviewCount: p.reviewCount,
    badge: p.badge,
    countdownEnd: p.countdownEnd,
  };
}
