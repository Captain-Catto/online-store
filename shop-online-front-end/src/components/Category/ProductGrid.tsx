// src/components/Category/ProductGrid.tsx
import React from "react";
import ProductCard from "./ProductCard";
import { Product } from "../../app/categories/types";

interface ProductGridProps {
  products: Product[];
  selectedColors: { [productId: string]: string };
  onColorSelect: (productId: string, color: string) => void;
  getProductImage: (product: Product, color: string) => string;
  calculateDiscount: (price?: number, originalPrice?: number) => number;
  colorMap: Record<string, string>;
  category?: string;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export default function ProductGrid({
  products,
  selectedColors,
  onColorSelect,
  getProductImage,
  calculateDiscount,
  colorMap,
  category,
  currentPage,
  itemsPerPage,
  totalItems,
}: ProductGridProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {category ? decodeURIComponent(category) : "Tất cả sản phẩm"}
        </h1>
        <div className="text-sm">
          Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems} sản
          phẩm
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">
            Không tìm thấy sản phẩm nào
          </h3>
          <p className="text-gray-600">Vui lòng thử lại với bộ lọc khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selectedColor={selectedColors[product.id]}
              onColorSelect={onColorSelect}
              getProductImage={getProductImage}
              calculateDiscount={calculateDiscount}
              colorMap={colorMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
