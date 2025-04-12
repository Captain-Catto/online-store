import React, { useState } from "react";
import { Product } from "./ProductInterface";
import { addToCart } from "@/utils/cartUtils";

interface SizeSelectorProps {
  product: Product;
  selectedColor: string;
  productImage?: string;
  onProductAdded: (product: Product, color: string, size: string) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  product,
  selectedColor,
  productImage,
  onProductAdded,
}) => {
  // Lấy kích thước từ variant trực tiếp
  const variant = product.variants[selectedColor];
  const availableSizes = variant?.availableSizes || [];

  // State để lưu size đã chọn
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Hàm xử lý khi chọn size
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size); // Cập nhật size đã chọn
  };

  // Hàm thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng!");
      return;
    }

    try {
      const cartItem = {
        id: product.id.toString(),
        name: product.name,
        color: selectedColor,
        size: selectedSize,
        quantity: 1,
        price: variant.price,
        image: productImage,
      };

      // Thêm vào giỏ hàng
      addToCart(cartItem);

      // Thông báo cho component cha
      onProductAdded(product, selectedColor, selectedSize);

      // Cập nhật số lượng trong header
      const cartItems = JSON.parse(localStorage.getItem("shop_cart") || "[]");
      const event = new CustomEvent("cart-updated", {
        detail: { count: cartItems.length },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="size-selector bg-white/90 p-4 rounded-lg w-full">
      <span className="text-black font-medium">Chọn kích thước:</span>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {availableSizes.map((size, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded border ${
              selectedSize === size
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300"
            } hover:bg-black hover:text-white cursor-pointer transition-colors`}
            onClick={() => handleSizeSelect(size)}
          >
            {size}
          </button>
        ))}
      </div>
      <button
        className="mt-4 px-4 py-2 bg-black text-white rounded cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={handleAddToCart}
        disabled={!selectedSize}
      >
        Thêm vào giỏ hàng
      </button>
    </div>
  );
};

export default SizeSelector;
