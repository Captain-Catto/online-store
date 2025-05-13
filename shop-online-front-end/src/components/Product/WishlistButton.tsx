"use client";

import { useState, useEffect } from "react";
import { WishlistService } from "@/services/WishlistService";
import { AuthService } from "@/services/AuthService";
import { useToast } from "@/utils/useToast";
import LoadingSpinner from "../UI/LoadingSpinner";

interface WishlistButtonProps {
  productId: number;
  className?: string;
  showText?: boolean;
}

export default function WishlistButton({
  productId,
  className = "",
  showText = false,
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast, Toast } = useToast();

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!AuthService.isLoggedIn()) return;

      try {
        const inWishlist = await WishlistService.checkInWishlist(productId);
        setIsInWishlist(inWishlist);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [productId]);

  const handleWishlistClick = async () => {
    if (isLoading) return;

    if (!AuthService.isLoggedIn()) {
      showToast("Vui lòng đăng nhập để sử dụng tính năng yêu thích", {
        type: "warning",
      });

      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await WishlistService.removeFromWishlist(productId);
        showToast("Đã xóa khỏi danh sách yêu thích", { type: "success" });
      } else {
        await WishlistService.addToWishlist(productId);
        showToast("Đã thêm vào danh sách yêu thích", { type: "success" });
      }

      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showToast(error instanceof Error ? error.message : "Đã xảy ra lỗi", {
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleWishlistClick}
        className={`flex items-center justify-center transition-all duration-300 ${className}`}
        disabled={isLoading}
        title={isInWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
        aria-label={isInWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
      >
        {/* Button content remains the same */}
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <svg
            className={`w-6 h-6 ${
              isInWishlist ? "text-pink-600 fill-pink-600" : "text-gray-600"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill={isInWishlist ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}
        {showText && (
          <span className="ml-2">
            {isInWishlist ? "Đã yêu thích" : "Thêm vào yêu thích"}
          </span>
        )}
      </button>
      {Toast}
    </>
  );
}
