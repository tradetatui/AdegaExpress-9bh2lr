import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, Bike, Package, ChefHat, MapPin, Phone } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import type { OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/constants/mockData";

const STATUS_FLOW: OrderStatus[] = ["aguardando", "aceito", "preparando", "coletado", "em_rota", "entregue"];

const STEP_CONFIG = [
  { status: "aguardando", label: "Pedido Enviado", icon: Clock },
  { status: "aceito", label: "Confirmado", icon: CheckCircle },
  { status: "preparando", label: "Preparando", icon: ChefHat },
  { status: "coletado", label: "Coletado", icon: Package },
  { status: "em_rota", label: "A Caminho", icon: Bike },
  { status: "entregue", label: "Entregue!", icon: CheckCircle },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById } = useOrders();
  const order = getById(id ?? "");

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-6xl">📦</p>
        <p className="font-semibold text-tx-secondary">Pedido não encontrado</p>
        <button onClick={() => navigate("/")} className="btn-primary">Ir para Home</button>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const isDelivered = order.status === "entregue";
  const isRefused = order.status === "recusado";

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-tx-secondary hover:text-tx-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Voltar
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl">Acompanhar Pedido</h1>
          <p className="text-xs text-tx-muted mt-0.5">#{order.id}</p>
        </div>
        <span className="text-xs text-tx-muted">{formatTime(order.createdAt)}</span>
      </div>

      {/* Status card */}
      <div className={`card p-5 mb-6 ${isDelivered ? "neon-border" : ""}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
            ${isDelivered ? "bg-brand-green/20" : isRefused ? "bg-brand-red/20" : "bg-brand-yellow/20"}`}>
            {isDelivered ? "🎉" : isRefused ? "❌" : "⏳"}
          </div>
          <div>
            <p className="font-semibold text-tx-primary">{ORDER_STATUS_LABELS[order.status]}</p>
            <p className="text-xs text-tx-muted mt-0.5">
              {isDelivered
                ? "Aproveite suas bebidas! 🍺"
                : isRefused
                ? "Entre em contato com a adega"
                : `Previsão: ${formatTime(order.estimatedDelivery)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      {!isRefused && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold mb-4 text-sm">Progresso do Pedido</h3>
          <div className="space-y-4">
            {STEP_CONFIG.map((step, idx) => {
              const StepIcon = step.icon;
              const isDone = currentIndex >= idx;
              const isCurrent = currentIndex === idx;
              return (
                <div key={step.status} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all
                    ${isDone ? "bg-brand-green text-surface" : "bg-surface-elevated text-tx-muted border border-surface-border"}
                    ${isCurrent ? "ring-2 ring-brand-green/40" : ""}`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDone ? "text-tx-primary" : "text-tx-muted"}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-brand-green">Em andamento...</p>
                    )}
                  </div>
                  {idx < STEP_CONFIG.length - 1 && (
                    <div className={`absolute ml-4 w-0.5 h-4 mt-8 ${isDone ? "bg-brand-green" : "bg-surface-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order details */}
      <div className="card p-5 mb-4">
        <h3 className="font-semibold mb-3 text-sm">Detalhes do Pedido</h3>
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-surface-border">
          <MapPin className="w-4 h-4 text-brand-green shrink-0" />
          <p className="text-sm text-tx-secondary">{order.address}, {order.neighborhood}</p>
        </div>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span className="text-tx-secondary">{item.quantity}x {item.product.name}</span>
              <span className="text-tx-primary">R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}</span>
            </div>
          ))}
          <div className="border-t border-surface-border pt-2 mt-2 flex justify-between font-bold">
            <span>Total pago</span>
            <span className="text-brand-green">R$ {order.total.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      </div>

      {order.driverName && (
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-green/20 rounded-full flex items-center justify-center">
            <Bike className="w-5 h-5 text-brand-green" />
          </div>
          <div>
            <p className="text-sm font-medium">{order.driverName}</p>
            <p className="text-xs text-tx-muted">Seu entregador</p>
          </div>
          <button className="ml-auto flex items-center gap-1.5 text-xs text-brand-green border border-brand-green/30 px-3 py-1.5 rounded-lg hover:bg-brand-green/10 transition-colors">
            <Phone className="w-3 h-3" />Ligar
          </button>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link to="/meus-pedidos" className="text-sm text-brand-green hover:underline">
          Ver todos os pedidos
        </Link>
      </div>
    </main>
  );
}
