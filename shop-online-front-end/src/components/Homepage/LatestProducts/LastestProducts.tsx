"use client";

import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import Link from "next/link";
import { PrevArrow, NextArrow } from "@/utils/CustomArrowSlick";
import ProductCard from "@/components/ProductCard/ProductCard";
import { ProductService } from "@/services/ProductService";
import { Product, VariantDetail } from "@/types/product";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

// ProductSkeleton component for loading state
const ProductSkeleton = () => (
  <div className="rounded-lg p-4 h-full">
    <div className="w-full aspect-[2/3] bg-gray-200 animate-pulse rounded-md"></div>
    <div className="h-4 bg-gray-200 animate-pulse rounded mt-4 w-3/4"></div>
    <div className="h-4 bg-gray-200 animate-pulse rounded mt-2 w-1/2"></div>
    <div className="flex gap-2 mt-4">
      <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
      <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
      <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
    </div>
  </div>
);

const LatestProducts: React.FC = () => {
  const router = useRouter();
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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

        // Set all states in one batch to reduce re-renders
        setProducts(response.products);
        setSelectedColors(initialColors);
        setProductImages(initialImages);
        setSecondaryImages(initialSecondaryImages);

        // Create a small delay before marking loading as complete
        // to ensure images have time to start loading
        setTimeout(() => {
          setLoading(false);
          setInitialLoadComplete(true);
        }, 100);
      } catch {
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
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

  // Lọc sản phẩm nếu có featured thì hiển thị
  const displayProducts = products.filter((p) => p.featured);

  // Pre-render skeleton layout with proper dimensions to prevent layout shift
  const skeletonItems = Array(5)
    .fill(0)
    .map((_, i) => (
      <div key={`skeleton-${i}`} className="px-2">
        <ProductSkeleton />
      </div>
    ));

  return (
    <div className="w-full xl:px-20 lg:px-10 md:px-4 px-2 mt-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-left">SẢN PHẨM NỔI BẬT</h2>
        {initialLoadComplete && !error && (
          <Link
            href={`/category/ao`}
            className="text-right text-lg text-gray-500 hover:underline hover:text-gray-700"
          >
            Xem thêm
          </Link>
        )}
      </div>

      {loading ? (
        <div className="relative mt-6">
          <Slider ref={sliderRef} {...settings}>
            {skeletonItems}
          </Slider>
        </div>
      ) : error ? (
        <div className="w-full text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
            <div className="text-red-600 mb-2 text-xl">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              onClick={() => router.refresh()}
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : (
        <div className="relative mt-6">
          <Slider ref={sliderRef} {...settings}>
            {displayProducts.map((product) => (
              <div key={product.id} className="px-2">
                <ProductCard
                  product={{
                    id: product.id,
                    name: product.name,
                    featured: product.featured,
                    colors: product.colors,
                    variants: product.variants,
                    price: product.price,
                  }}
                  selectedColor={
                    selectedColors[product.id] || product.colors[0]
                  }
                  productImage={productImages[product.id] || ""}
                  secondaryImage={secondaryImages[product.id] || ""}
                  onColorSelect={handleColorSelect}
                />
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default LatestProducts;
