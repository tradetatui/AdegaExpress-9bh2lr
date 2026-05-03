import { CheckCircle, Clock, Truck, Package, XCircle, ChefHat } from "lucide-react";
import type { OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants/mockData";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
}

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  aguardando: <Clock className="w-3.5 h-3.5" />,
  aceito: <CheckCircle className="w-3.5 h-3.5" />,
  recusado: <XCircle className="w-3.5 h-3.5" />,
  preparando: <ChefHat className="w-3.5 h-3.5" />,
  coletado: <Package className="w-3.5 h-3.5" />,
  em_rota: <Truck className="w-3.5 h-3.5" />,
  entregue: <CheckCircle className="w-3.5 h-3.5" />,
};

export default function OrderStatusBadge({ status, size = "md" }: OrderStatusBadgeProps) {
  const colorClass = ORDER_STATUS_COLORS[status] || "text-tx-secondary bg-surface-elevated border-surface-border";
  const label = ORDER_STATUS_LABELS[status] || status;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium
      ${colorClass}
      ${size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-sm px-4 py-2" : "text-xs px-3 py-1"}
    `}>
      {STATUS_ICONS[status]}
      {label}
    </span>
  );
}
