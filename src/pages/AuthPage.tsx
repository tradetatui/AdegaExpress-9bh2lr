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
  const [userType, setUserType] = useState<"customer" | "delivery" | "store">("customer");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", document: "", vehicle: "", businessHours: "" });
  const [error, setError] = useState("");

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setUploadPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (tab === "login") {
      // Verificar usuários registrados no localStorage
      const storedUsers: any[] = JSON.parse(localStorage.getItem("bebeuja_registered_users") || "[]");
      const found = storedUsers.find(u => u.email === form.email);

      if (found) {
        if (found.status === "blocked") {
          setError("Sua conta está bloqueada. Entre em contato com o suporte.");
          return;
        }
        onLogin(found as AuthUser);
        navigate(found.role === "store" ? "/adega" : found.role === "delivery" ? "/entregador" : "/");
        return;
      }

      // Contas demo
      if (form.email === DEMO_ACCOUNTS.customer.email) {
        onLogin(DEMO_ACCOUNTS.customer as AuthUser);
        navigate("/");
        return;
      }
      if (form.email === DEMO_ACCOUNTS.store.email) {
        onLogin(DEMO_ACCOUNTS.store as AuthUser);
        navigate("/adega");
        return;
      }
      if (form.email === DEMO_ACCOUNTS.driver.email) {
        onLogin(DEMO_ACCOUNTS.driver as AuthUser);
        navigate("/entregador");
        return;
      }
      setError("E-mail não encontrado. Faça seu cadastro.");
      return;
    }

    // ========= CADASTRO =========
    const existing: any[] = JSON.parse(localStorage.getItem("bebeuja_registered_users") || "[]");
    if (existing.find((u: any) => u.email === form.email)) {
      setError("Este e-mail já está cadastrado.");
      return;
    }

    const newUser = {
      id: `${userType}-${Date.now()}`,
      name: form.name,
      email: form.email,
      role: userType,
      phone: form.phone,
      document: form.document,
      vehicle: form.vehicle,
      businessHours: form.businessHours,
      documentFileName: uploadedFile ? uploadedFile.name : null,
      documentPreview: uploadPreview || null,
      status: "pending",
      createdAt: new Date().toISOString(),
      // Campos específicos de adega
      ...(userType === "store" && {
        storeName: form.name,
        description: "",
        logo: "",
        coverImage: "",
        rating: 0,
        reviewCount: 0,
        deliveryTime: "30-50 min",
        deliveryFee: 5.90,
        minimumOrder: 30,
        neighborhood: "",
        city: "",
        isOpen: false,
        openingHours: "10:00",
        closingHours: "22:00",
        categories: [],
        featured: false,
      }),
      ...(userType === "delivery" && {
        isOnline: false,
        rating: 0,
        completedDeliveries: 0,
      }),
    };

    // Persistir cadastro
    localStorage.setItem("bebeuja_registered_users", JSON.stringify([...existing, newUser]));

    // Salvar arquivo de documento
    if (uploadedFile) {
      localStorage.setItem(`document_${form.email}`, uploadedFile.name);
      if (uploadPreview) localStorage.setItem(`document_preview_${form.email}`, uploadPreview);
    }

    onLogin(newUser as AuthUser);
    navigate(userType === "store" ? "/adega" : userType === "delivery" ? "/entregador" : "/");
  };

  const getDocumentLabel = () => {
    switch (userType) {
      case "customer": return "Documento de identidade (RG/CNH) para verificação de idade";
      case "delivery": return "CNH (obrigatório para entrega)";
      case "store": return "CNPJ e Alvará de funcionamento";
      default: return "Documento";
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-tx-secondary hover:text-tx-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Home
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
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
                ${tab === t ? "bg-brand-green text-white shadow-sm" : "text-tx-muted hover:text-tx-primary"}`}>
              {t === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {tab === "register" && (
            <>
              <div>
                <label className="text-sm text-tx-secondary block mb-1.5">Você é:</label>
                <select value={userType}
                  onChange={(e) => setUserType(e.target.value as "customer" | "delivery" | "store")}
                  className="input-field">
                  <option value="customer">Cliente</option>
                  <option value="delivery">Entregador / Motoboy</option>
                  <option value="store">Adega (Estabelecimento)</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-tx-secondary block mb-1.5">Nome completo</label>
                <input type="text" required value={form.name} onChange={set("name")} className="input-field" placeholder="Seu nome" />
              </div>

              <div>
                <label className="text-sm text-tx-secondary block mb-1.5">Telefone</label>
                <input type="tel" value={form.phone} onChange={set("phone")} className="input-field" placeholder="(11) 99999-9999" />
              </div>

              <div>
                <label className="text-sm text-tx-secondary block mb-1.5">{getDocumentLabel()}</label>
                <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="input-field" required />
                {uploadPreview && (
                  <img src={uploadPreview} alt="Preview" className="w-20 h-20 object-cover rounded border border-surface-border mt-2" />
                )}
                {uploadedFile && <p className="text-xs text-tx-muted mt-1">📎 {uploadedFile.name}</p>}
                {userType === "customer" && (
                  <p className="text-xs text-brand-yellow mt-1">⚠️ Obrigatório para verificação de maioridade</p>
                )}
              </div>

              {userType === "delivery" && (
                <>
                  <div>
                    <label className="text-sm text-tx-secondary block mb-1.5">Número da CNH</label>
                    <input type="text" value={form.document} onChange={set("document")} className="input-field" placeholder="Número da CNH" />
                  </div>
                  <div>
                    <label className="text-sm text-tx-secondary block mb-1.5">Veículo</label>
                    <input type="text" value={form.vehicle} onChange={set("vehicle")} className="input-field" placeholder="Moto, bicicleta, etc." />
                  </div>
                </>
              )}

              {userType === "store" && (
                <>
                  <div>
                    <label className="text-sm text-tx-secondary block mb-1.5">CNPJ</label>
                    <input type="text" value={form.document} onChange={set("document")} className="input-field" placeholder="00.000.000/0001-00" />
                  </div>
                  <div>
                    <label className="text-sm text-tx-secondary block mb-1.5">Horário de funcionamento</label>
                    <input type="text" value={form.businessHours} onChange={set("businessHours")} className="input-field" placeholder="10h - 22h" />
                  </div>
                </>
              )}

              {userType === "customer" && (
                <div className="bg-brand-green/10 border border-brand-green/30 rounded-lg p-3 text-xs text-tx-secondary">
                  <p>📋 <strong>Verificação de idade:</strong> Seu documento será analisado. Após aprovação, você poderá fazer pedidos.</p>
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-sm text-tx-secondary block mb-1.5">E-mail</label>
            <input type="email" required value={form.email} onChange={set("email")} className="input-field" placeholder="seu@email.com" />
          </div>

          <div>
            <label className="text-sm text-tx-secondary block mb-1.5">Senha</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} required value={form.password}
                onChange={set("password")} className="input-field pr-10" placeholder="••••••••" />
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
          <p className="text-xs text-tx-muted font-medium mb-2">🔑 Acessos de Demonstração</p>
          <div className="space-y-1.5 text-xs text-tx-secondary">
            <p>👤 Cliente: <span className="text-brand-green">cliente@demo.com</span></p>
            <p>🏪 Adega: <Link to="/adega" className="text-brand-yellow hover:underline">Painel da adega</Link> — <span className="text-brand-yellow">adega@demo.com</span></p>
            <p>🛵 Entregador: <Link to="/entregador" className="text-orange-400 hover:underline">Painel do motoboy</Link> — <span className="text-orange-400">motoboy@demo.com</span></p>
            <p>🔐 Admin: <Link to="/admin" className="text-brand-red hover:underline">Painel administrativo</Link></p>
          </div>
          <p className="text-xs text-tx-muted mt-2 border-t border-surface-border pt-2">
            Admin: <span className="text-brand-red">admin@bebeuja.com</span> / <span className="text-brand-red">admin123</span>
          </p>
        </div>
      </div>
    </main>
  );
}
