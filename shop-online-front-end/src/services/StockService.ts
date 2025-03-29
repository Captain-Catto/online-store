// Giả lập dữ liệu sản phẩm có sẵn trong kho
const availableStock: Record<string, number> = {
  "product-1": 5, // Sản phẩm 1 có 5 sản phẩm trong kho
  "product-2": 3, // Sản phẩm 2 có 3 sản phẩm trong kho
  "product-3": 8, // Sản phẩm 3 có 8 sản phẩm trong kho
};

export const StockService = {
  // Lấy số lượng tồn kho của sản phẩm
  getAvailableQuantity: (productId: string): number => {
    return availableStock[productId] || 0;
  },

  // Kiểm tra xem số lượng yêu cầu có hợp lệ không
  isQuantityAvailable: (
    productId: string,
    requestedQuantity: number
  ): boolean => {
    return requestedQuantity <= StockService.getAvailableQuantity(productId);
  },

  // Kiểm tra tất cả sản phẩm trong giỏ hàng
  validateCartItems: (items: Array<{ id: string; quantity: number }>) => {
    return items.filter(
      (item) => !StockService.isQuantityAvailable(item.id, item.quantity)
    );
  },
};
