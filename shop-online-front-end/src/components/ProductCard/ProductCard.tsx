"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SizeSelector from "./SizeSelector";
import { useToast } from "@/utils/useToast";
import { SimpleProduct, VariantDetail } from "@/types/product";
import { useDevice } from "@/contexts/DeviceContext";

interface ProductCardProps {
  product: SimpleProduct;
  selectedColor: string;
  productImage: string;
  secondaryImage?: string;
  onColorSelect: (productId: number, color: string) => void;
  price?: number;
  originalPrice?: number | null;
  availableSizes?: string[];
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  selectedColor,
  productImage,
  secondaryImage,
  onColorSelect,
}) => {
  const { isMiniMobile } = useDevice();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [secondaryImageLoaded, setSecondaryImageLoaded] = useState(false);
  const [isSelectorReady, setIsSelectorReady] = useState(false);

  const currentVariant: VariantDetail | null =
    product.variants && selectedColor in product.variants
      ? product.variants[selectedColor]
      : null;

  const price = currentVariant?.price ?? product.price ?? 0;
  const originalPrice = currentVariant?.originalPrice ?? price;

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
    yellow: "#FFFF00",
    purple: "#800080",
    pink: "#FFC0CB",
    orange: "#FFA500",
  };

  // Theo dõi trạng thái hover và update trạng thái sẵn sàng
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isHovered) {
      // Đặt delay để animate hoàn tất trước khi cho phép tương tác
      timer = setTimeout(() => {
        setIsSelectorReady(true);
      }, 300); // Đợi 300ms để animation hoàn thành
    } else {
      // Reset lại trạng thái khi không hover
      setIsSelectorReady(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isHovered]);

  const handleProductAdded = (
    product: SimpleProduct,
    color: string,
    size: string
  ) => {
    try {
      showToast(`Đã thêm vào giỏ hàng thành công!`, {
        type: "cart",
        product: {
          name: product.name,
          image: productImage,
          color,
          size,
          quantity: 1,
          price,
          originalPrice,
        },
        duration: 4000,
      });
    } catch (error) {
      console.error("Lỗi hiển thị toast:", error);
    }
  };

  const showPlaceholder =
    !imageLoaded || (isHovered && secondaryImage && !secondaryImageLoaded);

  return (
    <div className="product-container w-full rounded-lg flex-shrink-0 mx-auto flex flex-col relative p-2">
      {/* Hình ảnh sản phẩm */}
      <div
        className="relative product-image"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {product.featured && (
          <div className="absolute top-2 right-2 z-5 bg-blue-600 text-white px-3 py-1 text-xs font-semibold rounded-md">
            Đáng mua
          </div>
        )}
        <Link href={`/products/${product.id}`}>
          {/* Placeholder khi ảnh chưa load xong */}
          {showPlaceholder && (
            <div className="w-full aspect-[2/3] bg-gray-200 rounded-md animate-pulse"></div>
          )}

          {productImage && (
            <div className="relative w-full aspect-[2/3]">
              <Image
                src={productImage}
                alt={product.name}
                className={`w-full h-full object-cover md:object-top rounded-md transition-opacity duration-300 ${
                  !imageLoaded
                    ? "opacity-0"
                    : isHovered && secondaryImage && secondaryImageLoaded
                    ? "opacity-0"
                    : "opacity-100"
                }`}
                width={672}
                height={990}
                priority
                style={{ position: "absolute", top: 0, left: 0 }}
                onLoad={() => setImageLoaded(true)}
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage}
                  alt={`${product.name} - second view`}
                  className={`w-full h-full object-cover md:object-top rounded-md transition-opacity duration-300 ${
                    isHovered && secondaryImageLoaded
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                  width={672}
                  height={990}
                  style={{ position: "absolute", top: 0, left: 0 }}
                  onLoad={() => setSecondaryImageLoaded(true)}
                />
              )}
            </div>
          )}

          {!productImage && (
            <div className="w-full aspect-[2/3] bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-400">Không có hình ảnh</span>
            </div>
          )}
        </Link>
        {/* Size selector hiển thị đè lên hình ảnh */}
        {/* nếu isMiniMobile đúng thì ẩn đi */}
        {!isMiniMobile && (
          <div
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80%] max-w-[90%] backdrop-blur-2xl bg-white/40 rounded-lg text-white text-center p-3 opacity-0 transition-all duration-500 ease-in-out z-[9] ${
              isHovered && imageLoaded ? "opacity-100 bottom-[30px]" : ""
            } ${
              !isSelectorReady ? "pointer-events-none" : "pointer-events-auto"
            }`}
          >
            <SizeSelector
              product={product}
              selectedColor={selectedColor}
              productImage={productImage}
              onProductAdded={handleProductAdded}
            />
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <Link
        href={`/products/${product.id}`}
        className="block hover:text-blue-600 mt-2"
      >
        <h3 className="text-lg font-medium line-clamp-2">{product.name}</h3>
      </Link>

      <div className="mt-2 space-y-2">
        {/* Giá sản phẩm */}
        <div className="flex gap-2 items-center flex-wrap">
          <span className="font-semibold">
            {price.toLocaleString("vi-VN")}đ
          </span>
          {originalPrice > price && (
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

        {/* Chọn màu */}
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

      {/* Toast thông báo */}
      {Toast}
    </div>
  );
};

export default ProductCard;
