import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Bike, ShoppingCart, Info } from "lucide-react";
import ProductCard from "@/components/features/ProductCard";
import { MOCK_STORES, MOCK_PRODUCTS, CATEGORIES } from "@/constants/mockData";
import type { CartItem, Product } from "@/types";

interface StorePageProps {
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (id: string) => void;
  onOpenCart: () => void;
}

export default function StorePage({ cartItems, onAddToCart, onRemoveFromCart, onOpenCart }: StorePageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const store = MOCK_STORES.find((s) => s.id === id);
  const allProducts = MOCK_PRODUCTS.filter((p) => p.storeId === id);

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-6xl">🍾</p>
        <p className="font-semibold text-tx-secondary">Adega não encontrada</p>
        <button onClick={() => navigate("/")} className="btn-primary">Voltar</button>
      </div>
    );
  }

  const storeCategories = Array.from(new Set(allProducts.map((p) => p.category)));
  const filtered = activeCategory
    ? allProducts.filter((p) => p.category === activeCategory)
    : allProducts;
  const featured = allProducts.filter((p) => p.featured);

  const getQty = (productId: string) =>
    cartItems.find((i) => i.product.id === productId)?.quantity ?? 0;

  const cartTotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <main className="min-h-screen">
      {/* Cover */}
      <div className="relative h-52 md:h-72 overflow-hidden">
        <img src={store.coverImage} alt={store.storeName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/40 to-surface/90" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 glass-card hover:border-brand-green/40 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Store info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex items-end gap-4">
            <img src={store.logo} alt="" className="w-16 h-16 rounded-2xl border-2 border-surface-border shrink-0 shadow-lg" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display font-bold text-xl md:text-2xl text-tx-primary">{store.storeName}</h1>
                <span className={`tag text-xs border font-semibold ${store.isOpen ? "text-brand-green border-brand-green/40 bg-brand-green/20" : "text-brand-red border-brand-red/40 bg-brand-red/20"}`}>
                  {store.isOpen ? "Aberto" : "Fechado"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-tx-secondary">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
                  <strong className="text-tx-primary">{store.rating}</strong>
                  <span className="text-tx-muted">({store.reviewCount})</span>
                </span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-brand-green" />{store.deliveryTime}</span>
                <span className="flex items-center gap-1">
                  <Bike className="w-4 h-4 text-tx-muted" />
                  {store.deliveryFee === 0 ? <span className="text-brand-green">Grátis</span> : `R$ ${store.deliveryFee.toFixed(2).replace(".", ",")}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-32">
        {/* Store info bar */}
        <div className="flex items-center gap-2 py-3 text-xs text-tx-muted border-b border-surface-border">
          <Info className="w-3.5 h-3.5" />
          <span>Pedido mínimo: <strong className="text-tx-primary">R$ {store.minimumOrder.toFixed(2).replace(".", ",")}</strong></span>
          <span>·</span>
          <span>Horário: <strong className="text-tx-primary">{store.openingHours} – {store.closingHours}</strong></span>
        </div>

        {/* Description */}
        <p className="text-sm text-tx-secondary py-3 border-b border-surface-border">{store.description}</p>

        {/* Featured */}
        {featured.length > 0 && !activeCategory && (
          <section className="py-4 border-b border-surface-border">
            <h2 className="font-display font-semibold text-base mb-3">⭐ Destaques</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  quantity={getQty(p.id)}
                  onAdd={onAddToCart}
                  onRemove={onRemoveFromCart}
                />
              ))}
            </div>
          </section>
        )}

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto py-4 border-b border-surface-border">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all
              ${!activeCategory ? "bg-brand-green text-surface border-brand-green" : "bg-surface-elevated text-tx-secondary border-surface-border hover:border-brand-green/40"}`}
          >
            Todos
          </button>
          {storeCategories.map((cat) => {
            const meta = CATEGORIES.find((c) => c.id === cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all
                  ${activeCategory === cat ? "bg-brand-green text-surface border-brand-green" : "bg-surface-elevated text-tx-secondary border-surface-border hover:border-brand-green/40"}`}
              >
                {meta?.emoji} {meta?.label ?? cat}
              </button>
            );
          })}
        </div>

        {/* Product grid */}
        <section className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                quantity={getQty(p.id)}
                onAdd={onAddToCart}
                onRemove={onRemoveFromCart}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-30">
          <button
            onClick={onOpenCart}
            className="btn-primary flex items-center gap-3 shadow-2xl shadow-brand-green/30 animate-pulse-green px-6 py-3"
          >
            <div className="w-6 h-6 bg-surface/20 rounded-full flex items-center justify-center text-xs font-bold">
              {cartCount}
            </div>
            <span>Ver Carrinho</span>
            <span className="font-bold">R$ {cartTotal.toFixed(2).replace(".", ",")}</span>
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      )}
    </main>
  );
}
