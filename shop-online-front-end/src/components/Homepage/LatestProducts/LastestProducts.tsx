"use client";

import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import Link from "next/link";
import { PrevArrow, NextArrow } from "@/util/CustomArrowSlick";
import ProductCard from "@/components/ProductCard/ProductCard";
import { ProductService } from "@/services/ProductService";

// Định nghĩa interface Product để khớp với API response
interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

interface VariantDetail {
  detailId: number;
  price: number;
  originalPrice: number;
  images: ProductImage[];
  availableSizes: string[];
  inventory: Record<string, number>;
  variants: any[];
}

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  categories: Array<{ id: number; name: string }>;
  brand: string;
  colors: string[];
  sizes: string[];
  featured: boolean;
  status: string;
  statusLabel: string;
  statusClass: string;
  variants: Record<string, VariantDetail>;
  createdAt: string;
  updatedAt: string;
}

const LatestProducts: React.FC = () => {
  const sliderRef = useRef<Slider>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<{
    [productId: number]: string;
  }>({});
  const [productImages, setProductImages] = useState<{
    [productId: number]: string;
  }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getProducts(1, 10, {
          featured: true,
          sort: "createdAt:desc",
        });

        const initialColors: { [key: number]: string } = {};
        const initialImages: { [key: number]: string } = {};

        // Xử lý dữ liệu từ API
        response.products.forEach((product) => {
          // Chọn màu mặc định là màu đầu tiên
          const defaultColor = product.colors[0];

          // Nếu có thông tin variant của màu này
          if (defaultColor && product.variants[defaultColor]) {
            initialColors[product.id] = defaultColor;

            // Lấy chi tiết variant của màu mặc định
            const variantDetail = product.variants[defaultColor];

            // Tìm hình ảnh chính của màu này, nếu không có thì lấy hình đầu tiên
            const mainImage =
              variantDetail.images.find((img) => img.isMain) ||
              variantDetail.images[0];

            // Nếu có hình ảnh, lưu URL vào state
            if (mainImage) {
              initialImages[product.id] = mainImage.url;
            }
          }
        });

        setProducts(response.products);
        setSelectedColors(initialColors);
        setProductImages(initialImages);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handler khi người dùng chọn màu khác
  const handleColorSelect = (productId: number, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));

    // Tìm sản phẩm tương ứng
    const product = products.find((p) => p.id === productId);

    // Nếu tìm thấy sản phẩm và có thông tin variant của màu đã chọn
    if (product && product.variants[color]) {
      const variantDetail = product.variants[color];

      // Tìm hình ảnh chính hoặc hình đầu tiên
      const mainImage =
        variantDetail.images.find((img) => img.isMain) ||
        variantDetail.images[0];

      // Cập nhật hình ảnh cho sản phẩm
      if (mainImage) {
        setProductImages((prev) => ({
          ...prev,
          [productId]: mainImage.url,
        }));
      }
    }
  };

  // Cấu hình slider
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    prevArrow: <PrevArrow onClick={() => {}} />,
    nextArrow: <NextArrow onClick={() => {}} />,
    responsive: [
      { breakpoint: 1440, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
    ],
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full text-center py-8 text-red-500">
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-black text-white rounded"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Lọc sản phẩm mới theo category (Áo)
  const latestProducts = products.filter((product) =>
    product.categories.some((category) => category.name === "")
  );

  // Sử dụng sản phẩm đã lọc hoặc tất cả sản phẩm nếu không có
  const displayProducts = latestProducts.length > 0 ? latestProducts : products;

  return (
    <div className="w-full xl:px-20 lg:px-10 md:px-4 px-2 mt-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-left">SẢN PHẨM MỚI NHẤT</h2>
        <Link
          href="/products"
          className="text-right text-lg text-gray-500 hover:underline hover:text-gray-700"
        >
          Xem thêm
        </Link>
      </div>

      <div className="relative mt-6">
        <Slider ref={sliderRef} {...settings}>
          {displayProducts.map((product) => {
            const color = selectedColors[product.id] || product.colors[0];
            const variant = product.variants[color];

            return (
              <div key={product.id} className="p-2">
                <ProductCard
                  product={{
                    id: product.id,
                    name: product.name,
                    colors: product.colors,
                    variants: product.variants,
                  }}
                  selectedColor={color}
                  productImage={productImages[product.id] || ""}
                  onColorSelect={handleColorSelect}
                />
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
};

export default LatestProducts;
