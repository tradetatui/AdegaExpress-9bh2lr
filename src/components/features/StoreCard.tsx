import { Star, Clock, Bike, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Store } from "@/types";

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      to={`/loja/${store.id}`}
      className="card group overflow-hidden hover:border-brand-green/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand-green/5 block"
    >
      {/* Cover */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={store.coverImage}
          alt={store.storeName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Status badge */}
        <div className={`absolute top-3 left-3 tag border font-semibold text-xs
          ${store.isOpen
            ? "bg-brand-green/20 text-brand-green border-brand-green/40"
            : "bg-brand-red/20 text-brand-red border-brand-red/40"
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${store.isOpen ? "bg-brand-green" : "bg-brand-red"}`} />
          {store.isOpen ? "Aberto" : "Fechado"}
        </div>

        {store.featured && (
          <div className="absolute top-3 right-3 tag bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/40 font-semibold text-xs">
            ⭐ Destaque
          </div>
        )}

        {/* Logo */}
        <div className="absolute bottom-3 left-3 w-12 h-12 rounded-xl overflow-hidden border-2 border-surface-border shadow-lg">
          <img src={store.logo} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-tx-primary group-hover:text-brand-green transition-colors line-clamp-1">
              {store.storeName}
            </h3>
            <p className="text-xs text-tx-muted mt-0.5 line-clamp-1">{store.neighborhood} · {store.city}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-tx-muted shrink-0 group-hover:text-brand-green transition-colors mt-0.5" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-tx-secondary">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-brand-yellow fill-brand-yellow" />
            <strong className="text-tx-primary">{store.rating}</strong>
            <span className="text-tx-muted">({store.reviewCount})</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-green" />
            {store.deliveryTime}
          </span>
          <span className="flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 text-tx-muted" />
            {store.deliveryFee === 0 ? (
              <span className="text-brand-green font-medium">Grátis</span>
            ) : (
              `R$ ${store.deliveryFee.toFixed(2).replace(".", ",")}`
            )}
          </span>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mt-3">
          {store.categories.slice(0, 3).map((cat) => (
            <span key={cat} className="tag bg-surface-elevated text-tx-muted border border-surface-border capitalize">
              {cat}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
