import React from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Heart,
  Shirt,
  Dumbbell,
  Sparkles,
  Ruler,
  LogIn,
  Settings,
  ShoppingCart,
  X,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";
import { ProductModal } from "@/components/ProductModal";
import {
  CATEGORIES,
  SUBCATEGORIES,
  STORE_NAME,
  STORE_TAGLINE,
  CONDITION_LABELS,
  type Category,
} from "@shared/categories";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const CATEGORY_ICONS: Record<Category, typeof Heart> = {
  Lingerie: Heart,
  Cueca: Shirt,
  Fitness: Dumbbell,
};

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-muted shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4 shimmer" />
        <div className="h-3 bg-muted rounded w-1/2 shimmer" />
        <div className="h-8 bg-muted rounded w-full shimmer mt-3" />
      </div>
    </div>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  const label =
    CONDITION_LABELS[condition as keyof typeof CONDITION_LABELS] ?? condition;
  const map: Record<string, string> = {
    excelente: "bg-rose-100 text-rose-700 border-rose-300",
    bom: "bg-pink-100 text-pink-700 border-pink-300",
    regular: "bg-stone-100 text-stone-700 border-stone-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[condition] ?? map.bom}`}>
      {label}
    </span>
  );
}

type CatalogItem = {
  id: number;
  category?: string;
  model: string;
  storage: string | null;
  color?: string | null;
  itemSubcategory?: string | null;
  brand?: string | null;
  specifications?: string | null;
  condition: string;
  cashPrice: number;
  installmentOptions: Array<{ installments: number; rate: number; total: number; perInstallment: number }>;
  photos: Array<{ id: number; url: string; isPrimary: boolean }>;
};

type CartItem = CatalogItem & { quantity: number };

function ProductCard({ item, onAddToCart }: { item: CatalogItem; onAddToCart: (item: CatalogItem) => void }) {
  const [showAllInstallments, setShowAllInstallments] = React.useState(false);
  const [showProductModal, setShowProductModal] = React.useState(false);
  const primaryPhoto = item.photos.find(p => p.isPrimary) ?? item.photos[0];
  const installment12x = item.installmentOptions.find(opt => opt.installments === 12);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
      >
        <div
          className="relative w-full aspect-[3/4] bg-muted overflow-hidden cursor-pointer"
          onClick={() => setShowProductModal(true)}
        >
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={item.model}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Shirt className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}
          {item.itemSubcategory && (
            <span className="absolute top-2 left-2 bg-background/90 text-foreground text-[10px] font-medium px-2 py-0.5 rounded-full border border-border">
              {item.itemSubcategory}
            </span>
          )}
        </div>

        <div className="p-3 space-y-2">
          <div>
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">{item.model}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {[item.storage, item.color].filter(Boolean).join(" · ") || item.category}
            </p>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <ConditionBadge condition={item.condition} />
            {item.brand && (
              <span className="text-[10px] text-muted-foreground">{item.brand}</span>
            )}
          </div>

          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">À vista</p>
            <p className="font-bold text-base text-foreground">{formatCurrency(item.cashPrice)}</p>
          </div>

          {installment12x && (
            <div className="bg-rose-50 border border-rose-200 rounded p-1.5">
              <p className="text-[10px] text-rose-600 font-medium">12x de</p>
              <p className="font-bold text-xs text-rose-700">{formatCurrency(installment12x.perInstallment)}</p>
            </div>
          )}

          <div className="flex gap-1.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => setShowAllInstallments(true)}
            >
              Parcelas
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90 text-xs h-8"
              onClick={() => {
                onAddToCart(item);
                toast.success(`${item.model} adicionado!`);
              }}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={showAllInstallments} onOpenChange={setShowAllInstallments}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {item.model} — Parcelamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {item.installmentOptions.sort((a, b) => a.installments - b.installments).map((opt, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  opt.installments === 12
                    ? "bg-rose-50 border-rose-300 ring-1 ring-rose-300"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {opt.installments === 0 ? "Débito" : `${opt.installments}x`}
                  </span>
                  <span className="text-xs text-muted-foreground">({opt.rate}%)</span>
                  {opt.installments === 12 && (
                    <span className="text-xs bg-rose-200 text-rose-700 px-2 py-0.5 rounded-full font-medium">Destaque</span>
                  )}
                </div>
                <span className={`font-bold ${opt.installments === 12 ? "text-rose-700" : "text-primary"}`}>
                  {formatCurrency(opt.perInstallment)}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ProductModal
        product={item}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
}

function CartDrawer({
  items,
  onRemove,
  onCheckout,
  isOpen,
  onClose,
}: {
  items: CartItem[];
  onRemove: (id: number) => void;
  onCheckout: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const total = items.reduce((sum, item) => sum + item.cashPrice * item.quantity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Carrinho de Compras</DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Seu carrinho está vazio</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{item.model}</p>
                    <p className="text-xs text-muted-foreground">
                      {[item.itemSubcategory, item.storage].filter(Boolean).join(" · ")} · Qtd: {item.quantity}
                    </p>
                    <p className="font-bold text-primary text-sm mt-1">
                      {formatCurrency(item.cashPrice * item.quantity)}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-foreground">Total (à vista):</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
              </div>
              <Button size="sm" className="w-full bg-primary hover:bg-primary/90" onClick={onCheckout}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Finalizar Compra
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const { user } = useAuth();
  const loginUrl = useMemo(() => getLoginUrl(), []);
  const isLoginAvailable = loginUrl !== "#";
  const handleLoginClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (!isLoginAvailable) {
        toast.error("Login indisponível no momento. Verifique a configuração OAuth.");
        return;
      }
      try {
        const loginOrigin = new URL(loginUrl).origin;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        await fetch(loginOrigin, { method: "GET", mode: "no-cors", signal: controller.signal });
        clearTimeout(timeout);
        window.location.href = loginUrl;
      } catch {
        toast.error("Servidor de login indisponível no momento. Tente novamente mais tarde.");
      }
    },
    [isLoginAvailable, loginUrl]
  );

  const { data: items, isLoading } = trpc.catalog.list.useQuery();
  const [filterName, setFilterName] = useState<string>("all");
  const [filterSize, setFilterSize] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSubcategory, setFilterSubcategory] = useState<string>("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction === "left" ? -250 : 250,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  const productNames = useMemo(() => {
    if (!items) return [];
    return Array.from(new Set(items.map(i => i.model).filter(Boolean))).sort() as string[];
  }, [items]);

  const sizes = useMemo(() => {
    if (!items) return [];
    return Array.from(new Set(items.map(i => i.storage).filter(Boolean))).sort() as string[];
  }, [items]);

  const activeSubcategories = useMemo(() => {
    if (filterCategory === "all" || !CATEGORIES.includes(filterCategory as Category)) return [];
    return SUBCATEGORIES[filterCategory as Category];
  }, [filterCategory]);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter(
      i =>
        (filterName === "all" || i.model === filterName) &&
        (filterSize === "all" || i.storage === filterSize) &&
        (filterCategory === "all" || i.category === filterCategory) &&
        (filterSubcategory === "all" || i.itemSubcategory === filterSubcategory)
    );
  }, [items, filterName, filterSize, filterCategory, filterSubcategory]);

  const handleCategorySelect = (label: string) => {
    const next = filterCategory === label ? "all" : label;
    setFilterCategory(next);
    setFilterSubcategory("all");
  };

  const handleAddToCart = (item: CatalogItem) => {
    setCartItems(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev => prev.filter(c => c.id !== id));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    const total = cartItems.reduce((sum, item) => sum + item.cashPrice * item.quantity, 0);
    const itemsList = cartItems
      .map(
        item =>
          `${item.model} ${item.itemSubcategory ?? ""} ${item.storage ?? ""} (Qtd: ${item.quantity}) - ${formatCurrency(item.cashPrice * item.quantity)}`
      )
      .join("%0A");
    const message = `Olá! Gostaria de fazer uma compra:%0A%0A${itemsList}%0A%0ATotal: ${formatCurrency(total)}`;
    window.open(`https://wa.me/5535998782791?text=${message}`, "_blank");
    setCartItems([]);
    setShowCart(false);
    toast.success("Redirecionando para WhatsApp...");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="font-bold text-foreground text-sm">{STORE_NAME}</span>
                <span className="font-light text-muted-foreground text-xs block">{STORE_TAGLINE}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItems.length}
                  </span>
                )}
              </button>
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Painel Admin</span>
                  </Button>
                </Link>
              )}
              {!user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                  onClick={handleLoginClick}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/80 to-background border-b border-border">
        <div className="container relative py-14 md:py-20">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4 max-w-2xl"
            >
              <p className="text-sm font-medium text-primary tracking-widest uppercase">Nova coleção</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Moda íntima & fitness com estilo
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Lingerie, cuecas e peças fitness selecionadas para você se sentir bem e confiante.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 pt-2"
            >
              {[
                { icon: Sparkles, label: "Qualidade premium" },
                { icon: Ruler, label: "Variedade de tamanhos" },
                { icon: MessageCircle, label: "Compra pelo WhatsApp" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card/50">
        <div className="container">
          <div className="flex items-center gap-2 py-4">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex-shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={carouselRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
              onScroll={checkScroll}
              onTouchEnd={checkScroll}
            >
              {CATEGORIES.map(label => {
                const Icon = CATEGORY_ICONS[label];
                return (
                  <button
                    key={label}
                    onClick={() => handleCategorySelect(label)}
                    className={`flex flex-col items-center gap-2 px-5 py-3 rounded-xl transition-all whitespace-nowrap text-sm font-medium flex-shrink-0 ${
                      filterCategory === label
                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex-shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {activeSubcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-4">
              <button
                onClick={() => setFilterSubcategory("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filterSubcategory === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                Todos
              </button>
              {activeSubcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setFilterSubcategory(sub)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filterSubcategory === sub
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          {!isLoading && items && items.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8 pt-8">
              <Select value={filterName} onValueChange={setFilterName}>
                <SelectTrigger className="w-44 bg-card border-border">
                  <SelectValue placeholder="Produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {productNames.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterSize} onValueChange={setFilterSize}>
                <SelectTrigger className="w-36 bg-card border-border">
                  <SelectValue placeholder="Tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tamanhos</SelectItem>
                  {sizes.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(filterName !== "all" || filterSize !== "all" || filterSubcategory !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterName("all");
                    setFilterSize("all");
                    setFilterSubcategory("all");
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pt-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-24">
              <Shirt className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum produto disponível</h3>
              <p className="text-muted-foreground">
                {items && items.length > 0
                  ? "Nenhum produto corresponde aos filtros selecionados."
                  : "Em breve novas peças disponíveis na loja."}
              </p>
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pt-8">
              {filtered.map(item => (
                <ProductCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CartDrawer
        items={cartItems}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
        isOpen={showCart}
        onClose={() => setShowCart(false)}
      />
    </div>
  );
}
