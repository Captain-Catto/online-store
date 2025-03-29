"use client";

import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import { fetchData } from "../../../util/fetchData";
import { PrevArrow, NextArrow } from "../../../util/CustomArrowSlick";
import Link from "next/link";
import ProductCard from "../../ProductCard/ProductCard";
import { Product } from "../../ProductCard/ProductInterface";

const LatestProducts: React.FC = () => {
  const sliderRef = useRef<Slider>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedColors, setSelectedColors] = useState<{
    [productId: number]: string;
  }>({});
  const [productImages, setProductImages] = useState<{
    [productId: number]: string;
  }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetchData<Product[]>("/api/products");
        console.log("Fetched products:", data);

        // Xử lý dữ liệu sau khi fetch
        const initialColors: { [productId: number]: string } = {};
        const initialImages: { [productId: number]: string } = {};

        data.forEach((product) => {
          // Thiết lập màu mặc định cho mỗi sản phẩm (màu đầu tiên)
          if (product.variants.colors.length > 0) {
            const defaultColor = product.variants.colors[0];
            initialColors[product.id] = defaultColor;

            // Lấy hình ảnh đầu tiên của màu mặc định
            const detail = product.variants.details[defaultColor];
            if (detail && detail.images.length > 0) {
              initialImages[product.id] = detail.images[0];
            }
          }
        });

        setProducts(data);
        setSelectedColors(initialColors);
        setProductImages(initialImages);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleColorSelect = (productId: number, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));

    // Cập nhật hình ảnh khi chọn màu mới
    const product = products.find((p) => p.id === productId);
    if (product) {
      const detail = product.variants.details[color];
      if (detail && detail.images.length > 0) {
        setProductImages((prev) => ({
          ...prev,
          [productId]: detail.images[0],
        }));
      }
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      { breakpoint: 1440, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
    ],
  };

  // Lọc sản phẩm mới nhất (sản phẩm có category "Hàng mới")
  const latestProducts = products.filter((product) =>
    product.categories.some((category) => category.name === "Áo")
  );

  // Sử dụng latestProducts nếu có, nếu không thì sử dụng tất cả sản phẩm
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
      <div className="relative">
        <Slider ref={sliderRef} {...settings}>
          {displayProducts.map((product) => (
            <div key={product.id} className="p-2">
              <ProductCard
                product={product}
                selectedColor={selectedColors[product.id]}
                productImage={productImages[product.id]}
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
