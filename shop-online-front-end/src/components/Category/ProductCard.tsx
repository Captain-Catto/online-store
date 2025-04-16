"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getColorCode } from "@/utils/colorUtils";

// Interface định nghĩa props của component
interface ProductCardProps {
  product: {
    id: number;
    name: string;
    colors: string[];
    // do variants có nhiều thuộc tính, nên lúc đầu dùng any nhưng eslint báo lỗi
    // nên dùng Record<string, { availableSizes: string[]; price: number; originalPrice: number }>
    // để tránh lỗi eslint
    variants: Record<
      string,
      { availableSizes: string[]; price: number; originalPrice: number }
    >;
  };
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
  // Lấy thông tin variant của màu đã chọn
  const currentVariant = product.variants[selectedColor];

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

        {currentVariant && currentVariant.availableSizes && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2 justify-center">
              {currentVariant.availableSizes.map((size: string) => (
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
              {currentVariant.price.toLocaleString("vi-VN")}đ
            </span>
            {currentVariant.originalPrice > currentVariant.price && (
              <span className="text-sm text-gray-500 line-through">
                {currentVariant.originalPrice.toLocaleString("vi-VN")}đ
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
