"use client";

import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import Link from "next/link";
import { PrevArrow, NextArrow } from "@/utils/CustomArrowSlick";
import ProductCard from "@/components/ProductCard/ProductCard";
import { ProductService } from "@/services/ProductService";
import { Product, VariantDetail } from "@/types/product";
import { useCallback } from "react";

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
  const [secondaryImages, setSecondaryImages] = useState<{
    [productId: number]: string;
  }>({});

  // Hàm lấy hình ảnh
  const extractImages = useCallback(
    (
      variant: VariantDetail
    ): { mainImage: string | null; secondaryImage: string | null } => {
      if (!variant?.images || variant.images.length === 0) {
        return { mainImage: null, secondaryImage: null };
      }

      const mainImage =
        variant.images.find((img) => img.isMain) || variant.images[0];
      let secondaryImage = null;

      if (variant.images.length > 1) {
        secondaryImage = variant.images.find((img) => img !== mainImage);
      }

      return {
        mainImage: mainImage ? mainImage.url : null,
        secondaryImage: secondaryImage ? secondaryImage.url : null,
      };
    },
    []
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getProducts(1, 10, {
          sort: "name_desc",
        });

        const initialColors: { [key: number]: string } = {};
        const initialImages: { [key: number]: string } = {};
        const initialSecondaryImages: { [key: number]: string } = {};

        response.products.forEach((product: Product) => {
          const defaultColor = product.colors[0];
          if (defaultColor && product.variants[defaultColor]) {
            initialColors[product.id] = defaultColor;
            const { mainImage, secondaryImage } = extractImages(
              product.variants[defaultColor]
            );
            if (mainImage) {
              initialImages[product.id] = mainImage;
            }
            if (secondaryImage) {
              initialSecondaryImages[product.id] = secondaryImage;
            }
          }
        });

        setProducts(response.products);
        setSelectedColors(initialColors);
        setProductImages(initialImages);
        setSecondaryImages(initialSecondaryImages);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [extractImages]);

  const handleColorSelect = useCallback(
    (productId: number, color: string) => {
      setSelectedColors((prev) => ({ ...prev, [productId]: color }));

      const product = products.find((p) => p.id === productId);
      if (product?.variants[color]) {
        const { mainImage, secondaryImage } = extractImages(
          product.variants[color]
        );
        if (mainImage) {
          setProductImages((prev) => ({ ...prev, [productId]: mainImage }));
        }
        if (secondaryImage) {
          setSecondaryImages((prev) => ({
            ...prev,
            [productId]: secondaryImage,
          }));
        } else {
          setSecondaryImages((prev) => {
            const newState = { ...prev };
            delete newState[productId];
            return newState;
          });
        }
      }
    },
    [products, extractImages]
  );

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

  if (loading) {
    return (
      <div className="w-full py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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

  // Lọc sản phẩm (tạm thời bỏ category rỗng để tránh lỗi logic)
  const displayProducts = products; // Có thể thêm logic lọc sau

  return (
    <div className="w-full xl:px-20 lg:px-10 md:px-4 px-2 mt-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-left">SẢN PHẨM NỔI BẬT</h2>
        <Link
          href={`/category/ao`}
          className="text-right text-lg text-gray-500 hover:underline hover:text-gray-700"
        >
          Xem thêm
        </Link>
      </div>

      <div className="relative mt-6">
        <Slider ref={sliderRef} {...settings}>
          {displayProducts.map((product) => (
            <div key={product.id}>
              <ProductCard
                product={{
                  id: product.id,
                  name: product.name,
                  featured: product.featured,
                  colors: product.colors,
                  variants: product.variants,
                  price: product.price,
                  hasDiscount: product.hasDiscount,
                }}
                selectedColor={selectedColors[product.id] || product.colors[0]}
                productImage={productImages[product.id] || ""}
                secondaryImage={secondaryImages[product.id] || ""}
                onColorSelect={handleColorSelect}
              />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default LatestProducts;
