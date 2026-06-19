import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  items: { productId: string; name: string; image: string; price: number; quantity: number }[];
  total: number;
  shippingAddress: Address;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  addresses: Address[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (addressId: string) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('pomar-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('pomar-orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const persistUser = useCallback((u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem('pomar-user', JSON.stringify(u));
    else localStorage.removeItem('pomar-user');
  }, []);

  const login = useCallback((email: string, _password: string) => {
    const saved = localStorage.getItem('pomar-registered-users');
    const users: Array<User & { password: string }> = saved ? JSON.parse(saved) : [];
    const found = users.find(u => u.email === email);
    if (found) {
      const { password: _p, ...userWithoutPassword } = found;
      persistUser(userWithoutPassword as User);
      return true;
    }
    // Demo login
    if (email) {
      const demoUser: User = {
        id: 'demo-1',
        firstName: 'Demo',
        lastName: 'User',
        email,
        addresses: [],
      };
      persistUser(demoUser);
      return true;
    }
    return false;
  }, [persistUser]);

  const register = useCallback((data: { firstName: string; lastName: string; email: string; password: string }) => {
    const saved = localStorage.getItem('pomar-registered-users');
    const users = saved ? JSON.parse(saved) : [];
    if (users.find((u: User) => u.email === data.email)) return false;

    const newUser = { ...data, id: `user-${Date.now()}`, addresses: [] };
    users.push(newUser);
    localStorage.setItem('pomar-registered-users', JSON.stringify(users));

    const { password: _p, ...userWithoutPassword } = newUser;
    persistUser(userWithoutPassword as User);
    return true;
  }, [persistUser]);

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem('pomar-user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addAddress = useCallback((address: Omit<Address, 'id'>) => {
    setUser(prev => {
      if (!prev) return prev;
      const newAddress = { ...address, id: `addr-${Date.now()}` };
      const updated = { ...prev, addresses: [...prev.addresses, newAddress] };
      localStorage.setItem('pomar-user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeAddress = useCallback((addressId: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, addresses: prev.addresses.filter(a => a.id !== addressId) };
      localStorage.setItem('pomar-user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => {
      const newOrders = [order, ...prev];
      localStorage.setItem('pomar-orders', JSON.stringify(newOrders));
      return newOrders;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        removeAddress,
        orders,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
