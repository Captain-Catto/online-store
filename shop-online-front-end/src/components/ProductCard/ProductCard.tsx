// components/ProductCard/ProductCard.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import ColorSelector from "./ColorSelector";
import SizeSelector from "./SizeSelector";
import { Product } from "./ProductInterface";

interface ProductCardProps {
  product: Product;
  selectedColor: string;
  productImage: string;
  onColorSelect: (productId: number, color: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  selectedColor,
  productImage,
  onColorSelect,
}) => {
  return (
    <div className="product-container w-full rounded-lg flex-shrink-0 m-2 h-[500px] mx-auto flex flex-col">
      {/* Hình ảnh sản phẩm */}
      <div className="relative product-image">
        <Link href={`/products/${product.id}`}>
          <Image
            src={productImage || ""}
            alt={product.name}
            className="w-full h-80 object-cover md:object-top rounded-md mb-4 cursor-pointer transition-transform hover:scale-105"
            width={400}
            height={320}
            priority
          />
        </Link>

        <SizeSelector product={product} selectedColor={selectedColor} />
      </div>

      {/* Tên sản phẩm */}
      <Link
        href={`/products/${product.id}`}
        className="block hover:text-blue-600"
      >
        <h3 className="text-lg font-medium whitespace-normal line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>
      </Link>

      {/* Chọn màu sắc */}
      <ColorSelector
        product={product}
        selectedColor={selectedColor}
        onColorSelect={onColorSelect}
      />
    </div>
  );
};

export default ProductCard;
