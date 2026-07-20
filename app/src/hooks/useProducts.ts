import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { adaptProduct } from '@/lib/productAdapter';
import type { Product } from '@/data/products';

export function useProducts(params: { featured?: boolean } = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { featured } = params;

  useEffect(() => {
    let active = true;
    setLoading(true);

    // The API caps each page at 100, so page through until every product
    // is fetched (callers filter/search this list client-side and expect
    // the full catalog, not just the first page).
    async function loadAll() {
      let all: Awaited<ReturnType<typeof api.getProducts>>['products'] = [];
      let page = 1;
      let total = Infinity;
      while (all.length < total) {
        const res = await api.getProducts({ page, limit: 100, featured });
        all = all.concat(res.products);
        total = res.total;
        if (res.products.length === 0) break;
        page++;
      }
      return all;
    }

    loadAll()
      .then((backendProducts) => {
        if (active) setProducts(backendProducts.map(adaptProduct));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [featured]);

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
