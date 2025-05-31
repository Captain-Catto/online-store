"use client";

import React from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

const IconNavBar: React.FC = () => {
  const { cartCount } = useCart();

  // giới hạn hiển thị số lượng giỏ hàng
  const displayCartCount = cartCount > 99 ? "99+" : cartCount;

  return (
    <div className="flex gap-4">
      <Link href="/account" aria-label="Account">
        <AccountCircleIcon />
      </Link>
      <Link href="/cart" aria-label="Shopping Cart" className="relative">
        <ShoppingCartIcon />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {displayCartCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default IconNavBar;
