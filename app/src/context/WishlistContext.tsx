import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Product } from '@/data/products';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('pomar-wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToWishlist = useCallback((product: Product) => {
    setItems(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      const newItems = [...prev, product];
      localStorage.setItem('pomar-wishlist', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(p => p.id !== productId);
      localStorage.setItem('pomar-wishlist', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some(p => p.id === productId),
    [items]
  );

  const totalItems = useMemo(() => items.length, [items]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, totalItems }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
