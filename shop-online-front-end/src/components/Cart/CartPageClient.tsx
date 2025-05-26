"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CartItems from "../../components/Cart/CartItems";
import OrderSummary from "../../components/Cart/OrderSummary";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useToast } from "@/utils/useToast";
import { useCart } from "@/contexts/CartContext";
import { CartService } from "@/services/CartService";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import BreadcrumbTrail from "../Breadcrumb/BreadcrumbTrail";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

export default function CartPageClient() {
  const router = useRouter();
  const { showToast, Toast } = useToast();
  const { breadcrumbs } = useBreadcrumb(
    "page",
    undefined,
    undefined,
    "Giỏ hàng"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  // Thêm state mới để theo dõi trạng thái tải ban đầu
  const [initialLoading, setInitialLoading] = useState(true);
  const {
    cartItems,
    cartCount,
    loading,
    handleUpdateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

  // Theo dõi khi nào quá trình tải ban đầu hoàn tất
  useEffect(() => {
    if (!loading && initialLoading) {
      setInitialLoading(false);
    }
  }, [loading, initialLoading]);

  // Tính subtotal bằng useMemo
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );
  }, [cartItems]);

  // Xử lý thay đổi số lượng
  const handleQuantityChange = useCallback(
    async (
      itemId: string,
      newQuantity: number,
      color: string,
      size: string
    ) => {
      const cartItem = cartItems.find(
        (item) =>
          item.id === itemId && item.color === color && item.size === size
      );

      if (cartItem) {
        try {
          await handleUpdateQuantity(cartItem, newQuantity);
          //thông báo cập nhật giỏ hàng thành công
          showToast("Cập nhật giỏ hàng thành công", {
            type: "success",
          });
        } catch {
          showToast("Không thể cập nhật số lượng. Vui lòng thử lại sau.", {
            type: "error",
          });
        }
      }
    },
    [cartItems, handleUpdateQuantity, showToast]
  );

  // Xử lý xóa sản phẩm
  const handleRemoveItem = useCallback(
    async (itemId: string, color: string, size: string): Promise<void> => {
      try {
        await removeFromCart(itemId, color, size);
        // Thông báo xóa sản phẩm thành công
        showToast("Xóa sản phẩm thành công", {
          type: "success",
        });
      } catch {
        showToast("Không thể xóa sản phẩm. Vui lòng thử lại sau.", {
          type: "error",
        });
      }
    },
    [removeFromCart, showToast]
  );

  // Xử lý xóa toàn bộ giỏ hàng
  const handleClearCart = useCallback(async () => {
    try {
      await clearCart();
      showToast("Đã xóa toàn bộ giỏ hàng", {
        type: "success",
      });
      setShowClearCartConfirm(false);
    } catch {
      showToast("Không thể xóa giỏ hàng. Vui lòng thử lại sau.", {
        type: "error",
      });
    }
  }, [clearCart, showToast]);

  // Xử lý chuyển sang trang thanh toán
  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) {
      showToast("Giỏ hàng của bạn đang trống!", {
        type: "warning",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const stockCheck = await CartService.checkCartItemsStock(cartItems);

      if (!stockCheck.valid) {
        const errorMessages = stockCheck.invalidItems.map(
          (item) =>
            `${item.name}: Chỉ còn ${item.available} sản phẩm (bạn đang chọn ${item.requested})`
        );
        showToast(errorMessages.join(", "), {
          type: "error",
        });
        setIsProcessing(false);
        return;
      }

      // Calculate final total
      const finalTotal = subtotal;

      const orderData = {
        items: cartItems,
        summary: {
          subtotal,
          total: finalTotal,
        },
        timestamp: new Date().getTime(),
      };

      sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));
      router.push("/checkout");
    } catch {
      showToast("Có lỗi xảy ra khi kiểm tra tồn kho. Vui lòng thử lại sau.", {
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [cartItems, subtotal, router, showToast]);

  // Memoize props cho CartItems để tránh rerender
  const cartItemsProps = useMemo(
    () =>
      cartItems.map((item) => ({
        ...item,
        price: item.price ?? 0,
        image: item.image ?? "",
      })),
    [cartItems]
  );

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <BreadcrumbTrail items={breadcrumbs} />
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

        {initialLoading ? ( // Thay thế loading bằng initialLoading
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Đang tải giỏ hàng..." />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng.
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Sản phẩm ({cartCount})
                </h2>
                <button
                  onClick={() => setShowClearCartConfirm(true)}
                  className="text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Xóa tất cả
                </button>
              </div>
              <CartItems
                items={cartItemsProps}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            </div>
            <OrderSummary
              subtotal={subtotal}
              onCheckout={handleCheckout}
              isEmpty={cartItems.length === 0}
              isProcessing={isProcessing}
            />
          </div>
        )}
      </main>
      {/* Modal xác nhận xóa toàn bộ giỏ hàng */}
      {showClearCartConfirm && (
        <div className="fixed inset-0 bg-opacity-10 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
            <h3 className="text-xl font-semibold mb-4">Xác nhận xóa</h3>
            <p className="mb-6">
              Bạn có muốn xóa toàn bộ sản phẩm trong giỏ hàng không?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearCartConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleClearCart}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
      {Toast}
    </>
  );
}
