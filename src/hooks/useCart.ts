import { useState, useEffect } from "react";
import type { CartItem, Product } from "@/types";

const CART_KEY = "bebeuja_cart";

// ================================
// Hook do carrinho de compras
// Persiste no localStorage
// ================================
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const save = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem(CART_KEY, JSON.stringify(newItems));
  };

  const addItem = (product: Product) => {
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      save(items.map((i) =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      // Se já tem item de outra loja, limpa o carrinho
      const hasDifferentStore = items.length > 0 && items[0].product.storeId !== product.storeId;
      const baseItems = hasDifferentStore ? [] : items;
      save([...baseItems, { product, quantity: 1 }]);
    }
    setIsOpen(true);
  };

  const removeItem = (productId: string) => {
    save(items.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return; }
    save(items.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => {
    save([]);
    setIsOpen(false);
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const storeId = items[0]?.product.storeId ?? null;

  return {
    items, total, itemCount, storeId,
    isOpen, setIsOpen,
    addItem, removeItem, updateQuantity, clearCart,
  };
}
