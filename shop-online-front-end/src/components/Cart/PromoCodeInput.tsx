import { useState } from "react";

interface PromoCodeInputProps {
  onApply: (code: string) => void;
}

export default function PromoCodeInput({ onApply }: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState("");

  return (
    <div className="flex gap-3">
      <input
        type="text"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
        placeholder="Enter promo code"
        className="flex-1 px-4 py-2 border rounded"
      />
      <button
        onClick={() => onApply(promoCode)}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Apply
      </button>
    </div>
  );
}
