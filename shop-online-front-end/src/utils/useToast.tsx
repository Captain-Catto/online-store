"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

  // Sử dụng useRef thay vì useState cho timeoutId
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  // Lớp CSS cho các loại toast
  const getToastClasses = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      case "cart":
        return "bg-white border-gray-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  // Icon cho từng loại toast
  const getToastIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-5 h-5 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5 text-yellow-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-5 h-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

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
    }
    // Cleanup function
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const showToast = useCallback((msg: string, options: ToastOptions = {}) => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    setMessage(msg);
    setType(options.type || "info");
    setProductInfo(options.product || null);
    setIsVisible(true);

    timeoutIdRef.current = setTimeout(() => {
      setIsVisible(false);
    }, options.duration || 3500);
  }, []);

  const closeToast = useCallback(() => {
    setIsVisible(false);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  // Component hiển thị toast cho giỏ hàng
  const CartToast = () => {
    if (!productInfo) return null;
    return (
      <div className="notify-product">
        {/* Header với nút đóng */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nội dung sản phẩm */}
        <div className="flex p-4 gap-2">
          {/* Hình ảnh sản phẩm - kích thước lớn hơn */}
          {productInfo.image && (
            <div className="notify-product__thumbnail flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={productInfo.image}
                alt={productInfo.name}
                className=" object-contain rounded-md"
                width={64}
                height={84}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/placeholder.jpg";
                }}
              />
            </div>
          )}

          {/* Thông tin sản phẩm */}
          <div className="notify-product__content flex-grow flex flex-col">
            {/* Tên sản phẩm */}
            <span className="notify-product__title font-medium text-base mb-1 line-clamp-2">
              {productInfo.name}
            </span>

            {/* Tùy chọn sản phẩm */}
            <span className="notify-product__option text-gray-600 text-sm mb-2">
              {(productInfo.color && colorToVietnamese[productInfo.color]) ||
                productInfo.color}
              {productInfo.color && productInfo.size ? " / " : ""}
              {productInfo.size}
            </span>

            {/* Giá sản phẩm */}
            <div className="notify-product__prices mt-auto">
              {productInfo.originalPrice &&
                productInfo.originalPrice > (productInfo.price || 0) && (
                  <del className="text-gray-400 text-sm mr-2">
                    {productInfo.originalPrice.toLocaleString("vi-VN")}đ
                  </del>
                )}
              <ins className="text-red-600 font-semibold text-base no-underline">
                {productInfo.price?.toLocaleString("vi-VN")}đ
              </ins>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component Toast chính với portal
  const Toast =
    isVisible && portalContainer && typeof window !== "undefined"
      ? createPortal(
          <div
            className={`fixed top-14 right-4 z-[8] ${getToastClasses()} shadow-lg rounded-lg ${
              type === "cart" ? "p-0 w-80" : "p-4"
            } animate-fadeIn`}
          >
            <div className="notify__content">
              {type === "cart" ? (
                // Toast cho giỏ hàng
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
                // Toast thông thường
                <div className="flex justify-center">
                  <div className="flex items-center justify-center">
                    {getToastIcon()}
                    <span
                      className={`notify__message ml-2 ${
                        type === "success"
                          ? "text-green-700"
                          : type === "error"
                          ? "text-red-700"
                          : type === "warning"
                          ? "text-yellow-700"
                          : "text-blue-700"
                      }`}
                    >
                      {message}
                    </span>
                  </div>
                  <button
                    onClick={closeToast}
                    className="text-gray-400 hover:text-gray-600 ml-3"
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
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
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
