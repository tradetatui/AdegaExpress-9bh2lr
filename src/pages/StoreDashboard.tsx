import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Settings,
  TrendingUp, LogOut, Plus, Edit2, Trash2, Check, X, Eye, EyeOff,
} from "lucide-react";
import type { AuthUser } from "@/hooks/useAuth";
import type { Product, ProductCategory, OrderStatus } from "@/types";
import { useOrders } from "@/hooks/useOrders";
import { MOCK_PRODUCTS, CATEGORIES, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/constants/mockData";
import OrderStatusBadge from "@/components/features/OrderStatusBadge";
import { DEMO_ACCOUNTS } from "@/hooks/useAuth";

interface StoreDashboardProps {
  user: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  aguardando: "preparando",
  aceito: "preparando",
  preparando: "coletado",
  coletado: "em_rota",
  em_rota: "entregue",
};

type Tab = "overview" | "orders" | "products" | "settings";

export default function StoreDashboard({ user, onLogin, onLogout }: StoreDashboardProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const { getByStore, updateStatus } = useOrders();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [products, setProducts] = useState<Product[]>(() => {
    if (!storeUser) return [];
    const stored = localStorage.getItem(`bebeuja_products_${storeUser.id}`);
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return MOCK_PRODUCTS.filter((p) => p.storeId === "store-1");
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", category: "cerveja" as ProductCategory,
    stock: "10", volume: "", image: "",
  });

  // Store settings
  const [settings, setSettings] = useState({ openingHours: "10:00", closingHours: "02:00", deliveryFee: "5.90", isOpen: true });

  const storeUser = user?.role === "store" ? user : null;

  if (!storeUser) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (loginForm.email === DEMO_ACCOUNTS.store.email) {
        onLogin(DEMO_ACCOUNTS.store as AuthUser);
        return;
      }
      setLoginError("Use: adega@demo.com");
    };
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-yellow/20 border border-brand-yellow/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏪</span>
            </div>
            <h1 className="font-display font-bold text-2xl">Painel da Adega</h1>
            <p className="text-tx-muted text-sm mt-1">Gerencie sua adega com facilidade</p>
          </div>
          <form onSubmit={handleLogin} className="card p-6 space-y-4">
            <input type="email" required placeholder="E-mail da adega" value={loginForm.email}
              onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))} className="input-field" />
            <input type="password" required placeholder="Senha" value={loginForm.password}
              onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} className="input-field" />
            {loginError && <p className="text-brand-red text-sm">{loginError}</p>}
            <button type="submit" className="btn-primary w-full py-3">Entrar</button>
          </form>
          <p className="text-center text-xs text-tx-muted mt-4">
            Demo: <span className="text-brand-yellow">adega@demo.com</span> / qualquer senha
          </p>
          <div className="text-center mt-4">
            <Link to="/" className="text-sm text-tx-muted hover:text-tx-primary transition-colors">← Voltar para Home</Link>
          </div>
        </div>
      </main>
    );
  }

  const orders = getByStore(storeUser.id);
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const totalRevenue = orders.filter((o) => o.status === "entregue").reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "aguardando" || o.status === "preparando");

  const handleAccept = (id: string) => updateStatus(id, "aceito");
  const handleRefuse = (id: string) => updateStatus(id, "recusado");
  const handleAdvance = (id: string, currentStatus: OrderStatus) => {
    const next = NEXT_STATUS[currentStatus];
    if (next) updateStatus(id, next);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", description: "", price: "", category: "cerveja", stock: "10", volume: "", image: "" });
    setShowProductForm(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, stock: String(p.stock), volume: p.volume ?? "", image: p.image });
    setShowProductForm(true);
  };

  const saveProduct = () => {
    const base = {
      name: productForm.name, description: productForm.description,
      price: parseFloat(productForm.price), category: productForm.category,
      stock: parseInt(productForm.stock), volume: productForm.volume,
      image: productForm.image || `https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop&random=${Date.now()}`,
      available: true, featured: false,
    };
    let updated: Product[];
    if (editingProduct) {
      updated = products.map((p) => p.id === editingProduct.id ? { ...p, ...base } : p);
    } else {
      updated = [...products, { ...base, id: `p-${Date.now()}`, storeId: storeUser!.id }];
    }
    setProducts(updated);
    localStorage.setItem(`bebeuja_products_${storeUser!.id}`, JSON.stringify(updated));
    setShowProductForm(false);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem(`bebeuja_products_${storeUser!.id}`, JSON.stringify(updated));
  };

  const TABS = [
    { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
    { id: "orders", label: "Pedidos", icon: ShoppingBag, badge: pendingOrders.length },
    { id: "products", label: "Produtos", icon: Package },
    { id: "settings", label: "Configurações", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dashboard Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-yellow/20 rounded-lg flex items-center justify-center">
              <span className="text-sm">🏪</span>
            </div>
            <div>
              <p className="font-semibold text-sm leading-none">{(storeUser as any).storeName}</p>
              <p className="text-xs text-tx-muted">Painel da Adega</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-xs text-tx-muted hover:text-brand-red transition-colors px-3 py-2">
            <LogOut className="w-3.5 h-3.5" />Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 p-4 border-r border-surface-border gap-1 shrink-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                  ${tab === t.id ? "bg-brand-green/10 text-brand-green border border-brand-green/20" : "text-tx-secondary hover:bg-surface-elevated hover:text-tx-primary"}`}>
                <Icon className="w-4 h-4" />
                {t.label}
                {(t as any).badge > 0 && (
                  <span className="ml-auto w-5 h-5 bg-brand-red text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {(t as any).badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Mobile tab bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-card rounded-none border-x-0 border-b-0">
          <div className="flex">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors relative
                    ${tab === t.id ? "text-brand-green" : "text-tx-muted"}`}>
                  <Icon className="w-5 h-5" />
                  {t.label}
                  {(t as any).badge > 0 && (
                    <span className="absolute top-1 right-1/4 w-4 h-4 bg-brand-red text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {(t as any).badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-display font-bold text-xl">Visão Geral</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Receita Total", value: `R$ ${totalRevenue.toFixed(2).replace(".", ",")}`, icon: "💰", color: "text-brand-green" },
                  { label: "Pedidos Hoje", value: todayOrders.length, icon: "📦", color: "text-brand-yellow" },
                  { label: "Pendentes", value: pendingOrders.length, icon: "⏳", color: "text-orange-400" },
                  { label: "Produtos", value: products.length, icon: "🍺", color: "text-blue-400" },
                ].map((stat) => (
                  <div key={stat.label} className="card p-4">
                    <p className="text-2xl mb-2">{stat.icon}</p>
                    <p className={`font-display font-bold text-2xl ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-tx-muted mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div>
                <h3 className="font-semibold mb-3">Pedidos Recentes</h3>
                {orders.slice(0, 5).length === 0 ? (
                  <div className="card p-8 text-center">
                    <p className="text-tx-muted">Nenhum pedido ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="card p-3 flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{o.customerName}</p>
                          <p className="text-xs text-tx-muted">{o.items.length} item(s) · R$ {o.total.toFixed(2).replace(".", ",")}</p>
                        </div>
                        <OrderStatusBadge status={o.status} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORDERS */}
          {tab === "orders" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display font-bold text-xl">Gerenciar Pedidos</h2>
              {orders.length === 0 ? (
                <div className="card p-12 text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-tx-muted">Nenhum pedido recebido ainda</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-xs text-tx-muted">{order.neighborhood} · #{order.id.slice(-6)}</p>
                      </div>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </div>

                    <div className="text-sm text-tx-secondary space-y-1">
                      {order.items.map((i) => (
                        <p key={i.product.id}>{i.quantity}x {i.product.name}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-surface-border">
                      <span className="font-bold text-brand-green">R$ {order.total.toFixed(2).replace(".", ",")}</span>
                      <div className="flex gap-2">
                        {order.status === "aguardando" && (
                          <>
                            <button onClick={() => handleRefuse(order.id)} className="flex items-center gap-1 text-xs border border-brand-red/40 text-brand-red px-3 py-1.5 rounded-lg hover:bg-brand-red/10 transition-colors">
                              <X className="w-3 h-3" />Recusar
                            </button>
                            <button onClick={() => handleAccept(order.id)} className="flex items-center gap-1 text-xs bg-brand-green text-surface px-3 py-1.5 rounded-lg hover:bg-brand-green-dim transition-colors font-semibold">
                              <Check className="w-3 h-3" />Aceitar
                            </button>
                          </>
                        )}
                        {NEXT_STATUS[order.status] && order.status !== "aguardando" && (
                          <button onClick={() => handleAdvance(order.id, order.status)}
                            className="text-xs btn-secondary py-1.5 px-3">
                            → {ORDER_STATUS_LABELS[NEXT_STATUS[order.status]!]}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PRODUCTS */}
          {tab === "products" && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl">Produtos</h2>
                <button onClick={openNewProduct} className="btn-primary flex items-center gap-2 text-sm py-2">
                  <Plus className="w-4 h-4" />Adicionar
                </button>
              </div>

              {showProductForm && (
                <div className="card p-5 mb-4 border-brand-green/20 space-y-3">
                  <h3 className="font-semibold">{editingProduct ? "Editar Produto" : "Novo Produto"}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input placeholder="Nome" value={productForm.name} onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))} className="input-field text-sm" />
                    <select value={productForm.category} onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value as ProductCategory }))} className="input-field text-sm">
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                    </select>
                    <input placeholder="Preço (ex: 9.90)" value={productForm.price} onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))} className="input-field text-sm" />
                    <input placeholder="Estoque" value={productForm.stock} onChange={(e) => setProductForm((f) => ({ ...f, stock: e.target.value }))} className="input-field text-sm" type="number" />
                    <input placeholder="Volume (ex: 350ml)" value={productForm.volume} onChange={(e) => setProductForm((f) => ({ ...f, volume: e.target.value }))} className="input-field text-sm" />
                    <input placeholder="URL da imagem" value={productForm.image} onChange={(e) => setProductForm((f) => ({ ...f, image: e.target.value }))} className="input-field text-sm" />
                  </div>
                  <textarea placeholder="Descrição" value={productForm.description} onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))} className="input-field text-sm resize-none h-16 w-full" />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowProductForm(false)} className="btn-secondary text-sm py-2">Cancelar</button>
                    <button onClick={saveProduct} className="btn-primary text-sm py-2">Salvar</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((p) => (
                  <div key={p.id} className="card p-3 flex gap-3">
                    <img src={p.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                      <p className="text-xs text-tx-muted line-clamp-1">{p.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="text-brand-green font-bold">R$ {p.price.toFixed(2).replace(".", ",")}</span>
                        <span className="text-tx-muted">Estoque: {p.stock}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => openEditProduct(p)} className="p-1.5 hover:bg-surface-elevated rounded-lg transition-colors text-tx-muted hover:text-brand-green">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-surface-elevated rounded-lg transition-colors text-tx-muted hover:text-brand-red">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {tab === "settings" && (
            <div className="animate-fade-in space-y-6 max-w-md">
              <h2 className="font-display font-bold text-xl">Configurações</h2>
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold">Status da Adega</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-tx-secondary">Adega aberta para pedidos</span>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, isOpen: !s.isOpen }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.isOpen ? "bg-brand-green" : "bg-surface-elevated border border-surface-border"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.isOpen ? "left-7" : "left-1"}`} />
                  </button>
                </div>
              </div>

              <div className="card p-5 space-y-4">
                <h3 className="font-semibold">Horário de Funcionamento</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-tx-muted mb-1.5 block">Abertura</label>
                    <input type="time" value={settings.openingHours} onChange={(e) => setSettings((s) => ({ ...s, openingHours: e.target.value }))} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-tx-muted mb-1.5 block">Fechamento</label>
                    <input type="time" value={settings.closingHours} onChange={(e) => setSettings((s) => ({ ...s, closingHours: e.target.value }))} className="input-field text-sm" />
                  </div>
                </div>
              </div>

              <div className="card p-5 space-y-4">
                <h3 className="font-semibold">Taxas e Valores</h3>
                <div>
                  <label className="text-xs text-tx-muted mb-1.5 block">Taxa de entrega (R$)</label>
                  <input type="number" step="0.01" value={settings.deliveryFee} onChange={(e) => setSettings((s) => ({ ...s, deliveryFee: e.target.value }))} className="input-field text-sm" />
                </div>
              </div>

              <button className="btn-primary w-full" onClick={() => alert("Configurações salvas!")}>
                Salvar Configurações
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
