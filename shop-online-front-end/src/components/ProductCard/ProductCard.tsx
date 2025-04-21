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
  console.log("ProductCard props:", {
    product,
    selectedColor,
    productImage,
    secondaryImage,
  });

  const [isHovered, setIsHovered] = useState(false);

  // Lấy variant hiện tại dựa trên màu đã chọn
  const currentVariant =
    product.variants && selectedColor ? product.variants[selectedColor] : null;

  // Nếu không có giá trong variant hoặc giá bằng 0, sử dụng giá từ product
  const price =
    currentVariant && currentVariant.price > 0
      ? currentVariant.price
      : product.price || 0;

  // Nếu không có giá gốc hoặc giá gốc bằng 0, sử dụng giá + 10%
  const originalPrice =
    currentVariant && currentVariant.originalPrice > 0
      ? currentVariant.originalPrice
      : product.hasDiscount
      ? price * 1.1
      : price;

  const { showToast, Toast } = useToast();

  // Mở rộng colorMap để bao gồm thêm nhiều màu
  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    blue: "#0066CC",
    gray: "#808080",
    charcoal: "#36454F",
    green: "#008000",
    red: "#FF0000",
    navy: "#000080",
    yellow: "#FFFF00",
    purple: "#800080",
    pink: "#FFC0CB",
    orange: "#FFA500",
  };

  // Cập nhật hàm xử lý thêm vào giỏ hàng để làm việc với dữ liệu mới
  const handleProductAdded = (
    product: Product | SimpleProduct,
    color: string,
    size: string
  ) => {
    // Xác định giá cả từ variant hoặc từ product nếu không có variant
    const productPrice = price;
    const productOriginalPrice = originalPrice;

    try {
      showToast(`Đã thêm vào giỏ hàng thành công!`, {
        type: "cart",
        product: {
          name: product.name,
          image: productImage,
          color: color,
          size: size,
          quantity: 1,
          price: productPrice,
          originalPrice: productOriginalPrice,
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
      {/* product img */}
      <div
        className="relative product-image"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {product.featured && (
          <div className="absolute top-2 right-2 z-10 bg-blue-600 text-white px-3 py-1 text-xs font-semibold rounded-md">
            Đáng mua
          </div>
        )}
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
        <div
          className={`product-image relative ${
            isHovered
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          <SizeSelector
            product={product}
            selectedColor={selectedColor}
            productImage={productImage}
            onProductAdded={handleProductAdded}
          />
        </div>
      </div>

      <Link
        href={`/products/${product.id}`}
        className="block hover:text-blue-600"
      >
        <h3 className="text-lg font-medium line-clamp-2">{product.name}</h3>
      </Link>

      {/* Hiển thị giá */}
      <div className="mt-2 space-y-2">
        <div className="flex gap-2 items-center">
          <span className="font-semibold">
            {price.toLocaleString("vi-VN")}đ
          </span>
          {product.hasDiscount && originalPrice > price && (
            <>
              <span className="text-sm text-red-600 font-medium bg-red-50 px-2 py-1 rounded mr-2">
                -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
              </span>
              <span className="text-sm text-gray-500 line-through">
                {originalPrice.toLocaleString("vi-VN")}đ
              </span>
            </>
          )}
        </div>

        {/* ColorSelector với kiểm tra product.colors */}
        <div className="flex gap-2">
          {product.colors &&
            product.colors.map((color) => (
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

      {/* Hiển thị Toast khi có thông báo */}
      {Toast}
    </div>
  );
};

export default ProductCard;
