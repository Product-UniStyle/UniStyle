import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { adaptProduct } from '@/lib/productAdapter';
import type { Product } from '@/data/products';

// Every page (Shop, Home, Cart, Wishlist, ProductPage) independently calls
// useProducts() and expects the full catalog. Without a shared cache, each
// mount re-paginates the entire backend from scratch — on a page with several
// such components mounted together that's the same ~700-product catalog
// fetched multiple times in parallel, all competing for the same backend.
// Caching by fetch key (all vs. featured) means only the first caller ever
// pays the network cost; everyone after it reads the resolved list straight
// away, and concurrent callers share the one in-flight request.
const catalogCache = new Map<string, Product[]>();
const catalogInFlight = new Map<string, Promise<Product[]>>();

function cacheKey(params: { featured?: boolean }) {
  return params.featured ? 'featured' : 'all';
}

async function fetchCatalog(params: { featured?: boolean }): Promise<Product[]> {
  const key = cacheKey(params);
  const cached = catalogCache.get(key);
  if (cached) return cached;

  const pending = catalogInFlight.get(key);
  if (pending) return pending;

  const promise = (async () => {
    const limit = 100;
    // Fetch page 1 first to learn the total count, then fetch the remaining
    // pages concurrently instead of one-at-a-time — a 7-page catalog behind a
    // slow backend was taking 10s+ purely from awaiting each page in series.
    const first = await api.getProducts({ page: 1, limit, ...params });
    const totalPages = Math.max(1, Math.ceil(first.total / limit));
    const restPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => api.getProducts({ page: i + 2, limit, ...params }))
    );
    const backendProducts = [first, ...restPages].flatMap(res => res.products);
    const products = backendProducts.map(adaptProduct);
    catalogCache.set(key, products);
    return products;
  })();

  catalogInFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    catalogInFlight.delete(key);
  }
}

export function useProducts(params: { featured?: boolean } = {}) {
  const { featured } = params;
  const key = cacheKey({ featured });
  const [products, setProducts] = useState<Product[]>(() => catalogCache.get(key) ?? []);
  const [loading, setLoading] = useState(() => !catalogCache.has(key));

  useEffect(() => {
    let active = true;
    if (catalogCache.has(key)) {
      setProducts(catalogCache.get(key)!);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchCatalog({ featured })
      .then((result) => { if (active) setProducts(result); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

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
