import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductModal } from "./ProductModal";

const mockProduct = {
  id: 1,
  model: "Conjunto Renda Preta",
  storage: "M",
  cashPrice: 149.9,
  condition: "excelente",
  category: "Lingerie",
  itemSubcategory: "Conjunto",
  color: "Preto",
  brand: "PolliShop",
  specifications: "90% algodão, 10% elastano",
  photos: [
    { id: 1, url: "https://example.com/photo1.jpg", isPrimary: true },
    { id: 2, url: "https://example.com/photo2.jpg", isPrimary: false },
    { id: 3, url: "https://example.com/photo3.jpg", isPrimary: false },
  ],
  installmentOptions: [
    { installments: 0, rate: 0, perInstallment: 149.9, total: 149.9 },
    { installments: 3, rate: 5, perInstallment: 52.47, total: 157.4 },
    { installments: 6, rate: 8, perInstallment: 27.0, total: 161.89 },
    { installments: 12, rate: 12, perInstallment: 14.02, total: 167.89 },
  ],
};

describe("ProductModal", () => {
  it("renders modal when isOpen is true", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("Conjunto Renda Preta — Conjunto")).toBeDefined();
  });

  it("displays product price correctly", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("R$ 149,90")).toBeDefined();
  });

  it("displays 12x installment option when available", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("Ou 12x de")).toBeDefined();
    expect(screen.getByText("R$ 14,02")).toBeDefined();
  });

  it("displays product condition", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("Novo")).toBeDefined();
  });

  it("displays size when available", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("M")).toBeDefined();
  });

  it("displays material details when available", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("90% algodão, 10% elastano")).toBeDefined();
  });

  it("displays category-specific details", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("Lingerie · Conjunto")).toBeDefined();
    expect(screen.getByText("PolliShop")).toBeDefined();
    expect(screen.getByText("Preto")).toBeDefined();
  });

  it("displays photo counter when multiple photos exist", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("1 / 3")).toBeDefined();
  });

  it("calls onAddToCart when add button is clicked", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    const addButton = screen.getByText("Adicionar ao Carrinho");
    fireEvent.click(addButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it("calls onClose when close button is clicked", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    const closeButton = screen.getByText("Fechar");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose after adding to cart", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();

    render(
      <ProductModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    const addButton = screen.getByText("Adicionar ao Carrinho");
    fireEvent.click(addButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles products with no photos", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();
    const productNoPhotos = { ...mockProduct, photos: [] };

    render(
      <ProductModal
        product={productNoPhotos}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("Sem fotos")).toBeDefined();
  });

  it("handles products without optional fields", () => {
    const mockOnClose = vi.fn();
    const mockOnAddToCart = vi.fn();
    const minimalProduct = {
      id: 1,
      model: "Calcinha Fio Dental",
      storage: "P",
      cashPrice: 39.9,
      condition: "bom",
      photos: [{ id: 1, url: "https://example.com/photo1.jpg", isPrimary: true }],
      installmentOptions: [
        { installments: 0, rate: 0, perInstallment: 39.9, total: 39.9 },
      ],
    };

    render(
      <ProductModal
        product={minimalProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("Calcinha Fio Dental")).toBeDefined();
    expect(screen.getByText("Seminovo")).toBeDefined();
  });
});
