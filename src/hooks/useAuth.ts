import { useState, useEffect } from "react";
import type { Customer, Store, Driver } from "@/types";

// ================================
// Hook de autenticação mockada
// Armazena sessão no localStorage
// ================================
export type AuthUser = Customer | Store | Driver;

const STORAGE_KEY = "bebeuja_user";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated as AuthUser);
  };

  return { user, loading, login, logout, updateUser };
}

// Usuários demo pré-cadastrados
export const DEMO_ACCOUNTS = {
  customer: {
    id: "cust-demo",
    name: "João Cliente",
    email: "cliente@demo.com",
    role: "customer" as const,
    phone: "(11) 99999-1111",
    address: "Rua das Flores, 123",
    neighborhood: "Vila Mariana",
  },
  store: {
    id: "store-1",
    name: "Carlos Silva",
    email: "adega@demo.com",
    role: "store" as const,
    storeName: "Adega Ouro Negro",
    description: "A melhor adega da cidade",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
    coverImage: "",
    rating: 4.8,
    reviewCount: 342,
    deliveryTime: "25–40 min",
    deliveryFee: 5.90,
    minimumOrder: 30,
    neighborhood: "Vila Mariana",
    city: "São Paulo",
    isOpen: true,
    openingHours: "10:00",
    closingHours: "02:00",
    categories: ["cerveja", "whisky", "energetico"],
    featured: true,
  },
  driver: {
    id: "driver-demo",
    name: "Pedro Entregador",
    email: "motoboy@demo.com",
    role: "driver" as const,
    phone: "(11) 99999-3333",
    isOnline: false,
    vehicle: "Moto Honda CG 160",
    rating: 4.9,
    completedDeliveries: 247,
  },
};
