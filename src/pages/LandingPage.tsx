import { useState, useMemo } from "react";
import { Search, Zap, Shield, Star } from "lucide-react";
import StoreCard from "@/components/features/StoreCard";
import { MOCK_STORES, CATEGORIES } from "@/constants/mockData";
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let stores = MOCK_STORES;
    if (activeCategory) {
      stores = stores.filter((s) => s.categories.includes(activeCategory));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      stores = stores.filter(
        (s) => s.storeName.toLowerCase().includes(q) || s.neighborhood.toLowerCase().includes(q)
      );
    }
    return stores;
  }, [search, activeCategory]);

  const featured = MOCK_STORES.filter((s) => s.featured);

  return (
    <main className="min-h-screen">
      {/* Hero */}
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

            {/* Search bar */}
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

        {/* Categories */}
        <section className="py-6">
          <h2 className="font-display font-bold text-lg mb-4">Categorias</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all
                ${!activeCategory
                  ? "bg-brand-green text-surface border-brand-green"
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
                    ? "bg-brand-green text-surface border-brand-green"
                    : "bg-surface-elevated text-tx-secondary border-surface-border hover:border-brand-green/40"}`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Featured category cards */}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
                  <span className="absolute bottom-2 left-0 right-0 text-center text-sm font-semibold text-tx-primary">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Stores */}
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
