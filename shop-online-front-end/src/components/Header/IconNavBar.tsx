"use client";

import React, { useState, useEffect } from "react";
// import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link";
import { getCartItemCount } from "@/utils/cartUtils";

const IconNavBar: React.FC = () => {
  // State để lưu số lượng sản phẩm
  const [cartCount, setCartCount] = useState(0);

  // Cập nhật số lượng sản phẩm khi giỏ hàng thay đổi
  useEffect(() => {
    // Lấy số lượng sản phẩm trong giỏ hàng
    setCartCount(getCartItemCount());

    // lắng nghe sự kiện cart update để cập nhật số lượng sản phẩm
    const handleCartUpdate = (e: CustomEvent) => {
      setCartCount(e.detail.count || getCartItemCount());
    };

    // tạo sự kiện cart-updated để cập nhật số lượng sản phẩm
    window.addEventListener("cart-updated", handleCartUpdate as EventListener);

    // xóa sự kiện khi component bị hủy
    return () => {
      window.removeEventListener(
        "cart-updated",
        handleCartUpdate as EventListener
      );
    };
  }, []);

  return (
    <div className="flex gap-4">
      {/* <Link href="/notifications" aria-label="Notifications">
        <NotificationsIcon />
      </Link> */}
      <Link href="/account" aria-label="Account">
        <AccountCircleIcon />
      </Link>
      <Link href="/cart" aria-label="Shopping Cart" className="relative">
        <ShoppingCartIcon />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default IconNavBar;
