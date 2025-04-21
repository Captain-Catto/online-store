import React, { useState } from "react";
import { SimpleProduct } from "@/types/product";
import { addToCart } from "@/utils/cartUtils";

interface SizeSelectorProps {
  product: SimpleProduct;
  selectedColor: string;
  productImage?: string;
  onProductAdded: (product: SimpleProduct, color: string, size: string) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  product,
  selectedColor,
  productImage,
  onProductAdded,
}) => {
  // Lấy kích thước từ variant hoặc từ product
  const variant =
    product.variants && selectedColor ? product.variants[selectedColor] : null;

  // Sử dụng sizes từ variant hoặc từ product nếu không có variant
  const availableSizes = variant?.sizes || product.sizes || [];

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
      // Xác định giá từ variant hoặc từ product
      const price =
        variant?.price || product.priceRange?.min || product.price || 0;

      const cartItem = {
        id: product.id.toString(),
        name: product.name,
        color: selectedColor,
        size: selectedSize,
        quantity: 1,
        price: price,
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
    <div className="size-selector">
      <span className="text-black font-bold">Chọn kích thước:</span>
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
        className="mt-4 px-4 py-2 bg-black text-white rounded cursor-pointer hover:bg-gray-800 transition-colors w-full"
        onClick={handleAddToCart}
        disabled={!selectedSize}
      >
        Thêm vào giỏ hàng
      </button>
    </div>
  );
};

export default SizeSelector;
