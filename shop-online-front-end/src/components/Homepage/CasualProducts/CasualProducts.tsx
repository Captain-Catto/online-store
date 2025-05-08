"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Slider from "react-slick";
import Link from "next/link";
import { PrevArrow, NextArrow } from "@/utils/CustomArrowSlick";
import ProductCard from "@/components/ProductCard/ProductCard";
import { ProductService } from "@/services/ProductService";
import { Product, SimpleProduct } from "@/types/product";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

const CasualProducts: React.FC = () => {
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

  // hàm lấy hình ảnh (giống như trong LatestProducts)
  const extractImages = useCallback(
    (variant: { images: { isMain: boolean; url: string }[] }) => {
      if (!variant?.images || variant.images.length === 0) {
        return { mainImage: null, secondaryImage: null };
      }

      const mainImage =
        variant.images.find(
          (img: { isMain: boolean; url: string }) => img.isMain
        ) || variant.images[0];
      let secondaryImage = null;

      if (variant.images.length > 1) {
        secondaryImage = variant.images.find(
          (img: { isMain: boolean; url: string }) => img !== mainImage
        );
      }

      return {
        mainImage: mainImage ? mainImage.url : null,
        secondaryImage: secondaryImage ? secondaryImage.url : null,
      };
    },
    []
  );

  useEffect(() => {
    const fetchCasualProducts = async () => {
      try {
        setLoading(true);
        // Gọi API lấy sản phẩm casual (category ID 3)
        const response = await ProductService.getProductsByCategory(1);

        const initialColors: { [key: number]: string } = {};
        const initialImages: { [key: number]: string } = {};
        const initialSecondaryImages: { [key: number]: string } = {};
        console.log("san pham", response.products);
        // Xử lý dữ liệu từ API
        response.products.forEach((product: Product) => {
          if (product.colors && product.colors.length > 0) {
            const defaultColor = product.colors[0];
            initialColors[product.id] = defaultColor;

            if (defaultColor && product.variants[defaultColor]) {
              const variantDetail = product.variants[defaultColor];
              const { mainImage, secondaryImage } =
                extractImages(variantDetail);

              if (mainImage) {
                initialImages[product.id] = mainImage;
              }

              if (secondaryImage) {
                initialSecondaryImages[product.id] = secondaryImage;
              }
            }
          }
        });

        setProducts(response.products);
        setSelectedColors(initialColors);
        setProductImages(initialImages);
        setSecondaryImages(initialSecondaryImages);
      } catch (error) {
        console.error("Failed to fetch casual products:", error);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCasualProducts();
  }, [extractImages]);

  // Handler khi người dùng chọn màu khác
  const handleColorSelect = useCallback(
    (productId: number, color: string) => {
      setSelectedColors((prev) => ({ ...prev, [productId]: color }));

      const product = products.find((p) => p.id === productId);

      if (product?.variants[color]) {
        const variantDetail = product.variants[color];
        const { mainImage, secondaryImage } = extractImages(variantDetail);

        if (mainImage) {
          setProductImages((prev) => ({
            ...prev,
            [productId]: mainImage,
          }));
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

  return (
    <div className="w-full xl:px-20 lg:px-10 md:px-4 px-2 mt-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-left">
          SẢN PHẨM MẶC HẰNG NGÀY
        </h2>
        {!loading && !error && (
          <Link
            href="/categories?suitability=casual"
            className="text-right text-lg text-gray-500 hover:underline hover:text-gray-700"
          >
            Xem thêm
          </Link>
        )}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center items-center">
          <LoadingSpinner size="lg" text="Đang tải sản phẩm..." />
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
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : (
        <div className="relative mt-6">
          <Slider ref={sliderRef} {...settings}>
            {products.map((product) => {
              const color = selectedColors[product.id] || product.colors[0];

              // Sử dụng SimpleProduct cho ProductCard
              const simpleProduct: SimpleProduct = {
                id: product.id,
                name: product.name,
                featured: product.featured,
                colors: product.colors,
                variants: product.variants,
                price: product.variants[color]?.price || 0,
              };

              return (
                <div key={product.id} className="p-2">
                  <ProductCard
                    product={simpleProduct}
                    selectedColor={color}
                    productImage={productImages[product.id] || ""}
                    secondaryImage={secondaryImages[product.id] || ""}
                    onColorSelect={handleColorSelect}
                  />
                </div>
              );
            })}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default CasualProducts;
