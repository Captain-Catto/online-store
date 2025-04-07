import React from "react";
import { Product } from "./ProductInterface";
import { addToCart } from "@/util/cartUtils";

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

  const handleAddToCart = (size: string) => {
    try {
      const cartItem = {
        id: product.id.toString(),
        name: product.name,
        color: selectedColor,
        size: size,
        quantity: 1,
        price: variant.price,
        image: productImage,
      };

      // Thêm vào giỏ hàng
      addToCart(cartItem);

      // Thông báo cho component cha
      onProductAdded(product, selectedColor, size);

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
      <span className="text-black font-medium">Thêm nhanh vào giỏ hàng:</span>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {availableSizes.map((size, idx) => (
          <button
            key={idx}
            className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-black hover:text-white text-black cursor-pointer transition-colors"
            onClick={() => handleAddToCart(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
