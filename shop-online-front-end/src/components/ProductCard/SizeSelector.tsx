import React from "react";
import { Product } from "./ProductInterface";

interface SizeSelectorProps {
  product: Product;
  selectedColor: string;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  product,
  selectedColor,
}) => {
  // Kiểm tra nếu có màu đã chọn và màu đó có trong chi tiết của sản phẩm
  const availableSizes =
    product.variants.details[selectedColor]?.availableSizes || [];

  return (
    <div className="size-selector">
      <span className="text-black font-medium">Thêm nhanh vào giỏ hàng:</span>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {availableSizes.map((size, idx) => (
          <button
            key={idx}
            className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-black hover:text-white text-black cursor-pointer transition-colors"
            onClick={() => {
              // Thêm vào giỏ hàng (giả định có hàm xử lý ở đây)
              // Ví dụ: addToCart(product.id, selectedColor, size)
              console.log(
                `Thêm sản phẩm: ${product.name}, màu: ${selectedColor}, size: ${size}`
              );
            }}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
