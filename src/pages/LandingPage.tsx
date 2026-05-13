import { useState, useMemo, useEffect } from "react";
import { Search, Zap, Shield, Star } from "lucide-react";
import StoreCard from "@/components/features/StoreCard";
import { CATEGORIES, MOCK_STORES as MOCK_STORES_FALLBACK } from "@/constants/mockData";
import heroBanner from "@/assets/hero-banner.jpg";
import catBeer from "@/assets/category-beer.jpg";
import catWhisky from "@/assets/category-whisky.jpg";
import catEnergy from "@/assets/category-energy.jpg";

export default function LandingPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta carregar lojas da API
    fetch('/api/stores')
      .then(res => res.json())
      .then(data => {
        const mappedStores = data.map((store: any) => ({
          id: store.id,
          storeName: store.store_name,
          description: store.description,
          phone: store.phone,
          email: store.email,
          city: store.city,
          address: store.address,
          coverImage: store.cover_image || "https://placehold.co/400x200?text=Loja",
          logo: store.logo || "https://placehold.co/100x100?text=Logo",
          categories: store.categories ? store.categories.split(',') : [],
          isOpen: store.is_open === 1,
          deliveryFee: parseFloat(store.delivery_fee),
          minimumOrder: parseFloat(store.minimum_order),
          rating: parseFloat(store.rating),
          reviewCount: store.review_count,
          deliveryTime: "30-40 min",
          neighborhood: store.city,
          featured: false
        }));
        setStores(mergeWithLocalProfiles(mappedStores));
        setLoading(false);
      })
      .catch(() => {
        // Fallback: dados mock + lojas registradas no localStorage
        const registeredUsers: any[] = JSON.parse(localStorage.getItem("bebeuja_registered_users") ?? "[]");
        const registeredStores = registeredUsers
          .filter(u => u.role === "store")
          .map(u => {
            const savedProfile = (() => {
              const p = localStorage.getItem(`bebeuja_store_profile_${u.id}`);
              if (p) { try { return JSON.parse(p); } catch {} }
              return {};
            })();
            const merged = { ...u, ...savedProfile };
            return {
              id: merged.id,
              storeName: merged.storeName || merged.name,
              description: merged.description || "",
              email: merged.email,
              phone: merged.phone || "",
              city: merged.city || "",
              neighborhood: merged.neighborhood || "",
              coverImage: merged.coverImage || "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800&h=300&fit=crop",
              logo: merged.logo || "",
              categories: merged.categories || [],
              isOpen: merged.isOpen ?? false,
              deliveryFee: parseFloat(merged.deliveryFee ?? "5.90"),
              minimumOrder: parseFloat(merged.minimumOrder ?? "30"),
              rating: merged.rating ?? 0,
              reviewCount: merged.reviewCount ?? 0,
              deliveryTime: "30-50 min",
              featured: false,
            };
          });
        const allStores = [...MOCK_STORES_FALLBACK, ...registeredStores];
        setStores(mergeWithLocalProfiles(allStores));
        setLoading(false);
      });
  }, []);

  // Mescla perfis salvos do localStorage sobre os dados das lojas
  const mergeWithLocalProfiles = (storeList: any[]) => {
    return storeList.map(s => {
      const savedProfile = (() => {
        const p = localStorage.getItem(`bebeuja_store_profile_${s.id}`);
        if (p) { try { return JSON.parse(p); } catch {} }
        return null;
      })();
      if (!savedProfile) return s;
      return {
        ...s,
        storeName: savedProfile.storeName || s.storeName,
        description: savedProfile.description || s.description,
        city: savedProfile.city || s.city,
        neighborhood: savedProfile.neighborhood || s.neighborhood,
        coverImage: savedProfile.coverImage || s.coverImage,
        logo: savedProfile.logo || s.logo,
        categories: savedProfile.categories?.length ? savedProfile.categories : s.categories,
        isOpen: savedProfile.isOpen ?? s.isOpen,
        deliveryFee: parseFloat(savedProfile.deliveryFee ?? String(s.deliveryFee)),
        minimumOrder: parseFloat(savedProfile.minimumOrder ?? String(s.minimumOrder)),
      };
    });
  };

  const filtered = useMemo(() => {
    let filteredStores = stores;
    if (activeCategory) {
      filteredStores = filteredStores.filter(s => s.categories?.includes(activeCategory));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filteredStores = filteredStores.filter(s =>
        s.storeName?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q)
      );
    }
    return filteredStores;
  }, [search, activeCategory, stores]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tx-secondary">Carregando adegas...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img src={heroBanner} alt="BebeuJá" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 max-w-7xl mx-auto">
          <div className="max-w-lg">
            <p className="text-brand-green text-sm font-semibold tracking-widest uppercase mb-2">
              ⚡ Entrega em até 40 min
            </p>
            <h1 className="font-display font-bold text-3xl md:text-5xl text-tx-primary leading-tight">
              Bebidas geladas<br />
              <span className="neon-text">na sua porta</span>
            </h1>
            <p className="text-tx-secondary mt-3 md:text-lg">
              As melhores adegas da cidade com entrega rápida.
            </p>
            <div className="relative mt-6 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-muted" />
              <input
                type="text"
                placeholder="Buscar adega ou bairro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-11 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 py-6 border-b border-surface-border">
          {[
            { icon: <Zap className="w-5 h-5 text-brand-green" />, label: "Entrega Rápida", sub: "Em até 40min" },
            { icon: <Shield className="w-5 h-5 text-brand-yellow" />, label: "100% Seguro", sub: "Pagamento Pix" },
            { icon: <Star className="w-5 h-5 text-brand-yellow fill-brand-yellow" />, label: "Avaliados", sub: "+1200 reviews" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center gap-1">
              {stat.icon}
              <p className="text-sm font-semibold text-tx-primary hidden sm:block">{stat.label}</p>
              <p className="text-xs text-tx-muted">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Categories - BOTÕES DE CATEGORIA */}
        <section className="py-6">
          <h2 className="font-display font-bold text-lg mb-4">Categorias</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all
                ${!activeCategory
                  ? "bg-brand-green text-white border-brand-green"
                  : "bg-surface-elevated text-tx-secondary border-surface-border hover:border-brand-green/40"}`}
            >
              🍾 Todos
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all
                  ${activeCategory === cat.id
                    ? "bg-brand-green text-white border-brand-green"
                    : "bg-surface-elevated text-tx-secondary border-surface-border hover:border-brand-green/40"}`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Featured category cards - GRADE "MAIS PEDIDOS" */}
        {!activeCategory && !search && (
          <section className="mb-8">
            <h2 className="font-display font-bold text-lg mb-4">Mais Pedidos</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "cerveja", label: "Cervejas", img: catBeer },
                { key: "whisky", label: "Whiskys", img: catWhisky },
                { key: "energetico", label: "Energéticos", img: catEnergy },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveCategory(item.key)}
                  className="relative h-28 rounded-2xl overflow-hidden group"
                >
                  <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-2 left-0 right-0 text-center text-sm font-semibold text-white">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Stores - GRADE DE LOJAS */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">
              {activeCategory
                ? `Adegas com ${CATEGORIES.find((c) => c.id === activeCategory)?.label}`
                : search ? "Resultados" : "Adegas Próximas"}
            </h2>
            <span className="text-sm text-tx-muted">{filtered.length} encontradas</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-semibold text-tx-secondary">Nenhuma adega encontrada</p>
              <p className="text-sm text-tx-muted mt-1">Tente outro bairro ou categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
