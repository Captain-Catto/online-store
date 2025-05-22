import Cookies from "js-cookie";
import { CartItem } from "@/types/cart";

// tên cookie lưu giỏ hàng
const CART_COOKIE_NAME = "shop_cart";
// thời gian sống của cookie (7 ngày)
const COOKIE_EXPIRY_DAYS = 7;

// hàm lấy giỏ hàng từ cookie
export const getCartFromCookie = (): CartItem[] => {
  // Lấy giỏ hàng từ cookie
  const cartJson = Cookies.get(CART_COOKIE_NAME);
  // Nếu không có giỏ hàng, trả về mảng rỗng
  if (!cartJson) return [];

  try {
    // nếu có thì parse thành mảng và trả về vì cookie chỉ lưu dưới dạng string
    return JSON.parse(cartJson);
  } catch {
    // nếu có lỗi khi parse, in ra console và trả về mảng rỗng
    return [];
  }
};

// hàm lưu giỏ hàng vào cookie
export const saveCartToCookie = (cart: CartItem[]): void => {
  // lưu giỏ hàng vào cookie dưới dạng string
  // vì cookie chỉ lưu dưới dạng string
  // thêm option expires để xác định thời gian tồn tại của cookie
  Cookies.set(CART_COOKIE_NAME, JSON.stringify(cart), {
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: "strict",
  });
};

// hàm thêm sản phẩm vào giỏ hàng
export const addToCart = (item: CartItem): CartItem[] => {
  // Kiểm tra productDetailId
  if (!item.productDetailId) {
    console.warn(
      "Thêm sản phẩm vào local cart mà không có productDetailId:",
      item
    );
  }

  const cartItems = getCartFromCookie();
  const existingItemIndex = cartItems.findIndex(
    (cartItem) =>
      cartItem.id === item.id ||
      (cartItem.productId === item.productId &&
        cartItem.color === item.color &&
        cartItem.size === item.size)
  );

  if (existingItemIndex !== -1) {
    // Cập nhật mục đã tồn tại
    const updatedItems = [...cartItems];
    updatedItems[existingItemIndex].quantity += item.quantity;

    // Đảm bảo productDetailId được cập nhật nếu chưa có
    if (
      !updatedItems[existingItemIndex].productDetailId &&
      item.productDetailId
    ) {
      updatedItems[existingItemIndex].productDetailId = item.productDetailId;
    }

    saveCartToCookie(updatedItems);
    return updatedItems;
  } else {
    // Thêm mục mới
    const updatedItems = [...cartItems, item];
    saveCartToCookie(updatedItems);
    return updatedItems;
  }
};

// hàm xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = (
  // truyền vào ID, màu, size của sản phẩm cần xóa
  id: string,
  color: string,
  size: string
): CartItem[] => {
  // lấy giỏ hàng từ cookie
  let currentCart = getCartFromCookie();

  // lọc ra các sản phẩm khác với sản phẩm cần xóa
  currentCart = currentCart.filter(
    (item) => !(item.id === id && item.color === color && item.size === size)
  );

  // lưu giỏ hàng đã cập nhật vào cookie
  saveCartToCookie(currentCart);

  return currentCart;
};

// cập nhật số lượng sản phẩm
export const updateCartItemQuantity = (
  id: string,
  color: string,
  size: string,
  quantity: number
): CartItem[] => {
  const currentCart = getCartFromCookie();

  const itemIndex = currentCart.findIndex(
    (item) => item.id === id && item.color === color && item.size === size
  );

  if (itemIndex !== -1) {
    if (quantity <= 0) {
      // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
      return removeFromCart(id, color, size);
    }

    // Cập nhật số lượng
    currentCart[itemIndex].quantity = quantity;
    saveCartToCookie(currentCart);
  }

  return currentCart;
};

// Lấy tổng số lượng sản phẩm trong giỏ hàng
export const getCartItemCount = (): number => {
  const cart = getCartFromCookie();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

// Lấy tổng giá trị giỏ hàng
export const getCartTotal = (): number => {
  const cart = getCartFromCookie();
  return cart.reduce(
    (total, item) => total + (item.price || 0) * item.quantity,
    0
  );
};

// Xóa toàn bộ giỏ hàng
export const clearCart = (): void => {
  Cookies.remove(CART_COOKIE_NAME);
};
