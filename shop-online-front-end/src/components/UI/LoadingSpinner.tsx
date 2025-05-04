import React from "react";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white" | "black";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "black",
  text,
  fullScreen = false,
  className = "",
}) => {
  // Xác định kích thước
  const sizeClasses = {
    xs: "h-4 w-4 border-2",
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-5",
    xl: "h-24 w-24 border-[6px]",
  };

  // Xác định màu sắc cho border
  const colorClasses = {
    primary: "border-gray-200 border-t-gray-800",
    secondary: "border-gray-100 border-t-gray-500",
    white: "border-gray-600 border-t-white",
    black: "border-gray-200 border-t-black",
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
      >
        <span className="sr-only">Đang tải...</span>
      </div>

      {text && (
        <span className="mt-3 text-sm text-gray-800 font-medium">{text}</span>
      )}
    </div>
  );

  // Nếu là fullScreen, thêm overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
