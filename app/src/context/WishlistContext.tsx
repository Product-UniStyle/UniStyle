import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/data/products';
import { api, type BackendWishlistItem } from '@/lib/api';
import { adaptProduct } from '@/lib/productAdapter';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ToastContainer';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function fromBackend(item: BackendWishlistItem): Product {
  return adaptProduct(item.productId);
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Product[]>([]);

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

  const addToWishlist = useCallback((product: Product) => {
    if (!isAuthenticated) {
      navigate('/account');
      return;
    }
    api.addToWishlist(product.id).then(async () => {
      await refreshServerWishlist();
      showToast('Added to wishlist');
    });
  }, [isAuthenticated, navigate, refreshServerWishlist]);

  const removeFromWishlist = useCallback((productId: string) => {
    if (!isAuthenticated) return;
    api.removeFromWishlist(productId).then(async () => {
      await refreshServerWishlist();
      showToast('Removed from wishlist');
    });
  }, [isAuthenticated, refreshServerWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => items.some(p => p.id === productId),
    [items]
  );

  const clearWishlist = useCallback(() => {
    if (!isAuthenticated) return;
    Promise.all(items.map(p => api.removeFromWishlist(p.id))).then(refreshServerWishlist);
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
