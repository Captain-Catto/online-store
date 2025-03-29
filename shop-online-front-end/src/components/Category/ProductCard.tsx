// src/components/Category/ProductCard.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../../app/categories/types";

interface ProductCardProps {
  product: Product;
  selectedColor: string;
  onColorSelect: (productId: string, color: string) => void;
  getProductImage: (product: Product, color: string) => string;
  calculateDiscount: (price?: number, originalPrice?: number) => number;
  colorMap: Record<string, string>;
}

export default function ProductCard({
  product,
  selectedColor,
  onColorSelect,
  getProductImage,
  calculateDiscount,
  colorMap,
}: ProductCardProps) {
  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`}>
        <div className="relative w-full h-64 mb-2 rounded-lg overflow-hidden">
          <Image
            src={getProductImage(product, selectedColor || product.color[0])}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {/* Rating star */}
        {product.rating && (
          <div className="absolute top-2 left-2 z-10 backdrop-blur-sm px-2 py-1 rounded-md flex items-center">
            <span className="text-sm font-medium">{product.rating.value}</span>
            <svg
              className="w-3 h-3 text-yellow-400 ml-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs text-gray-600 ml-1">
              ({product.rating.count})
            </span>
          </div>
        )}
      </Link>

      {/* Color selector */}
      <div className="flex justify-start gap-1 my-2">
        {product.color.map((color) => (
          <button
            key={color}
            className={`w-8 h-4.5 rounded-full border ${
              selectedColor === color
                ? "border-2 border-black"
                : "border-gray-300"
            }`}
            style={{ backgroundColor: colorMap[color] || color }}
            onClick={() => onColorSelect(product.id, color)}
            aria-label={`Select ${color} color`}
          />
        ))}
      </div>

      <h3 className="text-sm font-medium mt-1">{product.name}</h3>

      {/* Price and discount */}
      <div className="flex items-center mt-1">
        {product.price && (
          <span className="font-semibold">
            {product.price.toLocaleString("vi-VN")}đ
          </span>
        )}
        {product.originalPrice &&
          product.originalPrice > (product.price || 0) && (
            <>
              <span className="ml-2 text-xs text-red-500 bg-[#273bcd] text-white px-1.5 rounded-md font-bold">
                -{calculateDiscount(product.price, product.originalPrice)}%
              </span>
              <span className="ml-2 text-xs text-gray-500 line-through">
                {product.originalPrice.toLocaleString("vi-VN")}đ
              </span>
            </>
          )}
      </div>
    </div>
  );
}
