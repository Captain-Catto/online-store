"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getColorCode } from "@/utils/colorUtils";
import { SimpleProduct } from "@/types/product";

// Interface định nghĩa props của component
interface ProductCardProps {
  product: SimpleProduct;
  selectedColor: string;
  productImage: string;
  onColorSelect: (productId: number, color: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  selectedColor,
  productImage,
  onColorSelect,
}) => {
  // Lấy variant hiện tại dựa trên màu đã chọn
  const currentVariant =
    product.variants && selectedColor ? product.variants[selectedColor] : null;

  // Nếu không có giá trong variant hoặc giá bằng 0, sử dụng giá từ product
  const price =
    currentVariant && currentVariant.price > 0
      ? currentVariant.price
      : product.priceRange?.min || product.price || 0;

  // Nếu không có giá gốc hoặc giá gốc bằng 0, sử dụng giá + 10%
  const originalPrice =
    currentVariant && currentVariant.originalPrice > 0
      ? currentVariant.originalPrice
      : product.hasDiscount
      ? price * 1.1
      : price;

  return (
    <div className="product-container w-full rounded-lg flex-shrink-0 m-2 h-[500px] mx-auto flex flex-col">
      <div className="relative product-image">
        <Link href={`/products/${product.id}`}>
          <Image
            src={productImage}
            alt={product.name}
            className="w-full h-80 object-cover md:object-top rounded-md mb-4 cursor-pointer transition-transform hover:scale-105"
            width={400}
            height={320}
            priority
          />
        </Link>
        {currentVariant &&
          currentVariant.sizes &&
          currentVariant.sizes.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex gap-2 justify-center">
                {currentVariant.sizes.map((size: string) => (
                  <span
                    key={size}
                    className="px-2 py-1 text-xs bg-white/80 rounded"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>
      <Link
        href={`/products/${product.id}`}
        className="block hover:text-blue-600"
      >
        <h3 className="text-lg font-medium line-clamp-2">{product.name}</h3>
      </Link>
      {currentVariant && (
        <div className="mt-2 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold">
              {price.toLocaleString("vi-VN")}đ
            </span>
            {originalPrice > price && (
              <span className="text-sm text-gray-500 line-through">
                {originalPrice.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color ? "border-black" : "border-gray-300"
                }`}
                style={{ backgroundColor: getColorCode(color) }}
                onClick={() => onColorSelect(product.id, color)}
                aria-label={`Select ${color} color`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
