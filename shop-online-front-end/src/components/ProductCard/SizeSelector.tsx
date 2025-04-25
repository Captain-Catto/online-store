import React, { useState } from "react";
import { SimpleProduct } from "@/types/product";
import { addToCart } from "@/utils/cartUtils";
import { CartItem } from "@/types/cart";

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
  // Lấy variant dựa trên selectedColor
  const variant =
    product.variants && selectedColor in product.variants
      ? product.variants[selectedColor]
      : null;

  // Lấy danh sách kích thước từ variant
  const availableSizes = variant?.availableSizes ?? [];

  // State để theo dõi size được thêm gần đây nhất
  const [addedSize, setAddedSize] = useState<string | null>(null);
  // State để hiển thị animation khi thêm thành công
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Hàm xử lý khi click vào size - thêm ngay vào giỏ hàng
  const handleSizeClick = (size: string) => {
    try {
      // Xác định giá từ variant hoặc từ product
      const price = variant?.price ?? product.price ?? 0;
      const originalPrice =
        variant?.originalPrice ?? (product.hasDiscount ? price * 1.1 : price);

      // Tạo ID duy nhất cho cartItem
      const cartItemId = `${product.id}-${selectedColor}-${size}`;

      const cartItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        name: product.name,
        price,
        originalPrice,
        quantity: 1,
        color: selectedColor,
        size: size,
        image: productImage ?? "/images/default-product.jpg", // Fallback nếu productImage undefined
      };

      // Thêm vào giỏ hàng
      addToCart(cartItem);

      // Hiệu ứng khi thêm thành công
      setAddedSize(size);
      setIsAdding(true);
      setTimeout(() => setIsAdding(false), 1000);

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
    <div className="size-selector">
      <span className="text-xs text-center mt-2 text-black font-bold">
        Thêm nhanh vào giỏ hàng:
      </span>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {availableSizes.map((size) => (
          <button
            key={size}
            className={`relative px-3 py-1 rounded border ${
              addedSize === size && isAdding
                ? "bg-green-500 text-white border-green-500"
                : "bg-white text-black border-gray-300 hover:bg-black hover:text-white"
            } cursor-pointer transition-all duration-300 overflow-hidden`}
            onClick={() => handleSizeClick(size)}
          >
            {size}
            {addedSize === size && isAdding && (
              <span className="absolute inset-0 flex items-center justify-center bg-green-500 text-white animate-fade-in">
                <svg
                  className="w-4 h-4 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SizeSelector;
