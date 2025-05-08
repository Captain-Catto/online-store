import React, { useState } from "react";
import { SimpleProduct } from "@/types/product";
import { CartItem } from "@/types/cart";
import { useCart } from "@/contexts/CartContext";

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
  const { addToCart } = useCart();

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
      const originalPrice = variant?.originalPrice ?? price;
      // Tạo ID duy nhất cho cartItem
      const cartItemId = `${product.id}-${selectedColor}-${size}`;

      const productDetailId = variant?.detailId;
      console.log("ProductDetailId from variant:", productDetailId);

      const cartItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        productDetailId: productDetailId ?? "",
        name: product.name,
        price,
        originalPrice,
        quantity: 1,
        color: selectedColor,
        size: size,
        image: productImage ?? "/images/default-product.jpg", // Fallback nếu productImage undefined
      };
      console.log("CartItem:", cartItem);
      // Thêm vào giỏ hàng
      addToCart(cartItem);

      // Hiệu ứng khi thêm thành công
      setAddedSize(size);
      setIsAdding(true);
      setTimeout(() => setIsAdding(false), 1000);

      // Thông báo cho component cha
      onProductAdded(product, selectedColor, size);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="">
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
    </div>
  );
};

export default SizeSelector;
