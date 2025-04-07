import React from "react";
import { Product } from "./ProductInterface";

interface ColorSelectorProps {
  product: Product;
  selectedColor: string;
  onColorSelect: (productId: number, color: string) => void;
}

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

const ColorSelector: React.FC<ColorSelectorProps> = ({
  product,
  selectedColor,
  onColorSelect,
}) => {
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Màu sắc:</span>
        <div className="flex gap-1">
          {product.colors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${
                selectedColor === color
                  ? "ring-2 ring-offset-1 ring-black"
                  : "ring-1 ring-gray-300"
              }`}
              style={{
                backgroundColor: colorMap[color] || color,
                border: color === "white" ? "1px solid #e5e5e5" : "none",
              }}
              onClick={() => onColorSelect(product.id, color)}
              aria-label={`Màu ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Giá sản phẩm */}
      {/* <div className="mt-2 flex justify-between items-center">
        <div>
          <span className="text-lg font-bold">
            {product.variants[selectedColor]?.price
              ? `${product.variants[selectedColor].price.toLocaleString(
                  "vi-VN"
                )}₫`
              : "Liên hệ"}
          </span>
          {product.variants[selectedColor]?.originalPrice && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              {product.variants[selectedColor].originalPrice.toLocaleString(
                "vi-VN"
              )}
              ₫
            </span>
          )}
        </div>
        {product.variants[selectedColor]?.price &&
          product.variants[selectedColor]?.originalPrice && (
            <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
              -
              {Math.round(
                (1 -
                  product.variants[selectedColor].price /
                    product.variants[selectedColor].originalPrice) *
                  100
              )}
              %
            </span>
          )}
      </div> */}
    </div>
  );
};

export default ColorSelector;
