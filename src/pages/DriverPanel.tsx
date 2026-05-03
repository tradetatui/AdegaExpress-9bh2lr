import { useState } from "react";
import { Link } from "react-router-dom";
import { Bike, MapPin, Package, CheckCircle, Clock, LogOut, ArrowRight, Star } from "lucide-react";
import type { AuthUser } from "@/hooks/useAuth";
import type { Driver, OrderStatus } from "@/types";
import { useOrders } from "@/hooks/useOrders";
import OrderStatusBadge from "@/components/features/OrderStatusBadge";
import { DEMO_ACCOUNTS } from "@/hooks/useAuth";

interface DriverPanelProps {
  user: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
}

const DRIVER_NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  aceito: "coletado",
  preparando: "coletado",
  coletado: "em_rota",
  em_rota: "entregue",
};

export default function DriverPanel({ user, onLogin, onLogout }: DriverPanelProps) {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const { orders, updateStatus, assignDriver, getPendingForDriver } = useOrders();

  const driverUser = user?.role === "driver" ? (user as Driver) : null;
  const [isOnline, setIsOnline] = useState(driverUser?.isOnline ?? false);

  if (!driverUser) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (loginForm.email === DEMO_ACCOUNTS.driver.email) {
        onLogin(DEMO_ACCOUNTS.driver as AuthUser);
        return;
      }
      setLoginError("Use: motoboy@demo.com");
    };

    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-400/20 border border-orange-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bike className="w-8 h-8 text-orange-400" />
            </div>
            <h1 className="font-display font-bold text-2xl">Painel do Motoboy</h1>
            <p className="text-tx-muted text-sm mt-1">Gerencie suas entregas</p>
          </div>
          <form onSubmit={handleLogin} className="card p-6 space-y-4">
            <input type="email" required placeholder="Seu e-mail" value={loginForm.email}
              onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))} className="input-field" />
            <input type="password" required placeholder="Senha" value={loginForm.password}
              onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} className="input-field" />
            {loginError && <p className="text-brand-red text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
              Entrar
            </button>
          </form>
          <p className="text-center text-xs text-tx-muted mt-4">
            Demo: <span className="text-orange-400">motoboy@demo.com</span> / qualquer senha
          </p>
          <div className="text-center mt-4">
            <Link to="/" className="text-sm text-tx-muted hover:text-tx-primary transition-colors">← Voltar para Home</Link>
          </div>
        </div>
      </main>
    );
  }

  const available = getPendingForDriver();
  const myDeliveries = orders.filter(
    (o) => o.driverId === driverUser.id && (o.status === "coletado" || o.status === "em_rota")
  );
  const completed = orders.filter((o) => o.driverId === driverUser.id && o.status === "entregue");

  const handleAcceptDelivery = (orderId: string) => {
    assignDriver(orderId, driverUser.id, driverUser.name);
  };

  const handleAdvanceStatus = (orderId: string, current: OrderStatus) => {
    const next = DRIVER_NEXT_STATUS[current];
    if (next) updateStatus(orderId, next);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bike className="w-5 h-5 text-orange-400" />
            <div>
              <p className="font-semibold text-sm leading-none">{driverUser.name}</p>
              <p className="text-xs text-tx-muted">{driverUser.vehicle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Online toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                ${isOnline
                  ? "bg-brand-green/20 text-brand-green border-brand-green/40"
                  : "bg-surface-elevated text-tx-muted border-surface-border"}`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-brand-green animate-pulse" : "bg-tx-muted"}`} />
              {isOnline ? "Online" : "Offline"}
            </button>
            <button onClick={onLogout} className="p-2 text-tx-muted hover:text-brand-red transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Entregas", value: driverUser.completedDeliveries + completed.length, icon: CheckCircle, color: "text-brand-green" },
            { label: "Avaliação", value: `${driverUser.rating}★`, icon: Star, color: "text-brand-yellow" },
            { label: "Em Andamento", value: myDeliveries.length, icon: Bike, color: "text-orange-400" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card p-3 text-center">
                <Icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                <p className={`font-display font-bold text-lg ${s.color}`}>{s.value}</p>
                <p className="text-xs text-tx-muted">{s.label}</p>
              </div>
            );
          })}
        </div>

        {!isOnline && (
          <div className="card p-6 text-center border-dashed border-surface-border">
            <Bike className="w-12 h-12 text-surface-border mx-auto mb-3" />
            <p className="font-semibold text-tx-secondary">Você está offline</p>
            <p className="text-sm text-tx-muted mt-1">Ative o modo Online para receber pedidos</p>
            <button onClick={() => setIsOnline(true)}
              className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors">
              Ficar Online
            </button>
          </div>
        )}

        {/* Active deliveries */}
        {myDeliveries.length > 0 && (
          <section>
            <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              Minhas Entregas Ativas
            </h2>
            <div className="space-y-3">
              {myDeliveries.map((order) => (
                <div key={order.id} className="card p-4 border-orange-400/20">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-semibold">{order.storeName}</p>
                      <p className="text-xs text-tx-muted">Para: {order.customerName}</p>
                    </div>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-tx-secondary mb-3">
                    <MapPin className="w-4 h-4 text-brand-green shrink-0" />
                    <span>{order.address}, {order.neighborhood}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-green font-bold">R$ {order.total.toFixed(2).replace(".", ",")}</span>
                    {DRIVER_NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, order.status)}
                        className="flex items-center gap-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-colors font-semibold"
                      >
                        {order.status === "coletado" ? "Saiu para Entrega" : "Confirmar Entrega"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Available orders */}
        {isOnline && (
          <section>
            <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-green" />
              Pedidos Disponíveis
              <span className="tag bg-brand-green/20 text-brand-green border border-brand-green/30 text-xs">{available.length}</span>
            </h2>

            {available.length === 0 ? (
              <div className="card p-8 text-center">
                <Clock className="w-10 h-10 text-surface-border mx-auto mb-2" />
                <p className="text-tx-muted text-sm">Aguardando novos pedidos...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {available.map((order) => (
                  <div key={order.id} className="card p-4 hover:border-brand-green/30 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-sm">{order.storeName}</p>
                        <p className="text-xs text-tx-muted">{order.neighborhood}</p>
                      </div>
                      <span className="text-brand-green font-bold text-sm">
                        R$ {order.total.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-tx-muted mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {order.address}, {order.neighborhood}
                    </div>
                    <button
                      onClick={() => handleAcceptDelivery(order.id)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Bike className="w-4 h-4" />
                      Aceitar Entrega
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <section>
            <h2 className="font-display font-semibold mb-3 text-tx-secondary">Entregas Concluídas Hoje</h2>
            <div className="space-y-2">
              {completed.map((o) => (
                <div key={o.id} className="card-elevated p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{o.storeName}</p>
                    <p className="text-xs text-tx-muted">{o.neighborhood}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-green font-semibold text-sm">R$ {o.total.toFixed(2).replace(".", ",")}</p>
                    <OrderStatusBadge status={o.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
