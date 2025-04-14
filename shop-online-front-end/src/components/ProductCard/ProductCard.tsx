"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SizeSelector from "./SizeSelector";
import { useToast } from "@/utils/useToast";
import { SimpleProduct, Product } from "@/types/product";

interface ProductCardProps {
  product: SimpleProduct;
  selectedColor: string;
  productImage: string;
  secondaryImage?: string;
  onColorSelect: (productId: number, color: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  selectedColor,
  productImage,
  secondaryImage,
  onColorSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const currentVariant = product.variants[selectedColor];
  const { showToast, Toast } = useToast();

  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    blue: "#0066CC",
    gray: "#808080",
    charcoal: "#36454F",
    green: "#008000",
    red: "#FF0000",
    navy: "#000080",
  };

  // Xử lý sự kiện khi sản phẩm được thêm vào giỏ hàng
  const handleProductAdded = (
    product: Product,
    color: string,
    size: string
  ) => {
    const variant = product.variants[color];

    try {
      showToast(`Đã thêm vào giỏ hàng thành công!`, {
        type: "cart",
        product: {
          name: product.name,
          image: productImage,
          color: color,
          size: size,
          quantity: 1,
          price: variant.price,
          originalPrice: variant.originalPrice,
        },
        duration: 4000,
      });
      console.log("Toast đã hiển thị");
    } catch (error) {
      console.error("Lỗi hiển thị toast:", error);
    }
  };

  return (
    <div className="product-container w-full rounded-lg flex-shrink-0 m-2 h-[500px] mx-auto flex flex-col relative">
      <div
        className="relative product-image"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/products/${product.id}`}>
          {productImage ? (
            <div className="relative w-full h-80">
              <Image
                src={productImage}
                alt={product.name}
                className={`w-full h-80 object-cover md:object-top rounded-md mb-4 cursor-pointer transition-opacity duration-300 ${
                  isHovered && secondaryImage ? "opacity-0" : "opacity-100"
                }`}
                width={400}
                height={320}
                priority
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage}
                  alt={`${product.name} - second view`}
                  className={`w-full h-80 object-cover md:object-top rounded-md mb-4 cursor-pointer transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                  width={400}
                  height={320}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
              )}
            </div>
          ) : (
            <div className="w-full h-80 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
              <span className="text-gray-400">Không có hình ảnh</span>
            </div>
          )}
        </Link>

        {/* Size selector overlay khi hover */}
        {isHovered && currentVariant && (
          <div className="absolute inset-0 flex flex-col justify-center items-center p-4 transition-opacity duration-200">
            <SizeSelector
              product={product as Product}
              selectedColor={selectedColor}
              productImage={productImage}
              onProductAdded={handleProductAdded}
            />
          </div>
        )}
      </div>

      <Link
        href={`/products/${product.id}`}
        className="block hover:text-blue-600"
      >
        <h3 className="text-lg font-medium line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>
      </Link>

      {/*  */}
      {currentVariant && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-2 items-center">
            <span className="font-semibold">
              {currentVariant.price.toLocaleString("vi-VN")}đ
            </span>
            {currentVariant.originalPrice > currentVariant.price && (
              // hiển thị thêm % giảm giá
              <>
                <span className="text-sm text-red-600 font-medium bg-red-50 px-2 py-1 rounded mr-2">
                  -
                  {Math.round(
                    ((currentVariant.originalPrice - currentVariant.price) /
                      currentVariant.originalPrice) *
                      100
                  )}
                  %
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {currentVariant.originalPrice.toLocaleString("vi-VN")}đ
                </span>
              </>
            )}
          </div>

          {/* ColorSelector luôn hiển thị khi không hover */}
          <div className="flex gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color ? "border-black" : "border-gray-300"
                }`}
                style={{ backgroundColor: colorMap[color] || color }}
                onClick={() => onColorSelect(product.id, color)}
                aria-label={`Màu ${color}`}
              />
            ))}
          </div>
        </div>
      )}
      {/* Hiển thị Toast khi có thông báo */}
      {Toast}
    </div>
  );
};

export default ProductCard;
