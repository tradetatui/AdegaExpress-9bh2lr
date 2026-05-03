import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/layout/Header";
import CartDrawer from "@/components/features/CartDrawer";
import LandingPage from "@/pages/LandingPage";
import StorePage from "@/pages/StorePage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderTrackingPage from "@/pages/OrderTrackingPage";
import MyOrdersPage from "@/pages/MyOrdersPage";
import AuthPage from "@/pages/AuthPage";
import StoreDashboard from "@/pages/StoreDashboard";
import DriverPanel from "@/pages/DriverPanel";
import NotFound from "@/pages/NotFound";

// =====================
// App principal
// =====================
export default function App() {
  const { user, loading, login, logout } = useAuth();
  const cart = useCart();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
          <p className="text-tx-muted text-sm">Carregando BebeuJá...</p>
        </div>
      </div>
    );
  }

  // Dashboards separados sem header padrão
  const isDashboard = typeof window !== "undefined" && (
    window.location.pathname.startsWith("/adega") ||
    window.location.pathname.startsWith("/entregador")
  );

  return (
    <BrowserRouter>
      <AppContent
        user={user}
        login={login}
        logout={logout}
        cart={cart}
      />
    </BrowserRouter>
  );
}

function AppContent({ user, login, logout, cart }: {
  user: ReturnType<typeof useAuth>["user"];
  login: ReturnType<typeof useAuth>["login"];
  logout: ReturnType<typeof useAuth>["logout"];
  cart: ReturnType<typeof useCart>;
}) {
  const { pathname } = window.location;
  const showHeader = !pathname.startsWith("/adega") && !pathname.startsWith("/entregador");

  return (
    <>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: { background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#F9FAFB" },
        }}
      />

      <Routes>
        {/* Store Dashboard - sem header padrão */}
        <Route
          path="/adega/*"
          element={
            <StoreDashboard user={user} onLogin={login} onLogout={logout} />
          }
        />

        {/* Driver Panel - sem header padrão */}
        <Route
          path="/entregador"
          element={
            <DriverPanel user={user} onLogin={login} onLogout={logout} />
          }
        />

        {/* Customer routes - com header */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen flex flex-col">
              <Header
                user={user}
                cartCount={cart.itemCount}
                onCartClick={() => cart.setIsOpen(true)}
                onLogout={logout}
              />

              <CartDrawer
                isOpen={cart.isOpen}
                onClose={() => cart.setIsOpen(false)}
                items={cart.items}
                total={cart.total}
                storeId={cart.storeId}
                onUpdateQuantity={cart.updateQuantity}
                onRemove={cart.removeItem}
                onClear={cart.clearCart}
              />

              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/loja/:id"
                  element={
                    <StorePage
                      cartItems={cart.items}
                      onAddToCart={cart.addItem}
                      onRemoveFromCart={cart.removeItem}
                      onOpenCart={() => cart.setIsOpen(true)}
                    />
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <CheckoutPage
                      cartItems={cart.items}
                      cartTotal={cart.total}
                      storeId={cart.storeId}
                      user={user}
                      onClearCart={cart.clearCart}
                    />
                  }
                />
                <Route path="/pedido/:id" element={<OrderTrackingPage />} />
                <Route path="/meus-pedidos" element={<MyOrdersPage user={user} />} />
                <Route
                  path="/entrar"
                  element={<AuthPage onLogin={login} />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          }
        />
      </Routes>
    </>
  );
}
