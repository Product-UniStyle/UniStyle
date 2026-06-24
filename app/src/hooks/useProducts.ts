import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { adaptProduct } from '@/lib/productAdapter';
import type { Product } from '@/data/products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getProducts({ limit: 100 })
      .then(({ products: backendProducts }) => {
        if (active) setProducts(backendProducts.map(adaptProduct));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { products, loading };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    api.getProductBySlug(slug)
      .then(({ product: backendProduct }) => {
        if (active) setProduct(adaptProduct(backendProduct));
      })
      .catch(() => { if (active) setProduct(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return { product, loading };
}

export function useRelatedProducts(productId: string | undefined, count = 4) {
  const { products } = useProducts();
  return productId ? products.filter(p => p.id !== productId).slice(0, count) : [];
}
