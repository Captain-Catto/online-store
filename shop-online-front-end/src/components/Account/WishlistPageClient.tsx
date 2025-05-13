"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { WishlistService } from "@/services/WishlistService";
import { useToast } from "@/utils/useToast";
import { AuthService } from "@/services/AuthService";
import { formatCurrency } from "@/utils/currencyUtils";
import { CartItem } from "@/types/cart";
import { WishlistItem } from "@/types/wishlist";
import { useCart } from "@/contexts/CartContext";
import { colorToVietnamese } from "@/utils/colorUtils";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

// Component Modal chi tiết sản phẩm
const ProductDetailModal = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: {
  item: WishlistItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}) => {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentTab, setCurrentTab] = useState("description");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { showToast } = useToast();

  const product = item?.product;

  // First useEffect - runs when product changes
  useEffect(() => {
    if (product && product.details && product.details.length > 0) {
      // Thiết lập màu mặc định
      setSelectedColor(product.details[0].color);

      // Tìm size có tồn kho > 0
      const defaultDetail = product.details[0];
      const inStockInventory = defaultDetail.inventories?.find(
        (inv) => inv.stock > 0
      );

      if (inStockInventory) {
        setSelectedSize(inStockInventory.size);
      } else if (
        defaultDetail.inventories &&
        defaultDetail.inventories.length > 0
      ) {
        setSelectedSize(defaultDetail.inventories[0].size);
      }

      setQuantity(1);
      setSelectedImageIndex(0);
    }
  }, [product]);

  // Second useEffect - runs when selectedColor changes
  useEffect(() => {
    if (product && product.details) {
      const detail =
        product.details.find((d) => d.color === selectedColor) ||
        product.details[0];

      // Tìm size có tồn kho
      const inStockInventory = detail.inventories?.find((inv) => inv.stock > 0);

      if (inStockInventory) {
        setSelectedSize(inStockInventory.size);
      } else if (detail.inventories && detail.inventories.length > 0) {
        setSelectedSize(detail.inventories[0].size);
      } else {
        setSelectedSize("");
      }

      // Reset ảnh đang chọn
      setSelectedImageIndex(0);
    }
  }, [selectedColor, product]);

  if (!isOpen || !product) return null;

  // Tất cả các tính toán phụ thuộc vào state/props nên đặt sau hooks
  const colors = [...new Set(product.details.map((detail) => detail.color))];
  const selectedDetail =
    product.details.find((detail) => detail.color === selectedColor) ||
    product.details[0];
  const images = selectedDetail.images || [];
  const currentImage =
    images.length > 0
      ? images[selectedImageIndex].url
      : "/images/placeholder.jpg";
  const inventories = selectedDetail.inventories || [];
  // tạo map ánh xạ từ size sang thứ tự
  const sizeOrder = {
    XXS: 0,
    XS: 1,
    S: 2,
    M: 3,
    L: 4,
    XL: 5,
    XXL: 6,
    "2XL": 6, // Cùng giá trị với XXL
    "3XL": 7,
    "4XL": 8,
  };

  // lấy kích thước từ inventory và sắp xếp theo map
  const sizes: string[] = inventories
    .map((inv) => inv.size)
    .sort((a, b) => {
      // Trường hợp số nguyên (vd: 38, 39, 40 cho giày)
      if (!isNaN(Number(a)) && !isNaN(Number(b))) {
        return Number(a) - Number(b);
      }

      // Trường hợp chữ cái
      return (
        (sizeOrder[a as keyof typeof sizeOrder] !== undefined
          ? sizeOrder[a as keyof typeof sizeOrder]
          : 999) -
        (sizeOrder[b as keyof typeof sizeOrder] !== undefined
          ? sizeOrder[b as keyof typeof sizeOrder]
          : 999)
      );
    });

  const selectedInventory = inventories.find(
    (inv) => inv.size === selectedSize
  );
  const stock = selectedInventory?.stock || 0;

  // Xử lý khi thêm vào giỏ hàng
  const handleAddToCart = (): void => {
    // Kiểm tra còn hàng không
    if (!selectedSize) {
      showToast("Vui lòng chọn kích thước", { type: "error" });
      return;
    }

    if (stock <= 0) {
      showToast("Sản phẩm đã hết hàng", { type: "error" });
      return;
    }

    if (quantity > stock) {
      showToast("Số lượng vượt quá tồn kho", { type: "error" });
      return;
    }

    const cartItem: CartItem = {
      id: product.id.toString(),
      productId: product.id,
      productDetailId: selectedDetail.id,
      name: product.name,
      price: selectedDetail.price,
      originalPrice: selectedDetail.originalPrice,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      image: images.length > 0 ? images[0].url : "/images/placeholder.jpg",
    };
    console.log("img", images[0].url);

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-2">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Phần hình ảnh sản phẩm */}
          <div>
            <div className="relative h-80 md:h-96 bg-gray-100 rounded-lg mb-4">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>

            {/* Gallery ảnh sản phẩm */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative h-16 w-16 border rounded cursor-pointer hover:border-gray-400 ${
                      selectedImageIndex === index
                        ? "border-black"
                        : "border-gray-200"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} - ảnh ${index + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần thông tin sản phẩm */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-pink-600">
                  {formatCurrency(selectedDetail.price)}
                </p>
                {selectedDetail.originalPrice > selectedDetail.price && (
                  <p className="text-lg text-gray-500 line-through">
                    {formatCurrency(selectedDetail.originalPrice)}
                  </p>
                )}
              </div>
              {selectedDetail.originalPrice > selectedDetail.price && (
                <p className="text-sm text-pink-600 font-medium">
                  Tiết kiệm{" "}
                  {formatCurrency(
                    selectedDetail.originalPrice - selectedDetail.price
                  )}{" "}
                  (
                  {Math.round(
                    ((selectedDetail.originalPrice - selectedDetail.price) /
                      selectedDetail.originalPrice) *
                      100
                  )}
                  %)
                </p>
              )}
            </div>

            {/* Chọn màu sắc */}
            {colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Màu sắc</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    // Kiểm tra màu này có size nào còn hàng không
                    const detail = product.details.find(
                      (d) => d.color === color
                    );

                    const hasStock =
                      detail?.inventories?.some((inv) => inv.stock > 0) ||
                      false;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-md ${
                          selectedColor === color
                            ? "border-black bg-gray-100 font-medium"
                            : hasStock
                            ? "border-gray-300 hover:border-gray-400"
                            : "border-gray-200 text-gray-400 cursor-default"
                        }`}
                      >
                        {colorToVietnamese[color]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chọn kích thước */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Kích thước</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const inventory = inventories.find(
                      (inv) => inv.size === size
                    );
                    const isOutOfStock = (inventory?.stock || 0) <= 0;

                    return (
                      <button
                        key={size}
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={`px-4 py-2 border rounded-md ${
                          isOutOfStock
                            ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                            : selectedSize === size
                            ? "border-black bg-gray-100 font-medium"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chọn số lượng */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Số lượng</h3>
                {stock > 0 && (
                  <span className="text-sm text-gray-500">
                    Còn {stock} sản phẩm
                  </span>
                )}
              </div>
              <div className="flex items-center mb-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md"
                  disabled={stock <= 0}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Math.min(stock, Number(e.target.value) || 1))
                    )
                  }
                  disabled={stock <= 0}
                  className="w-16 h-10 text-center border-t border-b border-gray-300"
                />
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md"
                  disabled={stock <= 0}
                >
                  +
                </button>
              </div>
              {stock <= 0 && (
                <p className="text-sm text-red-600 mt-1">Hết hàng</p>
              )}
            </div>

            {/* Nút thêm vào giỏ hàng */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={stock <= 0 || !selectedSize}
                className={`w-full py-3 rounded-md text-white font-medium ${
                  stock <= 0 || !selectedSize
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800 transition-colors"
                }`}
              >
                {stock <= 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </button>

              <button
                onClick={onClose}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50"
              >
                Tiếp tục mua sắm
              </button>
            </div>

            {/* Thông tin bổ sung */}
            {product.description && (
              <div className="mt-8">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px space-x-8">
                    <button
                      onClick={() => setCurrentTab("description")}
                      className={`py-3 border-b-2 font-medium text-sm ${
                        currentTab === "description"
                          ? "border-black text-black"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Mô tả
                    </button>
                    <button
                      onClick={() => setCurrentTab("specifications")}
                      className={`py-3 border-b-2 font-medium text-sm ${
                        currentTab === "specifications"
                          ? "border-black text-black"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Thông số
                    </button>
                  </nav>
                </div>

                <div className="py-4">
                  {currentTab === "description" && (
                    <div className="prose prose-sm max-w-none">
                      {product.description ? (
                        <p>{product.description}</p>
                      ) : (
                        <p className="text-gray-500 italic">
                          Không có mô tả cho sản phẩm này
                        </p>
                      )}
                    </div>
                  )}

                  {currentTab === "specifications" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">Thương hiệu</div>
                        <div>{product.brand || "Không có thông tin"}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">Chất liệu</div>
                        <div>{product.material || "Không có thông tin"}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">Danh mục</div>
                        <div>
                          {product.categories && product.categories.length > 0
                            ? product.categories
                                .map((cat) => cat.name)
                                .join(", ")
                            : "Không có thông tin"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">Mã sản phẩm</div>
                        <div>{product.sku || "Không có thông tin"}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function WishlistPageClient() {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  // Thêm state cho modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);

  const router = useRouter();
  const { showToast, Toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = AuthService.isLoggedIn();
      if (!isLoggedIn) {
        router.push("/login?returnUrl=/account/wishlist");
        return;
      }
      fetchWishlist(1);
    };
    checkAuth();
  }, [router]);

  const fetchWishlist = async (page: number): Promise<void> => {
    try {
      setLoading(true);
      const data = await WishlistService.getWishlist(page, 10);
      setWishlistItems(data.items);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setError("Không thể tải danh sách yêu thích. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý chuyển trang
  const handlePageChange = (page: number) => {
    fetchWishlist(page);
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await WishlistService.removeFromWishlist(productId);
      setWishlistItems((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
      showToast("Đã xóa sản phẩm khỏi danh sách yêu thích", {
        type: "success",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      showToast("Không thể xóa sản phẩm. Vui lòng thử lại.", {
        type: "error",
      });
    }
  };

  // Mở modal chi tiết sản phẩm
  const openProductModal = (item: WishlistItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Thêm vào giỏ hàng từ modal
  const handleAddToCart = (cartItem: CartItem) => {
    addToCart(cartItem);
    showToast(`Đã thêm vào giỏ hàng thành công!`, {
      type: "cart",
      product: {
        name: cartItem.name,
        price: cartItem.price,
        originalPrice: cartItem.originalPrice,
        image: cartItem.image,
        color: cartItem.color,
        size: cartItem.size,
        quantity: cartItem.quantity,
      },
    });
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Danh sách yêu thích</h1>

          {loading ? (
            <LoadingSpinner size="lg" text="Đang tải danh sách yêu thích..." />
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-10">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                Danh sách yêu thích trống
              </h3>
              <p className="mt-2 text-gray-500">
                Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {wishlistItems.map((item) => {
                const product = item.product;
                const detail = product.details[0];
                const imageUrl =
                  item.product.details[0]?.images?.[0]?.url ||
                  "/images/placeholder.jpg";

                return (
                  <div
                    key={item.id}
                    className="product-container w-full rounded-lg flex-shrink-0 mx-auto flex flex-col relative p-2"
                  >
                    <div className="relative w-full aspect-[2/3]">
                      {/* nếu có Featured thì hiển thị */}
                      {product.featured && (
                        <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white px-3 py-1 text-xs font-semibold rounded-md">
                          Đáng mua
                        </div>
                      )}
                      <Link href={`/products/${product.id}`}>
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: "cover" }}
                          className="transition-transform "
                        />
                      </Link>
                      <button
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        title="Xóa khỏi yêu thích"
                      >
                        <svg
                          className="w-5 h-5 text-pink-600 fill-pink-600"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="block mt-2">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-end justify-between mb-4">
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(detail.price)}
                        </p>
                        {/* thêm tính toán  */}
                        {detail.originalPrice > detail.price && (
                          <span className="text-sm text-red-600 font-medium bg-red-50 px-2 py-1 rounded mr-2">
                            -
                            {Math.round(
                              ((detail.originalPrice - detail.price) /
                                detail.originalPrice) *
                                100
                            )}
                            %
                          </span>
                        )}
                        {detail.originalPrice > detail.price && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatCurrency(detail.originalPrice)}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {/* Thay đổi nút thêm vào giỏ hàng thành nút mở modal */}
                        <button
                          onClick={() => openProductModal(item)}
                          className="flex-1 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
                        >
                          Thêm vào giỏ
                        </button>
                        <Link
                          href={`/products/${product.id}`}
                          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Phân trang */}
        {!loading &&
          !error &&
          wishlistItems.length > 0 &&
          pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center">
                <button
                  className={`px-3 py-2 rounded-l-md border ${
                    pagination.hasPreviousPage
                      ? "bg-white hover:bg-gray-100"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={`px-4 py-2 border-t border-b ${
                      pagination.currentPage === page
                        ? "bg-black text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className={`px-3 py-2 rounded-r-md border ${
                    pagination.hasNextPage
                      ? "bg-white hover:bg-gray-100"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          )}
      </main>
      <Footer />

      {/* Modal chi tiết sản phẩm */}
      <ProductDetailModal
        item={selectedItem}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {Toast}
    </>
  );
}
