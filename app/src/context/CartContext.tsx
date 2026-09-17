import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Product } from '@/data/products';
import { api, type BackendCartItem } from '@/lib/api';
import { adaptProduct } from '@/lib/productAdapter';
import { useAuth } from '@/context/AuthContext';
import { safeLocalStorage } from '@/lib/safeStorage';

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
  updateSize: (itemId: string, size: string) => void;
  clearCart: () => void;
  removeItems: (itemIds: string[]) => void;
  totalItems: number;
  subtotal: number;
  selectedIds: Set<string>;
  isSelected: (itemId: string) => boolean;
  toggleSelected: (itemId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectedItems: CartItem[];
  selectedSubtotal: number;
  promoCode: string;
  promoApplied: boolean;
  discount: number;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'unistyle-guest-cart';

function readGuestCart(): CartItem[] {
  try {
    const saved = safeLocalStorage.getItem(GUEST_CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  safeLocalStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
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
  // Which cart lines are checked for checkout — newly added items default to
  // selected, and an item drops out of the set the moment it's removed from
  // the cart, so this never points at a stale/nonexistent item.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(readGuestCart().map(i => i.id)));

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
        safeLocalStorage.removeItem(GUEST_CART_KEY);
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
      api.updateCartItem(itemId, { quantity }).then(refreshServerCart);
      return;
    }
    setItems(prev => {
      const newItems = prev.map(item => item.id === itemId ? { ...item, quantity } : item);
      writeGuestCart(newItems);
      return newItems;
    });
  }, [isAuthenticated, refreshServerCart, removeFromCart]);

  const updateSize = useCallback((itemId: string, size: string) => {
    if (isAuthenticated) {
      api.updateCartItem(itemId, { size }).then(refreshServerCart);
      return;
    }
    setItems(prev => {
      const newItems = prev.map(item => item.id === itemId ? { ...item, size } : item);
      writeGuestCart(newItems);
      return newItems;
    });
  }, [isAuthenticated, refreshServerCart]);

  // Drops specific lines from the cart without touching the rest — used after a
  // partial checkout (only the checked-out items), where the backend has already
  // deleted those CartItem docs, so an authenticated user just needs a refetch.
  const removeItems = useCallback((itemIds: string[]) => {
    if (itemIds.length === 0) return;
    if (isAuthenticated) {
      refreshServerCart();
      return;
    }
    setItems(prev => {
      const newItems = prev.filter(item => !itemIds.includes(item.id));
      writeGuestCart(newItems);
      return newItems;
    });
  }, [isAuthenticated, refreshServerCart]);

  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      api.clearCart().then(refreshServerCart);
      return;
    }
    setItems([]);
    safeLocalStorage.removeItem(GUEST_CART_KEY);
  }, [isAuthenticated, refreshServerCart]);

  // Keeps selection in sync as items change: a freshly added item is selected
  // by default, and a removed item is dropped from the set instead of lingering.
  useEffect(() => {
    setSelectedIds(prev => {
      const itemIds = new Set(items.map(i => i.id));
      let changed = false;
      const next = new Set<string>();
      prev.forEach(id => {
        if (itemIds.has(id)) next.add(id); else changed = true;
      });
      items.forEach(item => {
        if (!prev.has(item.id)) { next.add(item.id); changed = true; }
      });
      return changed ? next : prev;
    });
  }, [items]);

  const isSelected = useCallback((itemId: string) => selectedIds.has(itemId), [selectedIds]);

  const toggleSelected = useCallback((itemId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => setSelectedIds(new Set(items.map(i => i.id))), [items]);
  const deselectAll = useCallback(() => setSelectedIds(new Set()), []);

  // Lives here (not on the cart or checkout page) so it applies once on the cart
  // page and survives navigating into checkout.
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const applyPromoCode = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    if (normalized === 'SAVE10') {
      setPromoCode(normalized);
      setPromoApplied(true);
      return true;
    }
    setPromoApplied(false);
    return false;
  }, []);

  const removePromoCode = useCallback(() => {
    setPromoCode('');
    setPromoApplied(false);
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity, 0),
    [items]
  );
  const selectedItems = useMemo(() => items.filter(item => selectedIds.has(item.id)), [items, selectedIds]);
  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity, 0),
    [selectedItems]
  );
  const discount = useMemo(() => promoApplied ? selectedSubtotal * 0.1 : 0, [promoApplied, selectedSubtotal]);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, updateSize, clearCart, removeItems, totalItems, subtotal,
      selectedIds, isSelected, toggleSelected, selectAll, deselectAll, selectedItems, selectedSubtotal,
      promoCode, promoApplied, discount, applyPromoCode, removePromoCode,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
