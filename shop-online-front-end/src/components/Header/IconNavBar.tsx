"use client";

import React from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

const IconNavBar: React.FC = () => {
  const { cartCount } = useCart();

  return (
    <div className="flex gap-4">
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
