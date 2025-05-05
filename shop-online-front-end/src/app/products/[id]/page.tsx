"use client";

import { useEffect, useState, use } from "react";
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

interface ProductParams {
  id: string;
}

export default function Home({ params }: { params: unknown }) {
  const unwrappedParams = use(params as Promise<ProductParams>);
  const productId = unwrappedParams.id;
  const { addToCart } = useCart();
  const { showToast, Toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [colorImages, setColorImages] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [stockCount, setStockCount] = useState<number>(0);

  useEffect(() => {
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

        setLoading(false);
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    getProduct();
  }, [productId]);

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

  // Render stars for rating
  // const renderStars = (rating?: number) => {
  //   if (!rating) return null;

  //   const fullStars = Math.floor(rating);
  //   const halfStar = rating % 1 !== 0;
  //   const stars = [];

  //   for (let i = 0; i < fullStars; i++) {
  //     stars.push(
  //       <svg
  //         key={`full-${i}`}
  //         xmlns="http://www.w3.org/2000/svg"
  //         width="19"
  //         height="17"
  //         viewBox="0 0 19 17"
  //         fill="none"
  //       >
  //         <path
  //           d="M9.65059 0.255005L12.2698 5.89491L18.4431 6.6431L13.8886 10.8769L15.0846 16.9793L9.65059 13.956L4.21655 16.9793L5.41263 10.8769L0.858134 6.6431L7.03139 5.89491L9.65059 0.255005Z"
  //           fill="#FFC633"
  //         />
  //       </svg>
  //     );
  //   }

  //   if (halfStar) {
  //     stars.push(
  //       <svg
  //         key="half"
  //         xmlns="http://www.w3.org/2000/svg"
  //         width="9"
  //         height="17"
  //         viewBox="0 0 9 17"
  //         fill="none"
  //       >
  //         <path
  //           d="M3.56595 16.9793L8.99999 13.956V0.255005L6.38079 5.89491L0.207535 6.6431L4.76203 10.8769L3.56595 16.9793Z"
  //           fill="#FFC633"
  //         />
  //       </svg>
  //     );
  //   }

  //   return stars;
  // };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lỗi</h2>
          <p>{error || "Không tìm thấy sản phẩm"}</p>
          <Link
            href="/products"
            className="mt-4 inline-block px-6 py-2 bg-black text-white rounded-full"
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

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
      duration: 4000,
    });
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="text-gray-600 hover:text-black">
            Home
          </Link>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="15"
            viewBox="0 0 14 15"
            fill="none"
          >
            <path
              d="M5.71433 2.6607L10.0893 7.0357C10.1505 7.09666 10.1991 7.16911 10.2322 7.24888C10.2653 7.32865 10.2823 7.41417 10.2823 7.50054C10.2823 7.58691 10.2653 7.67243 10.2322 7.7522C10.1991 7.83197 10.1505 7.90442 10.0893 7.96538L5.71433 12.3404C5.59105 12.4637 5.42384 12.5329 5.24949 12.5329C5.07514 12.5329 4.90793 12.4637 4.78464 12.3404C4.66136 12.2171 4.5921 12.0499 4.5921 11.8755C4.5921 11.7012 4.66136 11.534 4.78464 11.4107L8.69535 7.49999L4.7841 3.58929C4.66081 3.46601 4.59155 3.2988 4.59155 3.12445C4.59155 2.9501 4.66081 2.78289 4.7841 2.6596C4.90738 2.53632 5.07459 2.46706 5.24894 2.46706C5.42329 2.46706 5.5905 2.53632 5.71379 2.6596L5.71433 2.6607Z"
              fill="black"
              fillOpacity="0.6"
            />
          </svg>
          <Link href="/categories" className="text-gray-600 hover:text-black">
            Categories
          </Link>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="15"
            viewBox="0 0 14 15"
            fill="none"
          >
            <path
              d="M5.71433 2.6607L10.0893 7.0357C10.1505 7.09666 10.1991 7.16911 10.2322 7.24888C10.2653 7.32865 10.2823 7.41417 10.2823 7.50054C10.2823 7.58691 10.2653 7.67243 10.2322 7.7522C10.1991 7.83197 10.1505 7.90442 10.0893 7.96538L5.71433 12.3404C5.59105 12.4637 5.42384 12.5329 5.24949 12.5329C5.07514 12.5329 4.90793 12.4637 4.78464 12.3404C4.66136 12.2171 4.5921 12.0499 4.5921 11.8755C4.5921 11.7012 4.66136 11.534 4.78464 11.4107L8.69535 7.49999L4.7841 3.58929C4.66081 3.46601 4.59155 3.2988 4.59155 3.12445C4.59155 2.9501 4.66081 2.78289 4.7841 2.6596C4.90738 2.53632 5.07459 2.46706 5.24894 2.46706C5.42329 2.46706 5.5905 2.53632 5.71379 2.6596L5.71433 2.6607Z"
              fill="black"
              fillOpacity="0.6"
            />
          </svg>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Product content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="lg:w-1/2">
            {/* Container chính - flex-col dưới 640px, flex-row trên 640px */}
            <div className="flex gap-1 w-full h-full flex-col sm:flex-row">
              {/* Container hình nhỏ - ngang dưới 640px, dọc trên 640px */}
              <div className="flex gap-2 flex-row sm:flex-col sm:w-1/16 md:w-1/12 lg:w-1/8 order-last sm:order-first">
                {colorImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer rounded-lg w-full h-20 ${
                      currentImage === image ? "ring-2 ring-black" : ""
                    }`}
                    onClick={() => handleImageClick(image)}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>

              {/* Hình ảnh chính - full width ở mọi kích thước màn hình */}
              <div className="relative h-[400px] lg:h-auto mb-3 sm:mb-0 w-full">
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 space-y-6">
            <div className="space-y-3">
              {/* Tên sản phẩm */}
              <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>

              {/* Hiển thị rating dạng sao */}
              {/* {product.rating && (
                <div className="flex items-center gap-4">
                  {renderStars(product.rating.value)}
                  <span className="font-semibold">
                    {product.rating.value}/5
                  </span>
                  {product.rating.count && (
                    <span className="text-gray-500">
                      ({product.rating.count} đánh giá)
                    </span>
                  )}
                </div>
              )} */}

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
                    style={{ backgroundColor: getColorCode(color) || color }}
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
                {stockCount} sản phẩm có sẵn
              </div>
            </div>

            <div className="h-[1px] w-full border border-[#0000001A]"></div>

            {/* Số lượng và thêm vào giỏ hàng */}
            <div className="flex flex-wrap gap-5 w-full">
              <div className="px-5 py-4 flex-1 flex items-center justify-between gap-4 bg-[#F0F0F0] rounded-full">
                <button
                  className="disabled:opacity-50 cursor-pointer"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
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
          material={product.material}
          brand={product.brand}
          sku={product.sku}
        />
        {/* Thêm phần đề xuất sản phẩm tương tự ở đây nếu cần */}
      </main>
      <Footer />
      {Toast}
    </div>
  );
}
