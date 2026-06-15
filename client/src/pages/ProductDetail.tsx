import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shirt, ChevronLeft, ChevronRight, Heart, Dumbbell, Ruler, Palette, Tag } from "lucide-react";
import { CONDITION_LABELS, type Category } from "@shared/categories";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "Lingerie": return <Heart className="w-3 h-3 text-primary-foreground" />;
    case "Cueca": return <Shirt className="w-3 h-3 text-primary-foreground" />;
    case "Fitness": return <Dumbbell className="w-3 h-3 text-primary-foreground" />;
    default: return <Shirt className="w-3 h-3 text-primary-foreground" />;
  }
}

export default function ProductDetail() {
  const [, params] = useRoute("/produto/:id");
  const id = parseInt(params?.id ?? "0");
  const [photoIdx, setPhotoIdx] = useState(0);

  const { data: item, isLoading } = trpc.catalog.getById.useQuery({ id }, { enabled: !!id });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Shirt className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">Produto não encontrado</h2>
        <Link href="/"><Button variant="outline">Voltar ao catálogo</Button></Link>
      </div>
    );
  }

  const photos = item.photos;
  const currentPhoto = photos[photoIdx];
  const conditionLabel =
    CONDITION_LABELS[item.condition as keyof typeof CONDITION_LABELS] ?? item.condition;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container">
          <div className="flex items-center h-16 gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                {getCategoryIcon(item.category as string)}
              </div>
              <span className="font-semibold text-sm text-foreground">
                {item.model} {item.storage ? `· ${item.storage}` : ""}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="rounded-2xl overflow-hidden border border-border bg-card aspect-[3/4] relative">
              {currentPhoto ? (
                <img src={currentPhoto.url} alt={item.model} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Shirt className="w-24 h-24 text-muted-foreground/20" />
                </div>
              )}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setPhotoIdx(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${i === photoIdx ? "border-primary" : "border-border opacity-60 hover:opacity-100"}`}
                  >
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{item.model}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {item.itemSubcategory && <Badge variant="secondary" className="text-sm">{item.itemSubcategory}</Badge>}
                {item.storage && <Badge variant="secondary" className="text-sm">{item.storage}</Badge>}
                {item.brand && <Badge variant="outline" className="text-sm">{item.brand}</Badge>}
                {item.color && <span className="text-sm text-muted-foreground">{item.color}</span>}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-rose-100 text-rose-700 border-rose-300">
                  {conditionLabel}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Detalhes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.category && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Categoria</p>
                      <p className="font-semibold text-foreground">{item.category as Category}</p>
                    </div>
                  </div>
                )}
                {item.storage && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Ruler className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tamanho</p>
                      <p className="font-semibold text-foreground">{item.storage}</p>
                    </div>
                  </div>
                )}
                {item.color && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Palette className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cor</p>
                      <p className="font-semibold text-foreground">{item.color}</p>
                    </div>
                  </div>
                )}
              </div>

              {item.specifications && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Material / Detalhes</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{item.specifications}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Preço à vista</p>
                  <p className="text-4xl font-bold text-primary">{formatCurrency(item.cashPrice)}</p>
                </div>
              </div>

              {item.installmentOptions.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Opções de parcelamento</p>
                  <div className="space-y-2">
                    {item.installmentOptions
                      .sort((a, b) => a.installments - b.installments)
                      .map(opt => (
                        <div key={opt.installments} className="flex items-center justify-between py-2 px-3 rounded-lg bg-card border border-border">
                          <span className="text-sm font-medium text-foreground">{opt.installments}x de</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-foreground">{formatCurrency(opt.perInstallment)}</span>
                            <span className="text-xs text-muted-foreground ml-2">({formatCurrency(opt.total)} total)</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
