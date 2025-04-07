"use client";

import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import { PrevArrow, NextArrow } from "../../../util/CustomArrowSlick";
import Link from "next/link";
import ProductCard from "../../ProductCard/ProductCard";
import { Product, PaginatedResponse } from "../../ProductCard/ProductInterface";
import { ProductService } from "@/services/ProductService";

const RunningProducts: React.FC = () => {
  const sliderRef = useRef<Slider>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedColors, setSelectedColors] = useState<{
    [productId: number]: string;
  }>({});
  const [productImages, setProductImages] = useState<{
    [productId: number]: string;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRunningProducts = async () => {
      try {
        setLoading(true);
        // Sử dụng ProductService để lấy sản phẩm theo category
        // Chỉ cần quan tâm đến products từ response
        const response = await ProductService.getProductsByCategory(2); // Giả sử ID 2 là danh mục sản phẩm chạy bộ

        // Chỉ cần lấy phần products từ response
        const { products: productsData } = response as PaginatedResponse;
        console.log("Fetched running products:", productsData);

        // Xử lý dữ liệu sản phẩm
        const initialColors: { [productId: number]: string } = {};
        const initialImages: { [productId: number]: string } = {};

        productsData.forEach((product: Product) => {
          // Thiết lập màu mặc định (màu đầu tiên)
          if (product.colors.length > 0) {
            const defaultColor = product.colors[0];
            initialColors[product.id] = defaultColor;

            // Lấy hình ảnh từ variant
            const variant = product.variants[defaultColor];
            if (variant) {
              let imageUrl = "";
              if (variant.images && variant.images.length > 0) {
                const mainImage =
                  variant.images.find((img) => img.isMain) || variant.images[0];
                imageUrl = mainImage.url;
              }
              initialImages[product.id] = imageUrl;
            }
          }
        });

        setProducts(productsData);
        setSelectedColors(initialColors);
        setProductImages(initialImages);
      } catch (error) {
        console.error("Failed to fetch running products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRunningProducts();
  }, []);

  const handleColorSelect = (productId: number, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));

    // Cập nhật hình ảnh khi chọn màu mới
    const product = products.find((p) => p.id === productId);
    if (product) {
      const variant = product.variants[color];
      if (variant) {
        let imageUrl = "";
        if (variant.images && variant.images.length > 0) {
          const mainImage =
            variant.images.find((img) => img.isMain) || variant.images[0];
          imageUrl = mainImage.url;
        }
        setProductImages((prev) => ({
          ...prev,
          [productId]: imageUrl,
        }));
      }
    }
  };

  const settings = {
    dots: false,
    infinite: products.length > 5,
    speed: 500,
    slidesToShow: Math.min(5, products.length),
    slidesToScroll: Math.min(2, products.length),
    prevArrow: products.length > 1 ? <PrevArrow /> : <></>,
    nextArrow: products.length > 1 ? <NextArrow /> : <></>,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: Math.min(4, products.length),
          infinite: products.length > 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, products.length),
          infinite: products.length > 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, products.length),
          infinite: products.length > 2,
        },
      },
    ],
  };

  return (
    <div className="w-full xl:px-20 lg:px-10 md:px-4 px-2 mt-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-left">SẢN PHẨM CHẠY BỘ</h2>
        <Link
          href="/category/2" // Chuyển hướng đến trang category chạy bộ
          className="text-right text-lg text-gray-500 hover:underline hover:text-gray-700"
        >
          Xem thêm
        </Link>
      </div>
      <div className="relative mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex justify-center items-center h-80">
            <p className="text-gray-500">Không có sản phẩm nào</p>
          </div>
        ) : products.length === 1 ? (
          // Hiển thị trực tiếp nếu chỉ có 1 sản phẩm
          <div className="grid place-items-center">
            <div className="max-w-xs">
              <ProductCard
                product={products[0]}
                selectedColor={
                  selectedColors[products[0].id] || products[0].colors[0]
                }
                productImage={productImages[products[0].id] || ""}
                onColorSelect={handleColorSelect}
              />
            </div>
          </div>
        ) : (
          <Slider ref={sliderRef} {...settings}>
            {products.map((product) => {
              const color = selectedColors[product.id] || product.colors[0];
              return (
                <div key={product.id} className="p-2">
                  <ProductCard
                    product={product}
                    selectedColor={color}
                    productImage={productImages[product.id] || ""}
                    onColorSelect={handleColorSelect}
                  />
                </div>
              );
            })}
          </Slider>
        )}
      </div>
    </div>
  );
};

export default RunningProducts;
