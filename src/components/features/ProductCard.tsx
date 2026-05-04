import { Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  quantity?: number;
  onAdd: (product: Product) => void;
  onRemove?: (productId: string) => void;
}

export default function ProductCard({ product, quantity = 0, onAdd, onRemove }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="card flex gap-3 p-3 hover:border-surface-border/60 transition-all duration-200 group">
      {/* Image */}
      <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-surface-elevated">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discount > 0 && (
          <div className="absolute top-1 left-1 tag bg-brand-red text-white text-[10px] py-0.5 px-1.5 font-bold">
            -{discount}%
          </div>
        )}
        {product.featured && (
          <div className="absolute top-1 right-1 text-sm">⭐</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h4 className="font-medium text-sm text-tx-primary line-clamp-1">{product.name}</h4>
          <p className="text-xs text-tx-muted line-clamp-2 mt-0.5 leading-relaxed">{product.description}</p>
          {(product.volume || product.alcoholContent) && (
            <p className="text-xs text-tx-muted mt-1">
              {[product.volume, product.alcoholContent].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-bold text-brand-green">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-tx-muted line-through ml-2">
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>

          {/* Quantity controls */}
          {quantity > 0 && onRemove ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemove(product.id)}
                className="w-7 h-7 rounded-lg bg-surface-elevated border border-surface-border text-tx-primary hover:border-brand-red/50 hover:text-brand-red transition-colors flex items-center justify-center font-bold text-lg"
              >
                −
              </button>
              <span className="text-sm font-semibold text-tx-primary w-5 text-center">{quantity}</span>
              <button
                onClick={() => onAdd(product)}
                disabled={!product.available || product.stock === 0}
                className="w-7 h-7 rounded-lg bg-brand-green text-surface hover:bg-brand-green-dim transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(product)}
              disabled={!product.available || product.stock === 0}
              className="flex items-center gap-1.5 bg-brand-green/10 border border-brand-green/30 text-brand-green text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-green/20 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3 h-3" />
              {product.available && product.stock > 0 ? "Adicionar" : "Indisponível"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
