"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

type ToastType = "success" | "error" | "warning" | "info" | "cart";

interface ToastOptions {
  duration?: number;
  type?: ToastType;
  product?: {
    name: string;
    image?: string;
    color?: string;
    size?: string;
    quantity?: number;
    price?: number;
    originalPrice?: number;
  };
}

export const useToast = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [productInfo, setProductInfo] = useState<
    ToastOptions["product"] | null
  >(null);
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const showToast = (msg: string, options: ToastOptions = {}) => {
    // Clear any existing timeout
    if (timeoutId) clearTimeout(timeoutId);

    // Set toast properties
    setMessage(msg);
    setType(options.type || "info");
    setProductInfo(options.product || null);
    setIsVisible(true);

    // Set timeout to hide toast
    const id = setTimeout(() => {
      setIsVisible(false);
    }, options.duration || 3000);

    setTimeoutId(id);
  };

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  // Cart Toast Component
  const CartToast = () => {
    if (!productInfo) return null;

    return (
      <div className="notify-product flex flex-col items-start gap-4">
        <span>Đã thêm vào giỏ hàng</span>
        <div className="w-full h-[1px] border-black border"></div>
        <div className="flex items-start gap-4">
          {productInfo.image && (
            <div className="notify-product__thumbnail w-20 h-20 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={productInfo.image}
                alt={productInfo.name}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
          )}
          <div className="notify-product__content flex-1">
            <span className="notify-product__title font-medium text-sm block">
              {productInfo.name}
            </span>
            <span className="notify-product__option text-gray-500 text-xs block">
              {productInfo.color} / {productInfo.size}
            </span>
            <span className="notify-product__prices text-sm block">
              {productInfo.originalPrice && (
                <del className="text-gray-400 mr-2">
                  {productInfo.originalPrice.toLocaleString("vi-VN")}đ
                </del>
              )}
              {productInfo.price && (
                <ins className="text-green-600 font-semibold">
                  {productInfo.price.toLocaleString("vi-VN")}đ
                </ins>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Toast component
  const Toast = isVisible ? (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 shadow-lg rounded-md p-4 max-w-xs">
      <div className="notify__content">
        {type === "cart" ? (
          <div>
            <CartToast />
            <a
              href="/cart"
              className="btn btn--outline w-full text-center mt-4 inline-block text-sm text-black border border-black px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Xem giỏ hàng
            </a>
          </div>
        ) : (
          <p className="notify__message">{message}</p>
        )}
      </div>
    </div>
  ) : null;

  return { showToast, Toast };
};
