import { ShoppingCart, MapPin, User, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { AuthUser } from "@/hooks/useAuth";

interface HeaderProps {
  user: AuthUser | null;
  cartCount?: number;
  onCartClick?: () => void;
  onLogout: () => void;
}

export default function Header({ user, cartCount = 0, onCartClick, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">BJ</span>
          </div>
          <span className="font-display font-bold text-lg text-tx-primary hidden sm:block">
            Bebeu<span className="neon-text">Já</span>
          </span>
        </Link>

        {/* Location */}
        <button className="hidden md:flex items-center gap-1.5 text-tx-secondary hover:text-tx-primary transition-colors text-sm">
          <MapPin className="w-4 h-4 text-brand-green" />
          <span>São Paulo, SP</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Cart */}
          {user?.role === "customer" && onCartClick && (
            <button
              onClick={onCartClick}
              className="relative flex items-center gap-2 btn-secondary text-sm py-2 px-3"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:block">Carrinho</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-green text-surface text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:bg-surface-elevated px-3 py-2 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 bg-brand-green/20 border border-brand-green/30 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-brand-green" />
                </div>
                <span className="text-sm text-tx-primary hidden sm:block">{user.name.split(" ")[0]}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 card w-52 py-2 shadow-xl z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-surface-border">
                    <p className="text-sm font-medium text-tx-primary">{user.name}</p>
                    <p className="text-xs text-tx-muted">{user.email}</p>
                  </div>
                  {user.role === "customer" && (
                    <Link to="/meus-pedidos" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-tx-secondary hover:text-tx-primary hover:bg-surface-elevated transition-colors">
                      Meus Pedidos
                    </Link>
                  )}
                  {(user as any).role === "admin" && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-brand-red hover:bg-brand-red/10 transition-colors">
                      🔐 Painel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-red hover:bg-brand-red/10 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/entrar" className="btn-secondary text-sm py-2 px-4">Entrar</Link>
              <Link to="/entrar?tab=register" className="btn-primary text-sm py-2 px-4 hidden sm:block">Cadastrar</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
