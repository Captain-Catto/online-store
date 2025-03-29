"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CartItems from "../../components/Cart/CartItems";
import OrderSummary from "../../components/Cart/OrderSummary";
import {
  getCartFromCookie,
  //   saveCartToCookie,
  updateCartItemQuantity,
  removeFromCart,
  CartItem,
} from "../../util/cartUtils";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

export default function CartPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    deliveryFee: 15000,
    total: 0,
  });

  // Load cart items and check login status
  useEffect(() => {
    const isLoggedIn = true; // Replace with AuthService.isLoggedIn() if available
    setIsLoggedIn(isLoggedIn);

    const cookieCart = getCartFromCookie();
    setCartItems(cookieCart);
  }, []);

  // Update order summary when cart items or promoDiscount change
  useEffect(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );

    // Nếu mã giảm giá đã được áp dụng, tính lại promoDiscount
    const discount = promoDiscount > 0 ? Math.round(subtotal * 0.25) : 0;
    const deliveryFee = 15000;
    const total = subtotal - discount + deliveryFee;

    setPromoDiscount(discount); // Cập nhật promoDiscount
    setOrderSummary({
      subtotal,
      discount,
      deliveryFee,
      total,
    });
  }, [cartItems, promoDiscount]);

  const handleQuantityChange = (
    itemId: string,
    newQuantity: number,
    color: string,
    size: string
  ) => {
    const updatedCart = updateCartItemQuantity(
      itemId,
      color,
      size,
      newQuantity
    );
    // nếu số lượng sản phẩm = 0, xóa sản phẩm khỏi giỏ hàng
    if (newQuantity <= 0) {
      setCartItems(removeFromCart(itemId, color, size));
      return;
    }
    setCartItems(updatedCart);
  };

  const handleRemoveItem = (itemId: string, color: string, size: string) => {
    const updatedCart = removeFromCart(itemId, color, size);
    setCartItems(updatedCart);
  };

  const handleApplyPromo = (promoCode: string) => {
    if (promoCode.trim().toLowerCase() === "discount25") {
      setPromoDiscount(1); // Đặt trạng thái để kích hoạt tính toán trong useEffect
      console.log("Promo code applied successfully!");
    } else {
      setPromoDiscount(0); // Xóa giảm giá nếu mã không hợp lệ
      console.log("Invalid or expired promo code!");
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      console.log("Your cart is empty!");
      return;
    }

    if (!isLoggedIn) {
      alert("Please log in to proceed to checkout!");
      router.push("/login");
      return;
    }

    router.push(
      `/checkout?subtotal=${orderSummary.subtotal}&discount=${orderSummary.discount}&total=${orderSummary.total}`
    );
  };

  return (
    <>
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
          <span className="text-gray-600 hover:text-black">Cart</span>
        </div>
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <CartItems
            items={cartItems}
            // trong cartItems có quantity mà typescript đang hiểu là có thể undefined
            // hiện em chưa biết cách khắc phục, gpt cho code xịn quá em không hiểu
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
          />

          <OrderSummary
            subtotal={orderSummary.subtotal}
            discount={orderSummary.discount}
            promoDiscount={promoDiscount}
            deliveryFee={orderSummary.deliveryFee}
            total={orderSummary.total}
            onApplyPromo={handleApplyPromo}
            onCheckout={handleCheckout}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
