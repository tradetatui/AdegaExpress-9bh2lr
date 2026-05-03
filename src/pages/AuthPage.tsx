import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import type { AuthUser } from "@/hooks/useAuth";
import { DEMO_ACCOUNTS } from "@/hooks/useAuth";

interface AuthPageProps {
  onLogin: (user: AuthUser) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">(
    params.get("tab") === "register" ? "register" : "login"
  );
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (tab === "login") {
      // Demo login check
      if (form.email === DEMO_ACCOUNTS.customer.email) {
        onLogin(DEMO_ACCOUNTS.customer as AuthUser);
        navigate("/");
        return;
      }
      setError("E-mail ou senha inválidos. Use: cliente@demo.com");
      return;
    }

    // Register: create new customer
    const newUser: AuthUser = {
      id: `cust-${Date.now()}`,
      name: form.name,
      email: form.email,
      role: "customer",
      phone: form.phone,
    } as AuthUser;
    onLogin(newUser);
    navigate("/");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-tx-secondary hover:text-tx-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Voltar para Home
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-green/20 border border-brand-green/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-bold text-2xl text-brand-green">BJ</span>
          </div>
          <h1 className="font-display font-bold text-2xl">BebeuJá</h1>
          <p className="text-tx-muted text-sm mt-1">Bebidas geladas na sua porta</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-elevated rounded-xl p-1 mb-6 border border-surface-border">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
                ${tab === t ? "bg-brand-green text-surface shadow-sm" : "text-tx-muted hover:text-tx-primary"}`}
            >
              {t === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {tab === "register" && (
            <>
              <div>
                <label className="text-sm text-tx-secondary block mb-1.5">Nome completo</label>
                <input type="text" required value={form.name} onChange={set("name")} className="input-field" placeholder="Seu nome" />
              </div>
              <div>
                <label className="text-sm text-tx-secondary block mb-1.5">Telefone</label>
                <input type="tel" value={form.phone} onChange={set("phone")} className="input-field" placeholder="(11) 99999-9999" />
              </div>
            </>
          )}

          <div>
            <label className="text-sm text-tx-secondary block mb-1.5">E-mail</label>
            <input type="email" required value={form.email} onChange={set("email")} className="input-field" placeholder="seu@email.com" />
          </div>

          <div>
            <label className="text-sm text-tx-secondary block mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={form.password}
                onChange={set("password")}
                className="input-field pr-10"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-primary transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3 text-base">
            {tab === "login" ? "Entrar" : "Criar Conta"}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="card p-4 mt-4 border-brand-green/20">
          <p className="text-xs text-tx-muted font-medium mb-2">🔑 Acesso Demo</p>
          <div className="space-y-1 text-xs text-tx-secondary">
            <p>👤 Cliente: <span className="text-brand-green">cliente@demo.com</span></p>
            <p>🏪 Adega: <Link to="/adega/entrar" className="text-brand-yellow hover:underline">Acesse o painel da adega</Link></p>
            <p>🛵 Entregador: <Link to="/entregador" className="text-orange-400 hover:underline">Acesse o painel do motoboy</Link></p>
          </div>
          <p className="text-xs text-tx-muted mt-2">Qualquer senha funciona</p>
        </div>
      </div>
    </main>
  );
}
