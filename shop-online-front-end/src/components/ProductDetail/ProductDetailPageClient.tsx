"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { Product } from "@/types/product";
import { useToast } from "@/utils/useToast";
import { ProductService } from "@/services/ProductService";
import { getColorCode } from "@/utils/colorUtils";
import WishlistButton from "@/components/Product/WishlistButton";
import ProductDescription from "@/components/Product/ProductDescription";
import { useCart } from "@/contexts/CartContext";
import BreadcrumbTrail from "@/components/Breadcrumb/BreadcrumbTrail";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

interface ProductDetailPageClientProps {
  productId: string;
  initialProduct?: Product | null;
}

export default function ProductDetailPageClient({
  productId,
  initialProduct,
}: ProductDetailPageClientProps) {
  const { addToCart } = useCart();
  const { showToast, Toast } = useToast();
  const { breadcrumbs } = useBreadcrumb("product", productId);

  // Sử dụng initialProduct làm giá trị ban đầu nếu có
  const [product, setProduct] = useState<Product | null>(
    initialProduct || null
  );
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [colorImages, setColorImages] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [stockCount, setStockCount] = useState<number>(0);

  useEffect(() => {
    // Nếu đã có initialProduct, thiết lập các giá trị ban đầu
    if (initialProduct) {
      setInitialProductData(initialProduct);
    } else {
      // Nếu không có initialProduct, fetch từ API
      const getProduct = async () => {
        try {
          setLoading(true);

          // Gọi API để lấy dữ liệu sản phẩm
          const productData = await ProductService.getProductById(productId);
          console.log("Product data:", productData);

          if (!productData) {
            setError("Không tìm thấy sản phẩm");
            setLoading(false);
            return;
          }

          setProduct(productData);
          setInitialProductData(productData);
          setLoading(false);
        } catch (err) {
          console.error("Error loading product:", err);
          setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
          setLoading(false);
        }
      };

      getProduct();
    }
  }, [productId, initialProduct]);

  // Hàm thiết lập dữ liệu ban đầu cho sản phẩm
  const setInitialProductData = (productData: Product) => {
    // Set màu sắc ban đầu nếu có
    if (productData.colors && productData.colors.length > 0) {
      const initialColor = productData.colors[0];
      setSelectedColor(initialColor);

      // Lấy dữ liệu của variant
      const variantDetail = productData.variants[initialColor];
      if (variantDetail) {
        // Lấy hình ảnh cho màu đầu tiên
        const images: string[] = variantDetail.images.map(
          (img: { url: string }) => img.url
        );
        setColorImages(images);

        // Set ảnh đầu tiên làm ảnh hiện tại
        if (images.length > 0) {
          setCurrentImage(images[0]);
        }

        // Lấy kích thước có sẵn cho màu đã chọn
        const sizes = variantDetail.availableSizes || [];
        setAvailableSizes(sizes);

        // Set kích thước đầu tiên
        if (sizes.length > 0) {
          setSelectedSize(sizes[0]);

          // Cập nhật số lượng tồn kho
          const stockCount = variantDetail.inventory?.[sizes[0]] || 0;
          setStockCount(stockCount);
        }
      }
    }
  };

  // Copy toàn bộ hàm xử lý từ file hiện tại
  const handleColorChange = (color: string) => {
    setSelectedColor(color);

    if (!product) return;

    // Cập nhật dữ liệu dựa trên variant
    const variantDetail = product.variants[color];
    if (variantDetail) {
      // Cập nhật danh sách ảnh cho màu mới
      const images = variantDetail.images.map((img) => img.url);
      setColorImages(images);

      // Set ảnh đầu tiên làm ảnh hiện tại
      if (images.length > 0) {
        setCurrentImage(images[0]);
      }

      // Lấy kích thước cho màu mới
      const sizes = variantDetail.availableSizes || [];
      setAvailableSizes(sizes);

      // Kiểm tra nếu kích thước hiện tại không có trong màu mới
      if (!sizes.includes(selectedSize) && sizes.length > 0) {
        setSelectedSize(sizes[0]);

        // Cập nhật số lượng tồn kho
        const stockCount = variantDetail.inventory?.[sizes[0]] || 0;
        setStockCount(stockCount);
      } else if (sizes.includes(selectedSize)) {
        // Cập nhật số lượng tồn kho nếu kích thước vẫn hợp lệ
        const stockCount = variantDetail.inventory?.[selectedSize] || 0;
        setStockCount(stockCount);
      }
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);

    if (!product || !selectedColor) return;

    // Cập nhật số lượng tồn kho
    const variantDetail = product.variants[selectedColor];
    if (variantDetail) {
      const stockCount = variantDetail.inventory?.[size] || 0;
      setStockCount(stockCount);
    }
  };

  // Handle changing displayed image
  const handleImageClick = (image: string) => {
    setCurrentImage(image);
  };

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (
      product?.variants &&
      selectedColor &&
      product.variants[selectedColor]?.price &&
      product.variants[selectedColor]?.originalPrice
    ) {
      const price = product.variants[selectedColor].price;
      const originalPrice = product.variants[selectedColor].originalPrice;

      // Chỉ tính toán khi originalPrice lớn hơn price
      if (originalPrice > price) {
        return Math.round(100 - (price / originalPrice) * 100);
      }
    }
    return 0;
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Kiểm tra có chọn màu và size chưa
    if (!selectedColor) {
      showToast("Vui lòng chọn màu sắc!", { type: "warning" });
      return;
    }

    if (!selectedSize) {
      showToast("Vui lòng chọn kích thước!", { type: "warning" });
      return;
    }
    // kiểm tra nếu số lượng tồn kho = 0 thì hiển thị
    if (stockCount == 0) {
      showToast(`Không còn sản phẩm`, { type: "warning" });
      return;
    }
    // Kiểm tra số lượng tồn kho
    if (quantity > stockCount) {
      showToast(`Chỉ còn ${stockCount} sản phẩm có sẵn!`, { type: "warning" });
      return;
    }

    // Lấy giá từ variant
    const variantDetail = product.variants[selectedColor];
    const price = variantDetail?.price;
    const productDetailId = variantDetail?.detailId;

    console.log("Variant detail:", variantDetail);
    console.log("ProductDetailId:", productDetailId);

    // Kiểm tra productDetailId
    if (!productDetailId) {
      console.error(
        "Thiếu productDetailId cho sản phẩm:",
        product.name,
        selectedColor
      );
      showToast("Đã xảy ra lỗi khi thêm sản phẩm", { type: "error" });
      return;
    }

    // Thêm vào giỏ hàng bằng utility function
    const cartItem = {
      id: `${product.id}-${selectedColor}-${selectedSize}`, // Tạo ID duy nhất
      productId: product.id,
      productDetailId: productDetailId,
      name: product.name,
      color: selectedColor,
      size: selectedSize,
      quantity,
      price: price,
      image: currentImage,
      variant: variantDetail,
    };

    // Sử dụng addToCart từ Context
    addToCart(cartItem);

    // Thông báo thành công
    showToast(`Đã thêm vào giỏ hàng thành công!`, {
      type: "cart",
      product: {
        name: product.name,
        image: currentImage,
        color: selectedColor,
        size: selectedSize,
        quantity: quantity,
        price: price,
        originalPrice: variantDetail?.originalPrice,
      },
      duration: 5000,
    });
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <BreadcrumbTrail items={breadcrumbs} />

        {/* Content - hiển thị tùy theo trạng thái */}
        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <LoadingSpinner size="lg" text="Đang tải thông tin sản phẩm..." />
          </div>
        ) : error || !product ? (
          <div className="py-12 flex justify-center items-center">
            <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-red-600">Lỗi</h2>
              <p className="mb-6 text-gray-700">
                {error || "Không tìm thấy sản phẩm"}
              </p>
              <Link
                href="/products"
                className="mt-4 inline-block px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Quay lại danh sách sản phẩm
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Product content */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Product Images */}
              <div className="lg:w-[55%] w-full">
                <div className="flex flex-col sm:flex-row">
                  {/* Container hình nhỏ - responsive trên các kích thước màn hình */}
                  <div className="flex sm:flex-col order-last sm:order-first overflow-x-auto sm:overflow-y-auto scrollbar-hide gap-2 py-2 sm:py-0 sm:pr-1">
                    {colorImages.map(
                      (image, index) =>
                        image && ( // Thêm check cho mỗi image
                          <div
                            key={index}
                            className={`relative cursor-pointer rounded-lg shrink-0 h-16 w-16 sm:w-20 sm:h-20 ${
                              currentImage === image ? "" : "opacity-40"
                            } transition-all duration-250`}
                            onClick={() => handleImageClick(image)}
                          >
                            <Image
                              src={image}
                              alt={`${product?.name || "Product"} - Image ${
                                index + 1
                              }`}
                              fill
                              sizes="80px"
                              className="object-cover rounded-lg p-0.5"
                            />
                          </div>
                        )
                    )}
                  </div>

                  {/* Hình ảnh chính */}
                  {currentImage && ( // Chỉ render khi có currentImage
                    <div className="relative flex-1 aspect-square sm:aspect-[5/6] w-full rounded-xl">
                      <Image
                        src={currentImage}
                        alt={product?.name || "Product image"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="rounded-lg object-cover transition-opacity duration-300"
                        priority
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="lg:w-[45%] space-y-6">
                {/* Sao chép toàn bộ phần product info từ file hiện tại */}
                <div className="space-y-3">
                  {/* Tên sản phẩm */}
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {product.name}
                  </h1>

                  {/* Giá & discount */}
                  <div className="flex items-center gap-2">
                    {product.variants &&
                      selectedColor &&
                      product.variants[selectedColor]?.originalPrice &&
                      product.variants[selectedColor].originalPrice >
                        product.variants[selectedColor].price && (
                        <del className="text-base text-gray-500">
                          {product.variants[
                            selectedColor
                          ].originalPrice.toLocaleString("vi-VN")}
                          đ
                        </del>
                      )}
                  </div>

                  <div className="flex items-center gap-2">
                    {product.variants && selectedColor && (
                      <ins className="text-xl font-bold text-gray-800 no-underline">
                        {product.variants[selectedColor].price.toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </ins>
                    )}

                    {product.variants &&
                      selectedColor &&
                      product.variants[selectedColor]?.price &&
                      product.variants[selectedColor]?.originalPrice &&
                      product.variants[selectedColor].originalPrice >
                        product.variants[selectedColor].price && (
                        <span className="text-sm px-2 py-0.5 bg-[#ff33331a] rounded-full text-[#F33]">
                          -{calculateDiscount()}%
                        </span>
                      )}
                  </div>
                </div>

                <div className="h-[1px] w-full border border-[#0000001A]"></div>

                {/* Chọn màu sắc */}
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">Chọn màu sắc</h2>
                  <div className="flex items-center gap-3">
                    {product.colors?.map((color, index) => (
                      <div
                        key={index}
                        className={`w-13 h-8 rounded-full border cursor-pointer flex items-center justify-center ${
                          selectedColor === color
                            ? "ring-2 ring-black ring-offset-3"
                            : ""
                        }`}
                        style={{
                          backgroundColor: getColorCode(color) || color,
                        }}
                        onClick={() => handleColorChange(color)}
                      >
                        {selectedColor === color && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M15.9463 5.89809L7.48459 14.3598C7.41089 14.4337 7.32332 14.4924 7.22689 14.5325C7.13047 14.5725 7.02708 14.5931 6.92268 14.5931C6.81827 14.5931 6.71489 14.5725 6.61846 14.5325C6.52204 14.4924 6.43447 14.4337 6.36077 14.3598L2.65878 10.6578C2.58498 10.584 2.52645 10.4964 2.48652 10.4C2.44658 10.3036 2.42603 10.2002 2.42603 10.0959C2.42603 9.99153 2.44658 9.8882 2.48652 9.79179C2.52645 9.69537 2.58498 9.60777 2.65878 9.53398C2.73257 9.46019 2.82017 9.40166 2.91658 9.36172C3.01299 9.32178 3.11633 9.30123 3.22069 9.30123C3.32504 9.30123 3.42838 9.32178 3.52479 9.36172C3.6212 9.40166 3.7088 9.46019 3.7826 9.53398L6.92334 12.6747L14.8238 4.7756C14.9728 4.62657 15.1749 4.54285 15.3857 4.54285C15.5965 4.54285 15.7986 4.62657 15.9476 4.7756C16.0966 4.92462 16.1804 5.12675 16.1804 5.33751C16.1804 5.54826 16.0966 5.75039 15.9476 5.89942L15.9463 5.89809Z"
                              fill="white"
                            />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-[1px] w-full border border-[#0000001A]"></div>

                {/* Chọn kích thước */}
                <div className="space-y-4">
                  <h2 className="text-lg font-medium">Chọn kích thước</h2>
                  <div className="flex items-center justify-start gap-3 flex-wrap">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        className={`px-8 py-2.5 rounded-xl border text-sm cursor-pointer    
                      ${
                        selectedSize === size
                          ? "bg-black text-white"
                          : "hover:bg-gray-200"
                      }`}
                        onClick={() => handleSizeChange(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {/* báo số tồn kho của size và màu đó */}
                  <div className="text-gray-500 text-sm">
                    {stockCount > 0
                      ? `${stockCount} sản phẩm có sẵn`
                      : "Hết hàng"}
                  </div>
                </div>

                <div className="h-[1px] w-full border border-[#0000001A]"></div>

                {/* Số lượng và thêm vào giỏ hàng */}
                {/* nếu stockCount = 0 thì disable hết nút trừ nút yêu thích */}
                <div className="flex flex-wrap gap-5 w-full">
                  <div className="px-5 py-4 flex-1 flex items-center justify-between gap-4 bg-[#F0F0F0] rounded-full">
                    <button
                      className="disabled:opacity-50 cursor-pointer"
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                      disabled={quantity <= 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M17.8125 10C17.8125 10.2486 17.7137 10.4871 17.5379 10.6629C17.3621 10.8387 17.1236 10.9375 16.875 10.9375H3.125C2.87636 10.9375 2.6379 10.8387 2.46209 10.6629C2.28627 10.4871 2.1875 10.2486 2.1875 10C2.1875 9.75136 2.28627 9.5129 2.46209 9.33709C2.6379 9.16127 2.87636 9.0625 3.125 9.0625H16.875C17.1236 9.0625 17.3621 9.16127 17.5379 9.33709C17.7137 9.5129 17.8125 9.75136 17.8125 10Z"
                          fill="black"
                        />
                      </svg>
                    </button>
                    <input
                      type="text"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setQuantity(val);
                        }
                      }}
                      className="w-9 text-center bg-transparent"
                    />
                    <button
                      className="cursor-pointer"
                      onClick={() => setQuantity((prev) => prev + 1)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M17.8125 10C17.8125 10.2486 17.7137 10.4871 17.5379 10.6629C17.3621 10.8387 17.1236 10.9375 16.875 10.9375H10.9375V16.875C10.9375 17.1236 10.8387 17.3621 10.6629 17.5379C10.4871 17.7137 10.2486 17.8125 10 17.8125C9.75136 17.8125 9.5129 17.7137 9.33709 17.5379C9.16127 17.3621 9.0625 17.1236 9.0625 16.875V10.9375H3.125C2.87636 10.9375 2.6379 10.8387 2.46209 10.6629C2.28627 10.4871 2.1875 10.2486 2.1875 10C2.1875 9.75136 2.28627 9.5129 2.46209 9.33709C2.6379 9.16127 2.87636 9.0625 3.125 9.0625H9.0625V3.125C9.0625 2.87636 9.16127 2.6379 9.33709 2.46209C9.5129 2.28627 9.75136 2.1875 10 2.1875C10.2486 2.1875 10.4871 2.28627 10.6629 2.46209C10.8387 2.6379 10.9375 2.87636 10.9375 3.125V9.0625H16.875C17.1236 9.0625 17.3621 9.16127 17.5379 9.33709C17.7137 9.5129 17.8125 9.75136 17.8125 10Z"
                          fill="black"
                        />
                      </svg>
                    </button>
                  </div>
                  <button
                    className="flex-2 text-white bg-black text-sm px-9 py-4 rounded-full hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      handleAddToCart();
                    }}
                  >
                    Thêm vào giỏ hàng
                  </button>
                  {/* Thêm nút yêu thích */}
                  <WishlistButton
                    productId={parseInt(productId as string)}
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
                    showText={true}
                  />
                </div>
              </div>
            </div>
            <ProductDescription
              description={product.description}
              material={
                Array.isArray(product.material)
                  ? product.material.join(", ")
                  : product.material
              }
              brand={product.brand}
              sku={product.sku}
            />
          </>
        )}
      </main>
      <Footer />
      {Toast}
    </div>
  );
}
