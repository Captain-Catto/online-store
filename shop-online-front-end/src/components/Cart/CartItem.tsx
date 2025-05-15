import Image from "next/image";
import { getColorName } from "@/utils/colorUtils";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

interface CartItemProps {
  item: {
    id: string;
    name: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    image: string;
  };
  onQuantityChange: (
    itemId: string,
    newQuantity: number,
    color: string,
    size: string
  ) => Promise<void>; // Đảm bảo function này trả về Promise
  onRemove: (itemId: string, color: string, size: string) => Promise<void>; // Đảm bảo function này trả về Promise
}

export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  // state để lưu giá trị hiện tại của input số lượng
  const [inputQuantity, setInputQuantity] = useState<number | string>(
    item.quantity
  );
  // Thêm state loading cho quantity và remove
  const [isQuantityLoading, setIsQuantityLoading] = useState(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState(false);

  // cập nhật inputQuantity khi item.quantity thay đổi
  useEffect(() => {
    setInputQuantity(item.quantity);
  }, [item.quantity]);

  // hàm xử lý khi ng dùng thay đổi giá trị input mà ko gọi api
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || !isNaN(Number(value))) {
      setInputQuantity(value === "" ? 1 : Number(value));
    }
  };

  // chỉ gọi api khi ng dùng blur (bấm ra ngoài input)
  const handleInputBlur = async () => {
    const validQuantity =
      inputQuantity === "" || inputQuantity === undefined
        ? 1
        : Math.max(Math.round(Number(inputQuantity)), 1);

    // Cập nhật state local
    setInputQuantity(validQuantity);

    // Chỉ gọi API nếu giá trị thay đổi
    if (validQuantity !== item.quantity) {
      setIsQuantityLoading(true);
      try {
        await onQuantityChange(item.id, validQuantity, item.color, item.size);
      } finally {
        setIsQuantityLoading(false);
      }
    }
  };

  // xử lý trường hợp khi ng dùng nhấn enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // Kích hoạt onBlur event
    }
  };

  // Xử lý khi bấm nút + hoặc -
  const handleButtonQuantityChange = async (newQuantity: number) => {
    // Nếu số lượng mới <= 0, gọi hàm xóa
    if (newQuantity <= 0) {
      // Gọi hàm xóa sản phẩm
      await handleRemove();
      return;
    }

    // Nếu số lượng khác với số lượng hiện tại, cập nhật
    if (newQuantity !== item.quantity) {
      setIsQuantityLoading(true);
      try {
        await onQuantityChange(item.id, newQuantity, item.color, item.size);
      } finally {
        setIsQuantityLoading(false);
      }
    }
  };

  // Xử lý khi xóa sản phẩm
  const handleRemove = async () => {
    setIsRemoveLoading(true);
    try {
      await onRemove(item.id, item.color, item.size);
    } finally {
      setIsRemoveLoading(false);
    }
  };

  return (
    <div className="flex items-center border-b border-gray-300 pb-4 justify-between relative">
      {/* Nếu đang xóa, hiển thị overlay loading toàn bộ sản phẩm */}
      {isRemoveLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <LoadingSpinner size="sm" />
        </div>
      )}

      <div className="flex flex-wrap sm:gap-10 items-center gap-2 sm:flex-2 flex-1">
        {/* hình */}
        <div className="relative w-24 h-24">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="100%"
            priority
            className="rounded object-cover"
          />
        </div>
        {/* thông số biến thể - giá */}
        <div className="">
          <h3 className="font-bold">
            <Link href={`/products/${item.id}`} className="hover:text-blue-500">
              {item.name}
            </Link>
          </h3>
          <p>Size: {item.size}</p>
          <p>Color: {getColorName(item.color)}</p>
          <p className="font-bold">
            {(item.price || 0).toLocaleString("vi-VN")} VND
          </p>
        </div>
      </div>

      {/* số lượng */}
      <div className="flex flex-col items-end flex-1">
        <div className="flex items-center gap-2 relative">
          {/* Nếu đang cập nhật số lượng, hiển thị mini loading ngay trên controls */}
          {isQuantityLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
              <LoadingSpinner size="xs" />
            </div>
          )}

          <button
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
            onClick={() => handleButtonQuantityChange(item.quantity - 1)}
            disabled={isQuantityLoading || isRemoveLoading}
          >
            -
          </button>
          <input
            type="text"
            value={inputQuantity}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-10 text-center border border-gray-300 rounded"
            disabled={isQuantityLoading || isRemoveLoading}
          />
          <button
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
            onClick={() => handleButtonQuantityChange(item.quantity + 1)}
            disabled={isQuantityLoading || isRemoveLoading}
          >
            +
          </button>
        </div>
        <button
          onClick={handleRemove}
          className="mt-2 text-red-500 hover:underline"
          disabled={isQuantityLoading || isRemoveLoading}
        >
          {isRemoveLoading ? "Đang xóa..." : "Xóa"}
        </button>
      </div>
    </div>
  );
}
