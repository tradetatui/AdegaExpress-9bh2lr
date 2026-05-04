import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import type { AuthUser } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import OrderStatusBadge from "@/components/features/OrderStatusBadge";

interface MyOrdersPageProps {
  user: AuthUser | null;
}

export default function MyOrdersPage({ user }: MyOrdersPageProps) {
  const navigate = useNavigate();
  const { getByCustomer } = useOrders();
  const orders = user ? getByCustomer(user.id) : [];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-tx-secondary">Faça login para ver seus pedidos</p>
        <Link to="/entrar" className="btn-primary">Entrar</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-tx-secondary hover:text-tx-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Voltar
      </button>

      <h1 className="font-display font-bold text-2xl mb-6">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 text-center">
          <Package className="w-16 h-16 text-surface-border" />
          <p className="font-semibold text-tx-secondary">Nenhum pedido ainda</p>
          <p className="text-sm text-tx-muted">Explore as adegas e faça seu primeiro pedido!</p>
          <Link to="/" className="btn-primary">Ver Adegas</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/pedido/${order.id}`} className="card p-4 block hover:border-brand-green/30 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-tx-primary">{order.storeName}</p>
                  <p className="text-xs text-tx-muted mt-0.5">#{order.id}</p>
                </div>
                <OrderStatusBadge status={order.status} size="sm" />
              </div>
              <div className="flex items-center gap-3 text-sm text-tx-secondary">
                <span>{order.items.length} item(s)</span>
                <span>·</span>
                <span className="text-brand-green font-semibold">R$ {order.total.toFixed(2).replace(".", ",")}</span>
                <span>·</span>
                <span>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
