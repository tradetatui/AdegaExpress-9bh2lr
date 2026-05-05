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
  
  // Estados para upload de documento
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Função para upload de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

    // Register: create new user based on type
    const newUser: AuthUser = {
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
    } as AuthUser;
    
    // Salvar documento no localStorage (versão demo)
    if (uploadedFile) {
      localStorage.setItem(`document_${form.email}`, uploadedFile.name);
      localStorage.setItem(`document_preview_${form.email}`, uploadPreview);
    }
    
    onLogin(newUser);
    navigate("/");
  };

  // Função para retornar o label do documento baseado no tipo
  const getDocumentLabel = () => {
    switch(userType) {
      case "customer":
        return "Documento de identidade (RG/CNH) para verificação de idade";
      case "delivery":
        return "CNH (obrigatório para entrega)";
      case "store":
        return "CNPJ e Alvará de funcionamento";
      default:
        return "Documento";
    }
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
              {/* Tipo de usuário */}
              <div>
                <label className="text-sm text-tx-secondary block mb-1.5">Você é:</label>
                <select 
                  value={userType} 
                  onChange={(e) => setUserType(e.target.value as "customer" | "delivery" | "store")}
                  className="input-field"
                >
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

              {/* Upload de documento para TODOS os tipos */}
              <div>
                <label className="text-sm text-tx-secondary block mb-1.5">{getDocumentLabel()}</label>
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  onChange={handleFileUpload} 
                  className="input-field" 
                  required 
                />
                {uploadPreview && (
                  <div className="mt-2">
                    <img src={uploadPreview} alt="Preview do documento" className="w-20 h-20 object-cover rounded border border-surface-border" />
                  </div>
                )}
                {uploadedFile && (
                  <p className="text-xs text-tx-muted mt-1">Arquivo: {uploadedFile.name}</p>
                )}
                {userType === "customer" && (
                  <p className="text-xs text-brand-yellow mt-1">⚠️ Documento obrigatório para verificação de maioridade</p>
                )}
              </div>

              {/* Campos específicos por tipo */}
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
                    <input type="text" value={form.businessHours} onChange={set("businessHours")} className="input-field" placeholder="Seg-Sex: 10h-22h, Sáb: 12h-20h" />
                  </div>
                </>
              )}

              {/* Para cliente, apenas o documento já foi pedido acima */}
              {userType === "customer" && (
                <div className="bg-brand-green/10 border border-brand-green/30 rounded-lg p-3 text-xs text-tx-secondary">
                  <p>📋 Verificação de idade:</p>
                  <p className="mt-1">Enviamos seu documento para análise. Após aprovado, você poderá fazer pedidos.</p>
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
