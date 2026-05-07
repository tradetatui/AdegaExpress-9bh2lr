import { useState, useMemo, useEffect } from "react";
import { Search, Zap, Shield, Star } from "lucide-react";
import StoreCard from "@/components/features/StoreCard";
import { CATEGORIES } from "@/constants/mockData";
import heroBanner from "@/assets/hero-banner.jpg";
import catBeer from "@/assets/category-beer.jpg";
import catWhisky from "@/assets/category-whisky.jpg";
import catEnergy from "@/assets/category-energy.jpg";

const CATEGORY_IMAGES: Record<string, string> = {
  cerveja: catBeer,
  whisky: catWhisky,
  energetico: catEnergy,
};

export default function LandingPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stores')
      .then(res => res.json())
      .then(data => {
        const mappedStores = data.map(store => ({
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
        setStores(mappedStores);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro:', err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let filteredStores = stores;
    if (activeCategory) {
      filteredStores = filteredStores.filter(s => s.categories.includes(activeCategory));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filteredStores = filteredStores.filter(s =>
        s.storeName.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
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
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img src={heroBanner} alt="BebeuJá" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/70 to-transparent" />
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

        <section className="py-6">
          <h2 className="font-display font-bold text-lg mb-4">Categorias</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${!activeCategory ? "bg-brand-green text-white" : "bg-gray-100"}`}
            >
              🍾 Todos
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${activeCategory === cat.id ? "bg-brand-green text-white" : "bg-gray-100"}`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Adegas Próximas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
