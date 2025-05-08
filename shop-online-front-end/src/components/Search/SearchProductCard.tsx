import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/utils/currencyUtils";
import { Product } from "@/types/product";

interface SearchProductCardProps {
  product: Product;
  onClick?: () => void;
}

const SearchProductCard: React.FC<SearchProductCardProps> = ({
  product,
  onClick,
}) => {
  // Lấy biến thể màu đầu tiên cho sản phẩm
  const defaultColor = product.colors[0];
  const variant = product.variants[defaultColor];
  const mainImage: string =
    variant?.images?.find((img: { isMain: boolean; url: string }) => img.isMain)
      ?.url ||
    variant?.images[0]?.url ||
    "/placeholder.jpg";
  const discount =
    variant?.originalPrice > variant?.price
      ? Math.round(100 - (variant.price * 100) / variant.originalPrice)
      : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      onClick={onClick}
      className="group bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative overflow-hidden aspect-[3/4]">
        {product.featured && (
          <span className="absolute top-2 right-2 z-10 bg-black text-white px-2 py-0.5 text-[10px] font-medium rounded-full">
            ĐÁNG MUA
          </span>
        )}

        <Image
          src={mainImage}
          alt={product.name}
          width={200}
          height={300}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Thông tin sản phẩm với padding */}
      <div className="p-3 bg-white">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
          {product.name}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          {product.material || "100% Cotton"}
        </p>

        <div className="flex items-center mt-2">
          <span className="text-black font-semibold">
            {formatCurrency(variant?.price || 0)}
          </span>

          {discount > 0 && (
            <>
              <span className="ml-2 text-gray-500 text-sm line-through">
                {formatCurrency(variant?.originalPrice || 0)}
              </span>
              <span className="ml-2 text-white bg-blue-600 text-xs font-bold px-1.5 py-0.5 rounded">
                -{discount}%
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SearchProductCard;
