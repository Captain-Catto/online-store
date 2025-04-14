import Image from "next/image";
import { getColorName } from "@/utils/colorUtils";

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
  ) => void;
  onRemove: (itemId: string, color: string, size: string) => void;
}

export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-4 items-center border-b border-gray-300 pb-4">
      <div className="relative w-24 h-24">
        <Image
          src={item.image}
          alt={item.name}
          layout="fill"
          objectFit="cover"
          className="rounded"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-bold">{item.name}</h3>
        <p>Size: {item.size}</p>
        <p>Color: {getColorName(item.color)}</p>
        <p className="font-bold">
          {(item.price || 0).toLocaleString("vi-VN")} VND
        </p>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() =>
              onQuantityChange(
                item.id,
                Math.max(item.quantity - 1, 0),
                item.color,
                item.size
              )
            }
          >
            -
          </button>
          <input
            type="text"
            value={item.quantity}
            readOnly
            className="w-10 text-center border border-gray-300 rounded"
          />
          <button
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() =>
              onQuantityChange(
                item.id,
                item.quantity + 1,
                item.color,
                item.size
              )
            }
          >
            +
          </button>
        </div>
        <button
          onClick={() => onRemove(item.id, item.color, item.size)}
          className="mt-2 text-red-500 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
