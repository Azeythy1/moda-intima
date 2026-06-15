import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, Shirt, Heart, Dumbbell, DollarSign } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card animate-pulse">
      <div className="w-16 h-16 rounded-lg bg-muted shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-1/3 shimmer" />
        <div className="h-3 bg-muted rounded w-1/4 shimmer" />
      </div>
      <div className="h-6 w-20 bg-muted rounded shimmer" />
    </div>
  );
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "Lingerie": return <Heart className="w-4 h-4" />;
    case "Cueca": return <Shirt className="w-4 h-4" />;
    case "Fitness": return <Dumbbell className="w-4 h-4" />;
    default: return <Shirt className="w-4 h-4" />;
  }
}

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.admin.listIphones.useQuery();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const deleteMutation = trpc.admin.deleteIphone.useMutation({
    onSuccess: () => {
      toast.success("Produto excluído com sucesso");
      utils.admin.listIphones.invalidate();
      setDeleteId(null);
    },
    onError: () => toast.error("Erro ao excluir produto"),
  });

  const toggleStatusMutation = trpc.admin.updateIphone.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado");
      utils.admin.listIphones.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie o catálogo de moda</p>
        </div>
        <Link href="/admin/produtos/novo">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {!isLoading && products && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: products.length, icon: Shirt },
            { label: "Publicados", value: products.filter(p => p.status === "published").length, icon: Eye },
            { label: "Rascunhos", value: products.filter(p => p.status === "draft").length, icon: EyeOff },
            { label: "Com fotos", value: products.filter(p => p.photos.length > 0).length, icon: DollarSign },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {!isLoading && (!products || products.length === 0) && (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border">
          <Shirt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Nenhum produto cadastrado</h3>
          <p className="text-muted-foreground text-sm mb-6">Adicione seu primeiro produto ao catálogo.</p>
          <Link href="/admin/produtos/novo">
            <Button className="gap-2"><Plus className="w-4 h-4" />Adicionar produto</Button>
          </Link>
        </div>
      )}

      {!isLoading && products && products.length > 0 && (
        <div className="space-y-3">
          {products.map((product, idx) => {
            const primaryPhoto = product.photos.find(p => p.isPrimary) ?? product.photos[0];
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                {/* Photo */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {primaryPhoto ? (
                    <img src={primaryPhoto.url} alt={product.model} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shirt className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="text-muted-foreground/60">
                        {getCategoryIcon(product.category as string)}
                      </div>
                      <h3 className="font-semibold text-foreground">{product.model}</h3>
                    </div>
                    {product.itemSubcategory && <Badge variant="outline" className="text-xs">{product.itemSubcategory}</Badge>}
                    {product.storage && <Badge variant="secondary" className="text-xs">{product.storage}</Badge>}
                    {product.brand && <Badge variant="outline" className="text-xs">{product.brand}</Badge>}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      product.status === "published"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {product.status === "published" ? "Publicado" : "Rascunho"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                    <span className="text-muted-foreground/60">Custo: {formatCurrency(product.costPrice)}</span>
                    <span className="font-medium text-primary">Venda: {formatCurrency(product.cashPrice)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-foreground"
                    title={product.status === "published" ? "Despublicar" : "Publicar"}
                    onClick={() => toggleStatusMutation.mutate({
                      id: product.id,
                      data: { status: product.status === "published" ? "draft" : "published" },
                    })}
                  >
                    {product.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Link href={`/admin/produtos/${product.id}/editar`}>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto e todas as suas fotos serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
