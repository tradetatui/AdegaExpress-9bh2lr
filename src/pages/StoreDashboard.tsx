import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Settings,
  LogOut, Plus, Edit2, Trash2, Check, X, Upload, Camera,
  MapPin, Tag, Clock, Truck, DollarSign, Store, Save,
} from "lucide-react";
import type { AuthUser } from "@/hooks/useAuth";
import type { Product, ProductCategory, OrderStatus } from "@/types";
import { useOrders } from "@/hooks/useOrders";
import { MOCK_PRODUCTS, CATEGORIES, ORDER_STATUS_LABELS } from "@/constants/mockData";
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

// =====================================================
// Helpers para ler/salvar perfil do localStorage
// =====================================================
function loadProfile(storeId: string, storeUser: any) {
  const saved = localStorage.getItem(`bebeuja_store_profile_${storeId}`);
  if (saved) { try { return JSON.parse(saved); } catch {} }
  return {
    storeName: storeUser?.storeName ?? storeUser?.name ?? "",
    description: storeUser?.description ?? "",
    city: storeUser?.city ?? "",
    neighborhood: storeUser?.neighborhood ?? "",
    phone: storeUser?.phone ?? "",
    logo: storeUser?.logo ?? "",
    coverImage: storeUser?.coverImage ?? "",
    categories: storeUser?.categories ?? [],
    openingHours: storeUser?.openingHours ?? "10:00",
    closingHours: storeUser?.closingHours ?? "22:00",
    deliveryFee: String(storeUser?.deliveryFee ?? "5.90"),
    minimumOrder: String(storeUser?.minimumOrder ?? "30"),
    isOpen: storeUser?.isOpen ?? true,
  };
}

function loadProducts(storeId: string, fallbackStoreId = "store-1") {
  const stored = localStorage.getItem(`bebeuja_products_${storeId}`);
  if (stored) { try { return JSON.parse(stored); } catch {} }
  return MOCK_PRODUCTS.filter((p) => p.storeId === fallbackStoreId);
}

export default function StoreDashboard({ user, onLogin, onLogout }: StoreDashboardProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const { getByStore, updateStatus } = useOrders();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Determine store user first (no hooks before this)
  const storeUser = user?.role === "store" ? user : null;
  const storeId = storeUser?.id ?? "";

  // Products state
  const [products, setProducts] = useState<Product[]>(() =>
    storeUser ? loadProducts(storeUser.id) : []
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", category: "cerveja" as ProductCategory,
    stock: "10", volume: "", image: "",
  });

  // Profile + settings state
  const [profile, setProfile] = useState<any>(() =>
    storeUser ? loadProfile(storeUser.id, storeUser) : {}
  );
  const [profileSaved, setProfileSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ===========================
  // LOGIN (not authenticated)
  // ===========================
  if (!storeUser) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Check registered users first
      const stored: any[] = JSON.parse(localStorage.getItem("bebeuja_registered_users") ?? "[]");
      const found = stored.find((u: any) => u.email === loginForm.email && u.role === "store");
      if (found) {
        if (found.status === "blocked") { setLoginError("Conta bloqueada. Contate o suporte."); return; }
        onLogin(found as AuthUser);
        return;
      }
      // Demo account
      if (loginForm.email === DEMO_ACCOUNTS.store.email) {
        onLogin(DEMO_ACCOUNTS.store as AuthUser);
        return;
      }
      setLoginError("E-mail não encontrado. Cadastre-se ou use o demo.");
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

  // ===========================
  // Store data
  // ===========================
  const orders = getByStore(storeUser.id);
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const totalRevenue = orders.filter((o) => o.status === "entregue").reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "aguardando" || o.status === "preparando");

  // ===========================
  // Order actions
  // ===========================
  const handleAccept = (id: string) => updateStatus(id, "aceito");
  const handleRefuse = (id: string) => updateStatus(id, "recusado");
  const handleAdvance = (id: string, currentStatus: OrderStatus) => {
    const next = NEXT_STATUS[currentStatus];
    if (next) updateStatus(id, next);
  };

  // ===========================
  // Product actions
  // ===========================
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

  // ===========================
  // Profile actions
  // ===========================
  const handleImageUpload = (file: File, field: "logo" | "coverImage") => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((p: any) => ({ ...p, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    localStorage.setItem(`bebeuja_store_profile_${storeUser.id}`, JSON.stringify(profile));
    // Sync to registered users list
    const stored: any[] = JSON.parse(localStorage.getItem("bebeuja_registered_users") ?? "[]");
    const idx = stored.findIndex((u: any) => u.id === storeUser.id);
    if (idx !== -1) {
      stored[idx] = { ...stored[idx], ...profile };
      localStorage.setItem("bebeuja_registered_users", JSON.stringify(stored));
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const toggleCategory = (catId: string) => {
    setProfile((p: any) => ({
      ...p,
      categories: p.categories.includes(catId)
        ? p.categories.filter((c: string) => c !== catId)
        : [...p.categories, catId],
    }));
  };

  // ===========================
  // Tabs
  // ===========================
  const TABS = [
    { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
    { id: "orders", label: "Pedidos", icon: ShoppingBag, badge: pendingOrders.length },
    { id: "products", label: "Produtos", icon: Package },
    { id: "settings", label: "Perfil", icon: Settings },
  ] as const;

  const displayName = profile.storeName || (storeUser as any).storeName || storeUser.name;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dashboard Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-yellow/20 rounded-lg flex items-center justify-center overflow-hidden">
              {profile.logo ? (
                <img src={profile.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm">🏪</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm leading-none">{displayName}</p>
              <p className="text-xs text-tx-muted">Painel da Adega</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to={`/loja/${storeUser.id}`} target="_blank"
              className="text-xs text-tx-muted hover:text-brand-green transition-colors hidden sm:block">
              Ver loja →
            </Link>
            <button onClick={onLogout} className="flex items-center gap-1.5 text-xs text-tx-muted hover:text-brand-red transition-colors px-3 py-2">
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

              {orders.slice(0, 5).length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-tx-muted">Nenhum pedido ainda</p>
                  <p className="text-xs text-tx-muted mt-1">Seus pedidos aparecerão aqui</p>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold mb-3">Pedidos Recentes</h3>
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
                </div>
              )}
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
                              <X className="w-3 h-3" /> Recusar
                            </button>
                            <button onClick={() => handleAccept(order.id)} className="flex items-center gap-1 text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg font-semibold">
                              <Check className="w-3 h-3" /> Aceitar
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
                  <Plus className="w-4 h-4" /> Adicionar
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
                {products.length === 0 && (
                  <div className="col-span-2 card p-10 text-center">
                    <p className="text-3xl mb-3">🍺</p>
                    <p className="text-tx-muted text-sm">Nenhum produto cadastrado</p>
                    <button onClick={openNewProduct} className="btn-primary mt-4 text-sm py-2 px-4">
                      Adicionar Primeiro Produto
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS / PERFIL COMPLETO */}
          {tab === "settings" && (
            <div className="animate-fade-in space-y-5 max-w-2xl">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">Perfil da Adega</h2>
                <button
                  onClick={saveProfile}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold transition-all
                    ${profileSaved ? "bg-brand-green/20 text-brand-green border border-brand-green/40" : "btn-primary"}`}
                >
                  <Save className="w-4 h-4" />
                  {profileSaved ? "Salvo!" : "Salvar Perfil"}
                </button>
              </div>

              {/* Imagens */}
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <Camera className="w-4 h-4 text-brand-green" /> Imagens
                </h3>

                {/* Capa */}
                <div>
                  <label className="text-xs text-tx-muted mb-2 block">Foto de Capa</label>
                  <div
                    className="relative h-32 rounded-xl overflow-hidden bg-surface-elevated border border-surface-border cursor-pointer group"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {profile.coverImage ? (
                      <img src={profile.coverImage} alt="Capa" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Upload className="w-6 h-6 text-tx-muted" />
                        <p className="text-xs text-tx-muted">Clique para enviar foto de capa</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-white font-medium flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" /> Alterar capa
                      </span>
                    </div>
                  </div>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "coverImage"); }} />
                  <input
                    type="text"
                    placeholder="Ou cole a URL da imagem de capa"
                    value={profile.coverImage?.startsWith("data:") ? "" : (profile.coverImage ?? "")}
                    onChange={(e) => setProfile((p: any) => ({ ...p, coverImage: e.target.value }))}
                    className="input-field text-xs mt-2"
                  />
                </div>

                {/* Logo */}
                <div>
                  <label className="text-xs text-tx-muted mb-2 block">Logo / Avatar</label>
                  <div className="flex items-center gap-4">
                    <div
                      className="relative w-20 h-20 rounded-2xl overflow-hidden bg-surface-elevated border border-surface-border cursor-pointer group shrink-0"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {profile.logo ? (
                        <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Store className="w-8 h-8 text-tx-muted" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "logo"); }} />
                      <input
                        type="text"
                        placeholder="URL do logo (ou clique para enviar)"
                        value={profile.logo?.startsWith("data:") ? "" : (profile.logo ?? "")}
                        onChange={(e) => setProfile((p: any) => ({ ...p, logo: e.target.value }))}
                        className="input-field text-xs"
                      />
                      <p className="text-xs text-tx-muted mt-1.5">Tamanho ideal: 200×200px</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações */}
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <Store className="w-4 h-4 text-brand-green" /> Informações da Adega
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-tx-muted mb-1.5 block">Nome da Adega</label>
                    <input type="text" value={profile.storeName ?? ""}
                      onChange={(e) => setProfile((p: any) => ({ ...p, storeName: e.target.value }))}
                      className="input-field" placeholder="Ex: Adega do Zé" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-tx-muted mb-1.5 block">Descrição</label>
                    <textarea value={profile.description ?? ""}
                      onChange={(e) => setProfile((p: any) => ({ ...p, description: e.target.value }))}
                      className="input-field resize-none h-20 w-full text-sm"
                      placeholder="Descreva sua adega para atrair mais clientes..." />
                  </div>
                  <div>
                    <label className="text-xs text-tx-muted mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Cidade
                    </label>
                    <input type="text" value={profile.city ?? ""}
                      onChange={(e) => setProfile((p: any) => ({ ...p, city: e.target.value }))}
                      className="input-field text-sm" placeholder="São Paulo" />
                  </div>
                  <div>
                    <label className="text-xs text-tx-muted mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Bairro
                    </label>
                    <input type="text" value={profile.neighborhood ?? ""}
                      onChange={(e) => setProfile((p: any) => ({ ...p, neighborhood: e.target.value }))}
                      className="input-field text-sm" placeholder="Vila Mariana" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-tx-muted mb-1.5 block">Telefone / WhatsApp</label>
                    <input type="tel" value={profile.phone ?? ""}
                      onChange={(e) => setProfile((p: any) => ({ ...p, phone: e.target.value }))}
                      className="input-field text-sm" placeholder="(11) 99999-0000" />
                  </div>
                </div>
              </div>

              {/* Categorias */}
              <div className="card p-5 space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-brand-green" /> Categorias Servidas
                </h3>
                <p className="text-xs text-tx-muted">Selecione os tipos de produtos que você oferece</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = (profile.categories ?? []).includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                          ${active
                            ? "bg-brand-green text-white border-brand-green"
                            : "bg-surface-elevated text-tx-secondary border-surface-border hover:border-brand-green/40"}`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horário e Status */}
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-brand-green" /> Horário e Status
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Adega aberta para pedidos</p>
                    <p className="text-xs text-tx-muted">Clientes poderão fazer pedidos agora</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfile((p: any) => ({ ...p, isOpen: !p.isOpen }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${profile.isOpen ? "bg-brand-green" : "bg-surface-elevated border border-surface-border"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${profile.isOpen ? "left-7" : "left-1"}`} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-tx-muted mb-1.5 block">Abertura</label>
                    <input type="time" value={profile.openingHours ?? "10:00"}
                      onChange={(e) => setProfile((p: any) => ({ ...p, openingHours: e.target.value }))}
                      className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-tx-muted mb-1.5 block">Fechamento</label>
                    <input type="time" value={profile.closingHours ?? "22:00"}
                      onChange={(e) => setProfile((p: any) => ({ ...p, closingHours: e.target.value }))}
                      className="input-field text-sm" />
                  </div>
                </div>
              </div>

              {/* Entrega e Valores */}
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-brand-green" /> Entrega e Valores
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-tx-muted mb-1.5 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Taxa de Entrega (R$)
                    </label>
                    <input type="number" step="0.01" min="0" value={profile.deliveryFee ?? "5.90"}
                      onChange={(e) => setProfile((p: any) => ({ ...p, deliveryFee: e.target.value }))}
                      className="input-field text-sm" placeholder="5.90" />
                    <p className="text-xs text-tx-muted mt-1">Use 0 para frete grátis</p>
                  </div>
                  <div>
                    <label className="text-xs text-tx-muted mb-1.5 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Pedido Mínimo (R$)
                    </label>
                    <input type="number" step="0.01" min="0" value={profile.minimumOrder ?? "30"}
                      onChange={(e) => setProfile((p: any) => ({ ...p, minimumOrder: e.target.value }))}
                      className="input-field text-sm" placeholder="30.00" />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="card p-5 border-brand-green/20 space-y-3">
                <h3 className="font-semibold text-brand-green text-sm flex items-center gap-2">
                  👁 Preview — Como aparece no site
                </h3>
                <div className="bg-surface rounded-xl overflow-hidden border border-surface-border">
                  {profile.coverImage && (
                    <div className="h-24 overflow-hidden">
                      <img src={profile.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-3 flex items-center gap-3">
                    {profile.logo ? (
                      <img src={profile.logo} alt="" className="w-10 h-10 rounded-xl object-cover border border-surface-border shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-tx-muted" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{profile.storeName || "Nome da Adega"}</p>
                      <p className="text-xs text-tx-muted truncate">
                        {profile.neighborhood}{profile.city ? `, ${profile.city}` : ""}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-tx-muted mt-0.5">
                        <span>🛵 R$ {parseFloat(profile.deliveryFee || "0").toFixed(2).replace(".", ",")}</span>
                        <span>·</span>
                        <span>Min. R$ {parseFloat(profile.minimumOrder || "0").toFixed(2).replace(".", ",")}</span>
                        <span>·</span>
                        <span className={profile.isOpen ? "text-brand-green font-medium" : "text-brand-red"}>
                          {profile.isOpen ? "● Aberta" : "● Fechada"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Link to={`/loja/${storeUser.id}`} target="_blank"
                  className="text-xs text-brand-green hover:underline flex items-center gap-1">
                  Ver página pública →
                </Link>
              </div>

              {/* Save button */}
              <button onClick={saveProfile}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all
                  ${profileSaved ? "bg-brand-green/20 text-brand-green border border-brand-green/40" : "btn-primary"}`}>
                <Save className="w-4 h-4" />
                {profileSaved ? "✓ Perfil salvo com sucesso!" : "Salvar Todas as Alterações"}
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
