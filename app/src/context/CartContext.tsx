import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Product } from '@/data/products';
import { api, type BackendCartItem } from '@/lib/api';
import { adaptProduct } from '@/lib/productAdapter';
import { useAuth } from '@/context/AuthContext';

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

const GUEST_CART_KEY = 'unistyle-guest-cart';

function readGuestCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(GUEST_CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function fromBackend(item: BackendCartItem): CartItem {
  return {
    id: item._id,
    product: adaptProduct(item.productId),
    color: item.color,
    size: item.size,
    quantity: item.quantity,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => readGuestCart());
  const hasMerged = useRef(false);

  const refreshServerCart = useCallback(async () => {
    const { items: backendItems } = await api.getCart();
    setItems(backendItems.map(fromBackend));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      hasMerged.current = false;
      setItems(readGuestCart());
      return;
    }
    if (hasMerged.current) return;
    hasMerged.current = true;

    const guestItems = readGuestCart();
    (async () => {
      for (const item of guestItems) {
        await api.addToCart({ productId: item.product.id, quantity: item.quantity, size: item.size, color: item.color }).catch(() => {});
      }
      if (guestItems.length) {
        localStorage.removeItem(GUEST_CART_KEY);
      }
      await refreshServerCart();
    })();
  }, [isAuthenticated, refreshServerCart]);

  const addToCart = useCallback((product: Product, color?: string, size?: string, quantity = 1) => {
    if (isAuthenticated) {
      api.addToCart({ productId: product.id, quantity, size, color }).then(refreshServerCart);
      return;
    }
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.color === color && item.size === size);
      let newItems: CartItem[];
      if (existing) {
        newItems = prev.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item);
      } else {
        newItems = [...prev, { id: `${product.id}-${Date.now()}`, product, color, size, quantity }];
      }
      writeGuestCart(newItems);
      return newItems;
    });
  }, [isAuthenticated, refreshServerCart]);

  const removeFromCart = useCallback((itemId: string) => {
    if (isAuthenticated) {
      api.removeCartItem(itemId).then(refreshServerCart);
      return;
    }
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== itemId);
      writeGuestCart(newItems);
      return newItems;
    });
  }, [isAuthenticated, refreshServerCart]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    if (isAuthenticated) {
      api.updateCartItem(itemId, quantity).then(refreshServerCart);
      return;
    }
    setItems(prev => {
      const newItems = prev.map(item => item.id === itemId ? { ...item, quantity } : item);
      writeGuestCart(newItems);
      return newItems;
    });
  }, [isAuthenticated, refreshServerCart, removeFromCart]);

  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      api.clearCart().then(refreshServerCart);
      return;
    }
    setItems([]);
    localStorage.removeItem(GUEST_CART_KEY);
  }, [isAuthenticated, refreshServerCart]);

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
