import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { CartItem } from "@/types";
import { MOCK_STORES } from "@/constants/mockData";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  storeId: string | null;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function CartDrawer({
  isOpen, onClose, items, total, storeId,
  onUpdateQuantity, onRemove, onClear,
}: CartDrawerProps) {
  const navigate = useNavigate();
  const store = MOCK_STORES.find((s) => s.id === storeId);
  const deliveryFee = store?.deliveryFee ?? 0;
  const minimum = store?.minimumOrder ?? 0;
  const meetsMinimum = total >= minimum;

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white border-l border-surface-border z-50
        transform transition-transform duration-300 ease-out flex flex-col
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-green" />
            <h2 className="font-display font-semibold text-lg">Meu Carrinho</h2>
            {items.length > 0 && (
              <span className="tag bg-brand-green/20 text-brand-green border border-brand-green/30 text-xs">
                {items.reduce((s, i) => s + i.quantity, 0)} itens
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-elevated rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store info */}
        {store && (
          <div className="px-4 py-2 border-b border-surface-border bg-surface-elevated/50">
            <p className="text-xs text-tx-muted">Pedido de: <span className="text-brand-green font-medium">{store.storeName}</span></p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="w-16 h-16 text-surface-border" />
              <div>
                <p className="font-medium text-tx-secondary">Carrinho vazio</p>
                <p className="text-sm text-tx-muted mt-1">Adicione produtos de uma adega</p>
              </div>
              <button onClick={onClose} className="btn-primary text-sm">Ver Adegas</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-3 card-elevated p-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tx-primary line-clamp-1">{item.product.name}</p>
                  <p className="text-brand-green text-sm font-bold mt-1">
                    R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-surface-border text-tx-primary hover:text-brand-red transition-colors flex items-center justify-center font-bold"
                    >−</button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-surface-border text-tx-primary hover:text-brand-green transition-colors flex items-center justify-center"
                    >+</button>
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="ml-auto p-1 text-tx-muted hover:text-brand-red transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-surface-border space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-tx-secondary">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between text-tx-secondary">
                <span>Entrega</span>
                <span className={deliveryFee === 0 ? "text-brand-green" : ""}>
                  {deliveryFee === 0 ? "Grátis" : `R$ ${deliveryFee.toFixed(2).replace(".", ",")}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-surface-border pt-1.5">
                <span>Total</span>
                <span className="text-brand-green">R$ {(total + deliveryFee).toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            {!meetsMinimum && (
              <p className="text-xs text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg px-3 py-2">
                Mínimo de R$ {minimum.toFixed(2).replace(".", ",")} — faltam R$ {(minimum - total).toFixed(2).replace(".", ",")}
              </p>
            )}

            <button
              onClick={handleCheckout}
              disabled={!meetsMinimum}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Finalizar Pedido
              <ArrowRight className="w-4 h-4" />
            </button>

            <button onClick={onClear} className="text-xs text-tx-muted hover:text-brand-red transition-colors w-full text-center">
              Limpar carrinho
            </button>
          </div>
        )}
      </div>
    </>
  );
}
