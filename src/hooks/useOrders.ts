import { useState, useEffect } from "react";
import type { Order, OrderStatus, CartItem } from "@/types";
import { MOCK_ORDERS_INITIAL } from "@/constants/mockData";

const ORDERS_KEY = "bebeuja_orders";

// ============================
// Hook para gerenciar pedidos
// ============================
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(ORDERS_KEY);
    if (stored) {
      try { setOrders(JSON.parse(stored)); } catch { /* ignore */ }
    } else {
      setOrders(MOCK_ORDERS_INITIAL);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(MOCK_ORDERS_INITIAL));
    }
  }, []);

  const save = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
  };

  const createOrder = (data: {
    customerId: string;
    customerName: string;
    storeId: string;
    storeName: string;
    items: CartItem[];
    total: number;
    deliveryFee: number;
    address: string;
    neighborhood: string;
  }): Order => {
    const now = new Date();
    const order: Order = {
      id: `ord-${Date.now()}`,
      ...data,
      status: "aguardando",
      paymentMethod: "pix",
      paymentStatus: "pending",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      estimatedDelivery: new Date(now.getTime() + 40 * 60000).toISOString(),
    };
    const updated = [order, ...orders];
    save(updated);
    return order;
  };

  const updateStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? { ...o, status, updatedAt: new Date().toISOString() }
        : o
    );
    save(updated);
  };

  const getByCustomer = (customerId: string) =>
    orders.filter((o) => o.customerId === customerId);

  const getByStore = (storeId: string) =>
    orders.filter((o) => o.storeId === storeId);

  const getById = (id: string) =>
    orders.find((o) => o.id === id);

  const getPendingForDriver = () =>
    orders.filter((o) => o.status === "aceito" || o.status === "preparando");

  const assignDriver = (orderId: string, driverId: string, driverName: string) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? { ...o, driverId, driverName, status: "coletado" as OrderStatus, updatedAt: new Date().toISOString() }
        : o
    );
    save(updated);
  };

  return { orders, createOrder, updateStatus, getByCustomer, getByStore, getById, getPendingForDriver, assignDriver };
}
