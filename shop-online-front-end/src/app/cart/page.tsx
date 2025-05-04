"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CartItems from "../../components/Cart/CartItems";
import OrderSummary from "../../components/Cart/OrderSummary";
// import {
//   getCartFromCookie,
//   updateCartItemQuantity,
//   removeFromCart,
//   CartItem,
//   getCartItemCount,
// } from "@/utils/cartUtils";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { AuthService } from "@/services/AuthService";
import { useToast } from "@/utils/useToast";
import { useCart } from "@/contexts/CartContext";
import { CartService } from "@/services/CartService";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

export default function CartPage() {
  const router = useRouter();
  const { showToast, Toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // Sử dụng CartContext thay vì state và cookie local
  const { cartItems, loading, handleUpdateQuantity, removeFromCart } =
    useCart();
  const [subtotal, setSubtotal] = useState(0);

  // Load login status
  useEffect(() => {
    const isLoggedIn = AuthService.isLoggedIn();
    setIsLoggedIn(isLoggedIn);
  }, []);

  // Calculate subtotal when cart items change
  useEffect(() => {
    if (!loading) {
      const calculatedSubtotal = cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
      );
      setSubtotal(calculatedSubtotal);
    }
  }, [cartItems, loading]);

  // Sử dụng handleUpdateQuantity từ CartContext
  const handleQuantityChange = (
    itemId: string,
    newQuantity: number,
    color: string,
    size: string
  ) => {
    // Tìm cartItem từ ID, color và size
    const cartItem = cartItems.find(
      (item) => item.id === itemId && item.color === color && item.size === size
    );

    if (cartItem) {
      handleUpdateQuantity(cartItem, newQuantity);
    }
  };

  // Sử dụng removeFromCart từ CartContext
  const handleRemoveItem = (itemId: string, color: string, size: string) => {
    removeFromCart(itemId, color, size);
  };

  // Trong trang Cart (khi người dùng nhấn Checkout)
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      console.log("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để tiếp tục thanh toán!");
      router.push("/login");
      return;
    }

    // Thêm loading state
    setIsProcessing(true);

    try {
      // Kiểm tra tồn kho trước khi chuyển sang checkout
      const stockCheck = await CartService.checkCartItemsStock(cartItems);

      console.log("Kết quả kiểm tra tồn kho:", stockCheck);

      if (!stockCheck.valid) {
        // Hiển thị thông báo cho người dùng về các sản phẩm không đủ số lượng
        const errorMessages = stockCheck.invalidItems.map(
          (item) =>
            `${item.name}: Chỉ còn ${item.available} sản phẩm (bạn đang chọn ${item.requested})`
        );

        // Hiển thị thông báo lỗi
        showToast(`${errorMessages}`, {
          type: "error",
        });

        setIsProcessing(false);
        return;
      }

      // Lưu thông tin đơn hàng vào sessionStorage (chỉ lưu các sản phẩm và tạm tính)
      const orderData = {
        items: cartItems,
        summary: {
          subtotal: subtotal,
        },
        timestamp: new Date().getTime(),
      };

      sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));

      // Chuyển hướng đến trang checkout
      router.push("/checkout");
    } catch (error) {
      console.error("Lỗi kiểm tra tồn kho:", error);
      showToast("Có lỗi xảy ra khi kiểm tra tồn kho. Vui lòng thử lại sau.", {
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Phần Breadcrumb */}
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
          <span className="text-gray-600 hover:text-black">Cart</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

        {/* Hiển thị khi đang tải dữ liệu giỏ hàng */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Đang tải giỏ hàng..." />
          </div>
        ) : /* Hiển thị khi giỏ hàng trống */
        cartItems.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng.
            </p>
            <Link
              href="/categories"
              className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          /*  Hiển thị khi giỏ hàng có sản phẩm */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Danh sách sản phẩm */}
            <CartItems
              items={cartItems.map((item) => ({
                ...item,
                price: item.price ?? 0,
                image: item.image ?? "",
              }))}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
            />

            {/* Thông tin thanh toán */}
            <OrderSummary
              subtotal={subtotal}
              onCheckout={handleCheckout}
              isEmpty={cartItems.length === 0}
            />
          </div>
        )}
      </main>

      <Footer />

      {/* Toast thông báo */}
      {Toast}

      {/* Hiển thị khi đang xử lý checkout */}
      {isProcessing && (
        <LoadingSpinner
          fullScreen
          size="lg"
          color="white"
          text="Đang kiểm tra tồn kho..."
        />
      )}
    </>
  );
}
