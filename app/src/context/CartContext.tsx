import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Product } from '@/data/products';

export interface CartItem {
  id: string;
  product: Product;
  color?: string;
  size?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, color?: string, size?: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pomar-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToCart = useCallback((product: Product, color?: string, size?: string, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(
        item => item.product.id === product.id && item.color === color && item.size === size
      );
      let newItems: CartItem[];
      if (existing) {
        newItems = prev.map(item =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prev, { id: `${product.id}-${Date.now()}`, product, color, size, quantity }];
      }
      localStorage.setItem('pomar-cart', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== itemId);
      localStorage.setItem('pomar-cart', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prev => {
      const newItems = prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      localStorage.setItem('pomar-cart', JSON.stringify(newItems));
      return newItems;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('pomar-cart');
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
