"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { colorToVietnamese } from "@/utils/colorUtils";

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
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  // Tạo portal container khi component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      let container = document.getElementById("toast-portal");

      if (!container) {
        container = document.createElement("div");
        container.id = "toast-portal";
        document.body.appendChild(container);
      }

      setPortalContainer(container);

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [timeoutId]);

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
    }, options.duration || 5000);

    setTimeoutId(id);
  };

  // Hàm đóng toast
  const closeToast = () => {
    setIsVisible(false);
    if (timeoutId) clearTimeout(timeoutId);
  };

  // Cart Toast Component
  const CartToast = () => {
    if (!productInfo) return null;

    return (
      <div className="notify-product flex flex-col items-start gap-3">
        <div className="flex justify-between items-center w-full">
          <span className="text-green-600 font-medium">
            Đã thêm vào giỏ hàng
          </span>
          <button
            onClick={closeToast}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Đóng thông báo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="w-full h-[1px] bg-gray-200"></div>
        <div className="flex items-center gap-4">
          {productInfo.image && (
            <div className="notify-product__image w-full h-20 overflow-hidden rounded-md border border-gray-200 mb-2">
              <Image
                src={productInfo.image}
                alt={productInfo.name}
                className="w-full h-full object-contain"
                width={160}
                height={160}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder.jpg";
                }}
              />
            </div>
          )}
          <div className="notify-product__content flex-1">
            <span className="notify-product__title font-medium text-sm line-clamp-2">
              {productInfo.name}
            </span>
            <span className="notify-product__option text-gray-500 text-xs mt-1">
              Màu: {colorToVietnamese[productInfo.color || ""]} | Size:{" "}
              {productInfo.size}
            </span>
            <div className="notify-product__prices text-sm mt-1 flex items-center gap-2">
              <span className="text-red-600 font-semibold">
                {productInfo.price?.toLocaleString("vi-VN")}đ
              </span>
              {productInfo.originalPrice &&
                productInfo.originalPrice > (productInfo.price || 0) && (
                  <span className="text-gray-400 line-through text-xs">
                    {productInfo.originalPrice.toLocaleString("vi-VN")}đ
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Toast component với portal
  const Toast =
    isVisible && portalContainer && typeof window !== "undefined"
      ? createPortal(
          <div className="fixed top-4 right-4 z-[9999] bg-white border border-gray-200 shadow-lg rounded-lg p-4 max-w-xs w-[320px] animate-fadeIn">
            <div className="notify__content">
              {type === "cart" ? (
                <div>
                  <CartToast />
                  <a
                    href="/cart"
                    className="btn btn--outline w-full text-center mt-4 inline-block text-sm font-medium text-white bg-black border border-black px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Xem giỏ hàng
                  </a>
                </div>
              ) : (
                <div className="flex justify-between">
                  <p className="notify__message">{message}</p>
                  <button
                    onClick={closeToast}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Đóng thông báo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>,
          portalContainer
        )
      : null;

  return { showToast, Toast };
};
