import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode, CheckCircle, MapPin, Bike } from "lucide-react";
import type { CartItem } from "@/types";
import type { AuthUser } from "@/hooks/useAuth";
import { MOCK_STORES } from "@/constants/mockData";
import { useOrders } from "@/hooks/useOrders";

interface CheckoutPageProps {
  cartItems: CartItem[];
  cartTotal: number;
  storeId: string | null;
  user: AuthUser | null;
  onClearCart: () => void;
}

export default function CheckoutPage({ cartItems, cartTotal, storeId, user, onClearCart }: CheckoutPageProps) {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const [step, setStep] = useState<"review" | "pix" | "success">("review");
  const [address, setAddress] = useState((user as any)?.address ?? "");
  const [neighborhood, setNeighborhood] = useState((user as any)?.neighborhood ?? "");
  const [notes, setNotes] = useState("");

  const store = MOCK_STORES.find((s) => s.id === storeId);
  const deliveryFee = store?.deliveryFee ?? 0;
  const grandTotal = cartTotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (!user || !store || cartItems.length === 0) return;
    setStep("pix");
  };

  const handleConfirmPayment = () => {
    if (!user || !store) return;
    const order = createOrder({
      customerId: user.id,
      customerName: user.name,
      storeId: store.id,
      storeName: store.storeName,
      items: cartItems,
      total: grandTotal,
      deliveryFee,
      address,
      neighborhood,
    });
    onClearCart();
    setStep("success");
    setTimeout(() => navigate(`/pedido/${order.id}`), 2000);
  };

  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="w-24 h-24 bg-brand-green/20 border-2 border-brand-green rounded-full flex items-center justify-center animate-pulse-green">
          <CheckCircle className="w-12 h-12 text-brand-green" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-tx-primary">Pedido Confirmado!</h1>
          <p className="text-tx-secondary mt-2">Redirecionando para acompanhar seu pedido...</p>
        </div>
      </div>
    );
  }

  if (step === "pix") {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-4 py-8">
        <button onClick={() => setStep("review")} className="flex items-center gap-2 text-tx-secondary hover:text-tx-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Voltar
        </button>

        <div className="card p-6 text-center space-y-6">
          <div className="w-16 h-16 bg-brand-green/20 rounded-2xl flex items-center justify-center mx-auto">
            <QrCode className="w-8 h-8 text-brand-green" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">Pagamento via Pix</h2>
            <p className="text-tx-secondary text-sm mt-1">Escaneie o QR Code ou copie a chave</p>
          </div>

          {/* Fake QR Code */}
          <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center">
            <div className="grid grid-cols-8 gap-0.5">
              {Array.from({ length: 64 }, (_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 ${Math.random() > 0.4 ? "bg-gray-900" : "bg-white"}`}
                />
              ))}
            </div>
          </div>

          <div className="bg-surface-elevated border border-surface-border rounded-xl p-3">
            <p className="text-xs text-tx-muted mb-1">Chave Pix</p>
            <p className="text-sm font-mono text-tx-primary">bebeuja@pix.com.br</p>
          </div>

          <div className="bg-surface-elevated rounded-xl p-4">
            <p className="text-tx-muted text-sm">Total a pagar</p>
            <p className="font-display font-bold text-3xl text-brand-green mt-1">
              R$ {grandTotal.toFixed(2).replace(".", ",")}
            </p>
          </div>

          <button onClick={handleConfirmPayment} className="btn-primary w-full text-base py-3 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Confirmar Pagamento
          </button>
          <p className="text-xs text-tx-muted">Simulação — clique para confirmar o pedido</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-tx-secondary hover:text-tx-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Voltar
      </button>

      <h1 className="font-display font-bold text-2xl mb-6">Finalizar Pedido</h1>

      <div className="space-y-4">
        {/* Store */}
        {store && (
          <div className="card p-4 flex items-center gap-3">
            <img src={store.logo} alt="" className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <p className="font-semibold text-tx-primary">{store.storeName}</p>
              <p className="text-xs text-tx-muted flex items-center gap-1"><Bike className="w-3 h-3" />{store.deliveryTime}</p>
            </div>
          </div>
        )}

        {/* Address */}
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-green" />Endereço de Entrega
          </h3>
          <input type="text" placeholder="Rua e número" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
          <input type="text" placeholder="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="input-field" />
          <textarea placeholder="Observações (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field resize-none h-20 text-sm" />
        </div>

        {/* Items */}
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold">Itens do Pedido</h3>
          {cartItems.map((item) => (
            <div key={item.product.id} className="flex items-center gap-3">
              <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-tx-muted">Qtd: {item.quantity}</p>
              </div>
              <p className="text-brand-green font-semibold text-sm">
                R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-4 space-y-2">
          <h3 className="font-semibold mb-3">Resumo</h3>
          <div className="flex justify-between text-sm text-tx-secondary">
            <span>Subtotal</span><span>R$ {cartTotal.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex justify-between text-sm text-tx-secondary">
            <span>Taxa de entrega</span>
            <span className={deliveryFee === 0 ? "text-brand-green" : ""}>
              {deliveryFee === 0 ? "Grátis" : `R$ ${deliveryFee.toFixed(2).replace(".", ",")}`}
            </span>
          </div>
          <div className="flex justify-between font-bold border-t border-surface-border pt-2 mt-2">
            <span>Total</span>
            <span className="text-brand-green text-lg">R$ {grandTotal.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-brand-green/20 rounded-lg flex items-center justify-center">
              <QrCode className="w-4 h-4 text-brand-green" />
            </div>
            <div>
              <p className="font-medium text-sm">Pagamento via Pix</p>
              <p className="text-xs text-tx-muted">Rápido, seguro e sem taxas</p>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={!address || !neighborhood || !user}
          className="btn-primary w-full text-base py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {!user ? "Faça login para continuar" : "Ir para Pagamento →"}
        </button>
      </div>
    </main>
  );
}
