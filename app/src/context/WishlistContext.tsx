import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/data/products';
import { api, type BackendWishlistItem } from '@/lib/api';
import { adaptProduct } from '@/lib/productAdapter';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ToastContainer';

export interface WishlistEntry {
  product: Product;
  // null means "the product in general" — no specific color variant was wishlisted.
  color: string | null;
}

interface WishlistContextType {
  items: WishlistEntry[];
  addToWishlist: (product: Product, color?: string | null) => void;
  // Omitting color removes every color variant of the product (e.g. Clear Wishlist).
  removeFromWishlist: (productId: string, color?: string | null) => void;
  // Omitting color matches an entry with any color for that product — lets
  // pages without color context (cart, account) still show a filled heart
  // if any variant of the product is wishlisted.
  isInWishlist: (productId: string, color?: string | null) => boolean;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function fromBackend(item: BackendWishlistItem): WishlistEntry {
  return { product: adaptProduct(item.productId), color: item.color ?? null };
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistEntry[]>([]);

  const refreshServerWishlist = useCallback(async () => {
    const { items: backendItems } = await api.getWishlist();
    setItems(backendItems.map(fromBackend));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    refreshServerWishlist();
  }, [isAuthenticated, refreshServerWishlist]);

  const addToWishlist = useCallback((product: Product, color: string | null = null) => {
    if (!isAuthenticated) {
      navigate('/account');
      return;
    }
    api.addToWishlist(product.id, color ?? undefined).then(async () => {
      await refreshServerWishlist();
      showToast('Added to wishlist');
    });
  }, [isAuthenticated, navigate, refreshServerWishlist]);

  const removeFromWishlist = useCallback((productId: string, color?: string | null) => {
    if (!isAuthenticated) return;
    const colorParam = color === undefined ? undefined : (color ?? '');
    api.removeFromWishlist(productId, colorParam).then(async () => {
      await refreshServerWishlist();
      showToast('Removed from wishlist');
    });
  }, [isAuthenticated, refreshServerWishlist]);

  const isInWishlist = useCallback(
    (productId: string, color?: string | null) =>
      items.some(e => e.product.id === productId && (color === undefined || e.color === (color ?? null))),
    [items]
  );

  const clearWishlist = useCallback(() => {
    if (!isAuthenticated) return;
    Promise.all(items.map(e => api.removeFromWishlist(e.product.id, e.color ?? ''))).then(refreshServerWishlist);
  }, [isAuthenticated, items, refreshServerWishlist]);

  const totalItems = useMemo(() => items.length, [items]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, totalItems }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
