import CartItem from "./CartItem";
import { useRouter } from "next/navigation";

interface CartItemsProps {
  items: Array<{
    id: string;
    name: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  onQuantityChange: (
    itemId: string,
    newQuantity: number,
    color: string,
    size: string
  ) => Promise<void>;
  onRemove: (itemId: string, color: string, size: string) => Promise<void>;
}

export default function CartItems({
  items,
  onQuantityChange,
  onRemove,
}: CartItemsProps) {
  const router = useRouter();
  if (items.length === 0) {
    return (
      <div className="flex-2 text-center py-8">
        <p className="text-gray-500">Giỏ hàng đang trống</p>
        <button
          className="mt-4 px-6 py-2 bg-black text-white rounded-full"
          onClick={() => router.push(`/`)}
        >
          Đi chọn hàng thôi
        </button>
      </div>
    );
  }

  return (
    <div className="flex-2 flex flex-col gap-6 p-6 shadow-md rounded-lg border border-gray-300">
      {items.map((item) => (
        <CartItem
          key={`${item.id}-${item.color}-${item.size}`}
          item={{ ...item, price: item.price || 0 }}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
