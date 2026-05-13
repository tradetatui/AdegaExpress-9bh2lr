import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Store, Users, ShoppingBag, TrendingUp,
  LogOut, Trash2, Check, X, Eye, EyeOff, Ban, ToggleLeft,
  ToggleRight, ArrowLeft, Search, RefreshCw, ChevronDown,
  UserCheck, Truck, AlertCircle, Package
} from "lucide-react";
import type { AuthUser } from "@/hooks/useAuth";
import { MOCK_STORES } from "@/constants/mockData";
import { useOrders } from "@/hooks/useOrders";
import OrderStatusBadge from "@/components/features/OrderStatusBadge";

// =======================
// CREDENCIAIS DO ADMIN
// =======================
const ADMIN_EMAIL = "admin@bebeuja.com";
const ADMIN_PASSWORD = "admin123";

interface AdminDashboardProps {
  user: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
}

type Tab = "overview" | "stores" | "users" | "orders" | "drivers";

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
  status: "pending" | "approved" | "blocked";
  document?: string;
  vehicle?: string;
  businessHours?: string;
  documentFileName?: string;
}

export default function AdminDashboard({ user, onLogin, onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [search, setSearch] = useState("");
  const { orders, updateStatus } = useOrders();

  // Usuários registrados (do localStorage ou mock)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    const stored = localStorage.getItem("bebeuja_registered_users");
    if (stored) {
      try { return JSON.parse(stored); } catch { return []; }
    }
    return [
      { id: "cust-demo", name: "João Cliente", email: "cliente@demo.com", role: "customer", phone: "(11) 99999-1111", createdAt: new Date().toISOString(), status: "approved" },
      { id: "store-1", name: "Carlos Silva", email: "adega@demo.com", role: "store", phone: "(11) 99999-0001", createdAt: new Date().toISOString(), status: "approved", businessHours: "10:00 - 02:00" },
      { id: "driver-demo", name: "Pedro Entregador", email: "motoboy@demo.com", role: "driver", phone: "(11) 99999-3333", createdAt: new Date().toISOString(), status: "approved", vehicle: "Moto Honda CG 160" },
    ];
  });

  // Adegas (do localStorage + mock)
  const [stores, setStores] = useState(() => {
    const stored = localStorage.getItem("bebeuja_stores");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return [...MOCK_STORES, ...parsed];
      } catch {}
    }
    return MOCK_STORES;
  });

  const isAdmin = (user as any)?.role === "admin";

  // ===========================
  // LOGIN DO ADMIN
  // ===========================
  if (!isAdmin) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (loginForm.email === ADMIN_EMAIL && loginForm.password === ADMIN_PASSWORD) {
        onLogin({
          id: "admin-1",
          name: "Administrador",
          email: ADMIN_EMAIL,
          role: "admin",
        } as any);
        return;
      }
      setLoginError("E-mail ou senha inválidos.");
    };

    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-red/20 border border-brand-red/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="font-display font-bold text-2xl">Painel Administrativo</h1>
            <p className="text-tx-muted text-sm mt-1">Acesso restrito — BebeuJá</p>
          </div>
          <form onSubmit={handleLogin} className="card p-6 space-y-4">
            <div>
              <label className="text-xs text-tx-muted block mb-1.5">E-mail</label>
              <input type="email" required placeholder="admin@bebeuja.com" value={loginForm.email}
                onChange={(e) => setLoginForm(f => ({ ...f, email: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-tx-muted block mb-1.5">Senha</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} required placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-primary">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {loginError && <p className="text-brand-red text-sm">{loginError}</p>}
            <button type="submit" className="btn-primary w-full py-3">Acessar Painel</button>
          </form>
          <p className="text-center text-xs text-tx-muted mt-4">
            Demo: <span className="text-brand-red">admin@bebeuja.com</span> / <span className="text-brand-red">admin123</span>
          </p>
          <div className="text-center mt-3">
            <Link to="/" className="text-sm text-tx-muted hover:text-tx-primary transition-colors flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ===========================
  // MÉTRICAS GERAIS
  // ===========================
  const totalStores = stores.length;
  const totalUsers = registeredUsers.length;
  const pendingUsers = registeredUsers.filter(u => u.status === "pending").length;
  const totalOrders = orders.length;
  const totalRevenue = orders.filter(o => o.status === "entregue").reduce((s, o) => s + o.total, 0);
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());

  // ===========================
  // AÇÕES SOBRE USUÁRIOS
  // ===========================
  const approveUser = (id: string) => {
    const updated = registeredUsers.map(u => u.id === id ? { ...u, status: "approved" as const } : u);
    setRegisteredUsers(updated);
    localStorage.setItem("bebeuja_registered_users", JSON.stringify(updated));
  };

  const blockUser = (id: string) => {
    const updated = registeredUsers.map(u => u.id === id ? { ...u, status: "blocked" as const } : u);
    setRegisteredUsers(updated);
    localStorage.setItem("bebeuja_registered_users", JSON.stringify(updated));
  };

  const deleteUser = (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover este usuário?")) return;
    const updated = registeredUsers.filter(u => u.id !== id);
    setRegisteredUsers(updated);
    localStorage.setItem("bebeuja_registered_users", JSON.stringify(updated));
  };

  // ===========================
  // AÇÕES SOBRE ADEGAS
  // ===========================
  const toggleStoreOpen = (id: string) => {
    const updated = stores.map(s => s.id === id ? { ...s, isOpen: !s.isOpen } : s);
    setStores(updated);
  };

  const deleteStore = (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover esta adega?")) return;
    const updated = stores.filter(s => s.id !== id);
    setStores(updated);
  };

  const ROLE_LABELS: Record<string, string> = {
    customer: "👤 Cliente",
    store: "🏪 Adega",
    driver: "🛵 Entregador",
    admin: "🔐 Admin",
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: "text-brand-yellow bg-brand-yellow/10 border-brand-yellow/30",
    approved: "text-brand-green bg-brand-green/10 border-brand-green/30",
    blocked: "text-brand-red bg-brand-red/10 border-brand-red/30",
  };
  const STATUS_LABELS: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    blocked: "Bloqueado",
  };

  const TABS = [
    { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
    { id: "stores", label: "Adegas", icon: Store, badge: 0 },
    { id: "users", label: "Usuários", icon: Users, badge: pendingUsers },
    { id: "drivers", label: "Entregadores", icon: Truck },
    { id: "orders", label: "Pedidos", icon: ShoppingBag },
  ] as const;

  const filteredUsers = registeredUsers.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const filteredStores = stores.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (s as any).storeName?.toLowerCase().includes(q) || (s as any).city?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-red/20 rounded-lg flex items-center justify-center">
              <span className="text-sm">🔐</span>
            </div>
            <div>
              <p className="font-semibold text-sm leading-none">Painel Admin</p>
              <p className="text-xs text-brand-red">BebeuJá — Acesso Total</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-tx-muted hover:text-tx-primary transition-colors">
              Ver Site
            </Link>
            <button onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-tx-muted hover:text-brand-red transition-colors px-3 py-2">
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
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
                  ${tab === t.id ? "bg-brand-red/10 text-brand-red border border-brand-red/20" : "text-tx-secondary hover:bg-surface-elevated hover:text-tx-primary"}`}>
                <Icon className="w-4 h-4" />
                {t.label}
                {(t as any).badge > 0 && (
                  <span className="ml-auto w-5 h-5 bg-brand-yellow text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {(t as any).badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Mobile Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-card rounded-none border-x-0 border-b-0">
          <div className="flex">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors relative
                    ${tab === t.id ? "text-brand-red" : "text-tx-muted"}`}>
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:block">{t.label}</span>
                  {(t as any).badge > 0 && (
                    <span className="absolute top-1 right-1/4 w-4 h-4 bg-brand-yellow text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {(t as any).badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">

          {/* ======== OVERVIEW ======== */}
          {tab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display font-bold text-xl">Visão Geral</h2>
                <p className="text-tx-muted text-sm">Controle total da plataforma BebeuJá</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Receita Total", value: `R$ ${totalRevenue.toFixed(2).replace(".", ",")}`, icon: "💰", color: "text-brand-green", sub: "pedidos entregues" },
                  { label: "Pedidos Hoje", value: todayOrders.length, icon: "📦", color: "text-brand-yellow", sub: "no dia" },
                  { label: "Total Pedidos", value: totalOrders, icon: "🛒", color: "text-blue-400", sub: "na plataforma" },
                  { label: "Adegas Ativas", value: stores.filter(s => s.isOpen).length, icon: "🏪", color: "text-brand-green", sub: `de ${totalStores} cadastradas` },
                  { label: "Usuários", value: totalUsers, icon: "👥", color: "text-purple-400", sub: "cadastrados" },
                  { label: "Pendentes", value: pendingUsers, icon: "⏳", color: "text-brand-yellow", sub: "aguardando aprovação" },
                ].map((stat) => (
                  <div key={stat.label} className="card p-4">
                    <p className="text-2xl mb-2">{stat.icon}</p>
                    <p className={`font-display font-bold text-2xl ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm font-medium text-tx-primary mt-0.5">{stat.label}</p>
                    <p className="text-xs text-tx-muted">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Alertas */}
              {pendingUsers > 0 && (
                <div className="card border-brand-yellow/40 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-brand-yellow text-sm">Aprovações pendentes</p>
                    <p className="text-xs text-tx-secondary mt-0.5">
                      {pendingUsers} usuário(s) aguardando aprovação. <button onClick={() => setTab("users")} className="text-brand-green hover:underline">Ver agora →</button>
                    </p>
                  </div>
                </div>
              )}

              {/* Pedidos Recentes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Pedidos Recentes</h3>
                  <button onClick={() => setTab("orders")} className="text-xs text-brand-green hover:underline">Ver todos</button>
                </div>
                {orders.slice(0, 6).length === 0 ? (
                  <div className="card p-8 text-center">
                    <p className="text-tx-muted">Nenhum pedido ainda</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.slice(0, 6).map(o => (
                      <div key={o.id} className="card p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{o.customerName}</p>
                          <p className="text-xs text-tx-muted">{o.storeName} · R$ {o.total.toFixed(2).replace(".", ",")}</p>
                        </div>
                        <OrderStatusBadge status={o.status} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======== ADEGAS ======== */}
          {tab === "stores" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">Adegas Cadastradas</h2>
                <span className="text-xs text-tx-muted bg-surface-elevated px-3 py-1 rounded-full border border-surface-border">
                  {stores.length} adegas
                </span>
              </div>

              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-muted" />
                <input type="text" placeholder="Buscar adega..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10 text-sm" />
              </div>

              <div className="space-y-3">
                {filteredStores.map(store => (
                  <div key={store.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <img src={(store as any).logo || "https://placehold.co/48?text=A"}
                        alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{(store as any).storeName}</p>
                            <p className="text-xs text-tx-muted">{(store as any).neighborhood} · {(store as any).city}</p>
                            <p className="text-xs text-tx-muted mt-0.5">{store.email}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                              ${store.isOpen ? "text-brand-green bg-brand-green/10 border-brand-green/30" : "text-tx-muted bg-surface-elevated border-surface-border"}`}>
                              {store.isOpen ? "Aberta" : "Fechada"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button onClick={() => toggleStoreOpen(store.id)}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors
                              ${store.isOpen
                                ? "border-brand-yellow/40 text-brand-yellow hover:bg-brand-yellow/10"
                                : "border-brand-green/40 text-brand-green hover:bg-brand-green/10"}`}>
                            {store.isOpen ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                            {store.isOpen ? "Fechar" : "Abrir"}
                          </button>
                          <Link to={`/loja/${store.id}`}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-surface-border text-tx-muted hover:text-tx-primary hover:border-brand-green/40 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> Ver Loja
                          </Link>
                          <button onClick={() => deleteStore(store.id)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-brand-red/30 text-brand-red hover:bg-brand-red/10 transition-colors ml-auto">
                            <Trash2 className="w-3.5 h-3.5" /> Remover
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Info Extras */}
                    <div className="flex gap-4 mt-3 pt-3 border-t border-surface-border text-xs text-tx-muted">
                      <span>⭐ {(store as any).rating}</span>
                      <span>📦 {(store as any).minimumOrder ? `Min. R$${(store as any).minimumOrder}` : "—"}</span>
                      <span>🛵 Taxa: R${(store as any).deliveryFee?.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======== USUÁRIOS ======== */}
          {tab === "users" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">Usuários Cadastrados</h2>
                <span className="text-xs text-tx-muted bg-surface-elevated px-3 py-1 rounded-full border border-surface-border">
                  {registeredUsers.filter(u => u.role !== "driver").length} usuários
                </span>
              </div>

              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-muted" />
                <input type="text" placeholder="Buscar por nome ou e-mail..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10 text-sm" />
              </div>

              {/* Filtros de status */}
              <div className="flex gap-2 flex-wrap">
                {["Todos", "Pendentes", "Aprovados", "Bloqueados"].map(f => (
                  <button key={f}
                    className="text-xs px-3 py-1.5 rounded-lg border border-surface-border text-tx-muted hover:border-brand-red/40 hover:text-tx-primary transition-colors">
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredUsers.filter(u => u.role !== "driver").map(u => (
                  <div key={u.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{u.name}</p>
                          <span className="text-xs text-tx-muted">{ROLE_LABELS[u.role] || u.role}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[u.status]}`}>
                            {STATUS_LABELS[u.status]}
                          </span>
                        </div>
                        <p className="text-xs text-tx-muted mt-0.5">{u.email}</p>
                        {u.phone && <p className="text-xs text-tx-muted">{u.phone}</p>}
                        {u.businessHours && <p className="text-xs text-tx-muted">🕐 {u.businessHours}</p>}
                        {u.vehicle && <p className="text-xs text-tx-muted">🛵 {u.vehicle}</p>}
                        {u.documentFileName && (
                          <p className="text-xs text-blue-400 mt-1">📎 {u.documentFileName}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 flex-wrap">
                      {u.status === "pending" && (
                        <button onClick={() => approveUser(u.id)}
                          className="flex items-center gap-1.5 text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-green-dim transition-colors">
                          <Check className="w-3.5 h-3.5" /> Aprovar
                        </button>
                      )}
                      {u.status !== "blocked" ? (
                        <button onClick={() => blockUser(u.id)}
                          className="flex items-center gap-1.5 text-xs border border-brand-red/30 text-brand-red px-3 py-1.5 rounded-lg hover:bg-brand-red/10 transition-colors">
                          <Ban className="w-3.5 h-3.5" /> Bloquear
                        </button>
                      ) : (
                        <button onClick={() => approveUser(u.id)}
                          className="flex items-center gap-1.5 text-xs border border-brand-green/30 text-brand-green px-3 py-1.5 rounded-lg hover:bg-brand-green/10 transition-colors">
                          <UserCheck className="w-3.5 h-3.5" /> Desbloquear
                        </button>
                      )}
                      <button onClick={() => deleteUser(u.id)}
                        className="flex items-center gap-1.5 text-xs border border-surface-border text-tx-muted px-3 py-1.5 rounded-lg hover:border-brand-red/30 hover:text-brand-red transition-colors ml-auto">
                        <Trash2 className="w-3.5 h-3.5" /> Remover
                      </button>
                    </div>
                  </div>
                ))}
                {filteredUsers.filter(u => u.role !== "driver").length === 0 && (
                  <div className="card p-12 text-center">
                    <p className="text-tx-muted">Nenhum usuário encontrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======== ENTREGADORES ======== */}
          {tab === "drivers" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">Entregadores</h2>
                <span className="text-xs text-tx-muted bg-surface-elevated px-3 py-1 rounded-full border border-surface-border">
                  {registeredUsers.filter(u => u.role === "driver").length} entregadores
                </span>
              </div>

              <div className="space-y-3">
                {registeredUsers.filter(u => u.role === "driver").map(u => (
                  <div key={u.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{u.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[u.status]}`}>
                            {STATUS_LABELS[u.status]}
                          </span>
                        </div>
                        <p className="text-xs text-tx-muted">{u.email}</p>
                        {u.phone && <p className="text-xs text-tx-muted">{u.phone}</p>}
                        {u.vehicle && <p className="text-xs text-tx-muted mt-1">🛵 {u.vehicle}</p>}
                        {u.document && <p className="text-xs text-tx-muted">CNH: {u.document}</p>}
                        {u.documentFileName && <p className="text-xs text-blue-400 mt-1">📎 {u.documentFileName}</p>}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      {u.status === "pending" && (
                        <button onClick={() => approveUser(u.id)}
                          className="flex items-center gap-1.5 text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg font-semibold">
                          <Check className="w-3.5 h-3.5" /> Aprovar
                        </button>
                      )}
                      {u.status !== "blocked" ? (
                        <button onClick={() => blockUser(u.id)}
                          className="flex items-center gap-1.5 text-xs border border-brand-red/30 text-brand-red px-3 py-1.5 rounded-lg hover:bg-brand-red/10 transition-colors">
                          <Ban className="w-3.5 h-3.5" /> Bloquear
                        </button>
                      ) : (
                        <button onClick={() => approveUser(u.id)}
                          className="flex items-center gap-1.5 text-xs border border-brand-green/30 text-brand-green px-3 py-1.5 rounded-lg hover:bg-brand-green/10 transition-colors">
                          <UserCheck className="w-3.5 h-3.5" /> Desbloquear
                        </button>
                      )}
                      <button onClick={() => deleteUser(u.id)}
                        className="flex items-center gap-1.5 text-xs border border-surface-border text-tx-muted px-3 py-1.5 rounded-lg hover:border-brand-red/30 hover:text-brand-red transition-colors ml-auto">
                        <Trash2 className="w-3.5 h-3.5" /> Remover
                      </button>
                    </div>
                  </div>
                ))}
                {registeredUsers.filter(u => u.role === "driver").length === 0 && (
                  <div className="card p-12 text-center">
                    <p className="text-tx-muted">Nenhum entregador cadastrado ainda</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======== TODOS OS PEDIDOS ======== */}
          {tab === "orders" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">Todos os Pedidos</h2>
                <span className="text-xs text-tx-muted bg-surface-elevated px-3 py-1 rounded-full border border-surface-border">
                  {orders.length} pedidos
                </span>
              </div>

              {/* Resumo financeiro */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card p-3 text-center">
                  <p className="text-brand-green font-bold text-lg">R$ {totalRevenue.toFixed(2).replace(".", ",")}</p>
                  <p className="text-xs text-tx-muted">Receita Total</p>
                </div>
                <div className="card p-3 text-center">
                  <p className="text-brand-yellow font-bold text-lg">{orders.filter(o => o.status === "aguardando" || o.status === "preparando").length}</p>
                  <p className="text-xs text-tx-muted">Em Andamento</p>
                </div>
                <div className="card p-3 text-center">
                  <p className="text-brand-green font-bold text-lg">{orders.filter(o => o.status === "entregue").length}</p>
                  <p className="text-xs text-tx-muted">Entregues</p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="card p-12 text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-tx-muted">Nenhum pedido ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{order.customerName}</p>
                            <span className="text-xs text-tx-muted">→ {order.storeName}</span>
                          </div>
                          <p className="text-xs text-tx-muted">{order.neighborhood} · #{order.id.slice(-6)}</p>
                          <p className="text-xs text-tx-muted mt-1">
                            {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(", ")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-brand-green text-sm">R$ {order.total.toFixed(2).replace(".", ",")}</p>
                          <div className="mt-1">
                            <OrderStatusBadge status={order.status} size="sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
