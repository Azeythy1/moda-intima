import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart, Ruler, Palette, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { CONDITION_LABELS } from "@shared/categories";

interface Photo {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface CatalogItem {
  id: number;
  model: string;
  storage: string | null;
  color?: string | null;
  cashPrice: number;
  condition: string;
  category?: string;
  itemSubcategory?: string | null;
  brand?: string | null;
  specifications?: string | null;
  photos: Photo[];
  installmentOptions: Array<{
    installments: number;
    rate: number;
    perInstallment: number;
    total: number;
  }>;
}

interface ProductModalProps {
  product: CatalogItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CatalogItem) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = product.photos.length > 0 ? product.photos : [];
  const currentPhoto = photos[currentPhotoIndex];
  const installment12x = product.installmentOptions.find(opt => opt.installments === 12);
  const conditionLabel =
    CONDITION_LABELS[product.condition as keyof typeof CONDITION_LABELS] ?? product.condition;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {product.model}
            {product.itemSubcategory ? ` — ${product.itemSubcategory}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative w-full bg-muted rounded-lg overflow-hidden aspect-[3/4]">
              {currentPhoto ? (
                <motion.img
                  key={currentPhotoIndex}
                  src={currentPhoto.url}
                  alt={`${product.model} - Foto ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-muted-foreground">Sem fotos</span>
                </div>
              )}

              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhotoIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPhotoIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentPhotoIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>

            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentPhotoIndex
                        ? "border-primary ring-2 ring-primary/50"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img src={photo.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">À vista</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(product.cashPrice)}</p>
              </div>
              {installment12x && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <p className="text-sm text-rose-600 font-medium">Ou 12x de</p>
                  <p className="text-xl font-bold text-rose-700">{formatCurrency(installment12x.perInstallment)}</p>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              {product.category && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Categoria</p>
                    <p className="font-semibold text-foreground">
                      {product.category}
                      {product.itemSubcategory ? ` · ${product.itemSubcategory}` : ""}
                    </p>
                  </div>
                </div>
              )}

              {product.storage && (
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tamanho</p>
                    <p className="font-semibold text-foreground">{product.storage}</p>
                  </div>
                </div>
              )}

              {product.color && (
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cor</p>
                    <p className="font-semibold text-foreground">{product.color}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Condição</p>
                <p className="font-semibold text-foreground capitalize">{conditionLabel}</p>
              </div>

              {product.brand && (
                <div>
                  <p className="text-sm text-muted-foreground">Marca</p>
                  <p className="font-semibold text-foreground">{product.brand}</p>
                </div>
              )}

              {product.specifications && (
                <div>
                  <p className="text-sm text-muted-foreground">Material / Detalhes</p>
                  <p className="font-semibold text-foreground">{product.specifications}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Fechar
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
