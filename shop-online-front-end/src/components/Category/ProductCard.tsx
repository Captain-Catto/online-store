import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useToast } from "@/utils/useToast";
import { addToCart, getCartItemCount } from "@/utils/cartUtils";

interface ProductCardProps {
  product: Product;
  selectedColor: string;
  productImage: string;
  secondaryImage?: string;
  availableSizes: string[]; // Thêm prop availableSizes
  price: number; // Thêm prop price
  originalPrice: number; // Thêm prop originalPrice
  onColorSelect: (productId: number, color: string) => void;
}

export default function ProductCard({
  product,
  selectedColor,
  productImage,
  secondaryImage = "",
  availableSizes = [],
  price,
  originalPrice,
  onColorSelect,
}: ProductCardProps) {
  console.log("ProductCard render", product.id, selectedColor, productImage);
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleColorClick = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    onColorSelect(product.id, color);
  };

  const handleAddToCart = () => {
    if (availableSizes.length > 0) {
      setShowSizeSelector(true);
    } else {
      showToast("Sản phẩm này không có kích thước khả dụng", { type: "error" });
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCartWithSize = () => {
    if (!selectedSize) {
      showToast("Vui lòng chọn kích thước", { type: "error" });
      return;
    }

    const cartItem = {
      id: product.id.toString(),
      productId: product.id,
      name: product.name,
      price: price,
      originalPrice: originalPrice,
      quantity: 1,
      color: selectedColor,
      size: selectedSize,
      image: productImage,
    };

    addToCart(cartItem);
    showToast(`Đã thêm ${product.name} vào giỏ hàng!`, { type: "success" });
    setShowSizeSelector(false);

    // Cập nhật số lượng trong giỏ hàng
    const event = new CustomEvent("cart-updated", {
      detail: { count: getCartItemCount() },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="group relative">
      {/* Card content */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <div
            className="relative w-full h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={isHovered && secondaryImage ? secondaryImage : productImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-cover transition-opacity duration-300"
              priority={false}
            />
          </div>
        </Link>

        {/* Quick action buttons - Add to cart */}
        <button
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white py-2 px-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[80%]"
          onClick={handleAddToCart}
        >
          Thêm vào giỏ hàng
        </button>
      </div>

      {/* Product info */}
      <div className="mt-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
        </Link>

        <div className="flex justify-between items-center mt-1">
          <div className="text-sm">
            <span className="font-medium">
              {price?.toLocaleString("vi-VN")}₫
            </span>
            {originalPrice > price && (
              <span className="ml-2 text-gray-400 line-through">
                {originalPrice.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          {/* Color selector */}
          <div className="flex space-x-1">
            {product.colors?.map((color) => (
              <button
                key={color}
                className={`w-5 h-5 rounded-full border ${
                  selectedColor === color ? "ring-2 ring-black" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={(e) => handleColorClick(e, color)}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Size selector modal */}
      {showSizeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Chọn kích thước</h3>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  className={`py-2 px-4 border rounded ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <button
                className="flex-1 py-2 px-4 bg-black text-white rounded disabled:bg-gray-300"
                onClick={handleAddToCartWithSize}
                disabled={!selectedSize}
              >
                Thêm vào giỏ hàng
              </button>
              <button
                className="py-2 px-4 border border-gray-300 rounded"
                onClick={() => setShowSizeSelector(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
