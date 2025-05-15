"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { CartItem } from "@/types/cart";
import { CartService } from "@/services/CartService";
import {
  addToCart as addToLocalCart,
  removeFromCart as removeFromLocalCart,
  updateCartItemQuantity as updateLocalCartQuantity,
  getCartFromCookie,
  getCartItemCount,
  clearCart as clearLocalCart,
} from "@/utils/cartUtils";
import { useAuth } from "@/hooks/useAuth";
import { debounce } from "lodash"; // Sử dụng lodash để debounce API calls

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string, color: string, size: string) => Promise<void>;
  updateQuantity: (
    id: string,
    color: string,
    size: string,
    quantity: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  handleUpdateQuantity: (cartItem: CartItem, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const isInitialized = useRef(false);
  const refreshInProgress = useRef(false);
  const prevIsLoggedIn = useRef(isLoggedIn);

  // Gửi sự kiện cart-updated với số lượng hoặc items cụ thể
  const dispatchCartEvent = useCallback(
    (count?: number, items?: CartItem[]) => {
      const itemsToCount = items || cartItems;
      const eventCount =
        count !== undefined
          ? count
          : itemsToCount.reduce((sum, item) => sum + item.quantity, 0);

      const event = new CustomEvent("cart-updated", {
        detail: { count: eventCount },
      });
      window.dispatchEvent(event);
    },
    [cartItems]
  );

  // Làm mới giỏ hàng từ server hoặc local storage
  const refreshCart = useCallback(async () => {
    if (refreshInProgress.current) return;
    refreshInProgress.current = true;
    const shouldShowLoading = !loading;
    if (shouldShowLoading) setLoading(true);

    try {
      if (isLoggedIn) {
        const cartData = await CartService.getCart();
        setCartItems(cartData.items || []);
        setCartCount(cartData.totalItems || 0);
        dispatchCartEvent(cartData.totalItems || 0, cartData.items || []);
      } else {
        const localCart = getCartFromCookie();
        const mappedItems = localCart.map((item) => ({
          ...item,
          productId: Number(item.productId),
        }));
        setCartItems(mappedItems);
        const localCount = getCartItemCount();
        setCartCount(localCount);
        dispatchCartEvent(localCount, mappedItems);
      }
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    } finally {
      if (shouldShowLoading) setLoading(false);
      refreshInProgress.current = false;
    }
  }, [isLoggedIn, loading, dispatchCartEvent]);

  // Khởi tạo giỏ hàng khi component mount
  const initializeCart = useCallback(async () => {
    if (isInitialized.current || authLoading) return;
    isInitialized.current = true;
    setLoading(true);

    try {
      if (isLoggedIn) {
        const localCart = getCartFromCookie();
        if (localCart.length > 0) {
          try {
            await CartService.mergeCartFromCookies();
            clearLocalCart();
          } catch (mergeError) {
            console.error("Failed to merge local cart:", mergeError);
          }
        }
        const cartData = await CartService.getCart();
        setCartItems(cartData.items || []);
        setCartCount(cartData.totalItems || 0);
      } else {
        const localCart = getCartFromCookie();
        const mappedItems = localCart.map((item) => ({
          ...item,
          productId: Number(item.productId),
        }));
        setCartItems(mappedItems);
        setCartCount(getCartItemCount());
      }
    } catch (error) {
      console.error("Failed to initialize cart:", error);
      const localCart = getCartFromCookie();
      const mappedItems = localCart.map((item) => ({
        ...item,
        productId: Number(item.productId),
      }));
      setCartItems(mappedItems);
      setCartCount(getCartItemCount());
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, authLoading]);

  useEffect(() => {
    initializeCart();
    return () => {
      isInitialized.current = false;
    };
  }, [initializeCart]);

  // Lắng nghe thay đổi trạng thái đăng nhập
  useEffect(() => {
    if (authLoading || !isInitialized.current) return;
    if (prevIsLoggedIn.current !== isLoggedIn) {
      prevIsLoggedIn.current = isLoggedIn;
      const timeoutId = setTimeout(() => refreshCart(), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoggedIn, authLoading, refreshCart]);

  // Lắng nghe sự kiện cart-updated
  useEffect(() => {
    const handleCartUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.count !== undefined) {
        setCartCount(customEvent.detail.count);
      }
    };
    window.addEventListener("cart-updated", handleCartUpdate as EventListener);
    return () => {
      window.removeEventListener(
        "cart-updated",
        handleCartUpdate as EventListener
      );
    };
  }, []);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = useCallback(
    async (item: CartItem) => {
      try {
        const existingItemIndex = cartItems.findIndex(
          (i) =>
            i.id === item.id && i.color === item.color && i.size === item.size
        );
        let updatedItems: CartItem[];
        if (existingItemIndex >= 0) {
          updatedItems = [...cartItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + item.quantity,
          };
        } else {
          updatedItems = [...cartItems, item];
        }
        setCartItems(updatedItems);
        const newCount = updatedItems.reduce((sum, i) => sum + i.quantity, 0);
        setCartCount(newCount);
        dispatchCartEvent(newCount, updatedItems);

        if (isLoggedIn) {
          const productDetailId = item.productDetailId;
          await CartService.addToCart(
            Number(item.productId),
            Number(productDetailId),
            item.color,
            item.size,
            item.quantity
          );
          await refreshCart(); // Đồng bộ với server
        } else {
          addToLocalCart(item);
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
        await refreshCart(); // Revert on error
      }
    },
    [cartItems, isLoggedIn, dispatchCartEvent, refreshCart]
  );

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = useCallback(
    async (id: string, color: string, size: string) => {
      try {
        const originalItems = [...cartItems];
        const updatedItems = cartItems.filter(
          (item) =>
            !(item.id === id && item.color === color && item.size === size)
        );
        setCartItems(updatedItems);
        const newCount = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(newCount);
        dispatchCartEvent(newCount, updatedItems);

        if (isLoggedIn) {
          const itemToRemove = originalItems.find(
            (item) =>
              item.id === id && item.color === color && item.size === size
          );
          if (itemToRemove?.cartItemId) {
            await CartService.removeCartItem(itemToRemove.cartItemId);
            await refreshCart(); // Đồng bộ với server
          }
        } else {
          removeFromLocalCart(id, color, size);
        }
      } catch (error) {
        console.error("Failed to remove from cart:", error);
        await refreshCart(); // Revert on error
      }
    },
    [cartItems, isLoggedIn, dispatchCartEvent, refreshCart]
  );

  // Cập nhật số lượng (debounced cho logged-in users)
  const updateQuantityInternal = useCallback(
    async (id: string, color: string, size: string, quantity: number) => {
      try {
        if (quantity <= 0) {
          await removeFromCart(id, color, size);
          return;
        }

        // Lưu trạng thái gốc để khôi phục nếu cần
        const originalItems = [...cartItems];
        const updatedItems = cartItems.map((item) =>
          item.id === id && item.color === color && item.size === size
            ? { ...item, quantity }
            : item
        );

        // Cập nhật UI ngay lập tức
        setCartItems(updatedItems);
        const newCount = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(newCount);
        dispatchCartEvent(newCount, updatedItems);

        if (isLoggedIn) {
          const itemToUpdate = originalItems.find(
            (item) =>
              item.id === id && item.color === color && item.size === size
          );
          if (itemToUpdate?.cartItemId) {
            await CartService.updateCartItem(itemToUpdate.cartItemId, quantity);
            await refreshCart(); // Đồng bộ với server
          }
        } else {
          updateLocalCartQuantity(id, color, size, quantity);
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
        setCartItems(cartItems); // Revert to original items
        setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
        dispatchCartEvent();
        throw error; // Ném lỗi để xử lý ở CartPageClient
      }
    },
    [cartItems, isLoggedIn, removeFromCart, dispatchCartEvent, refreshCart]
  );

  // Debounce updateQuantity cho logged-in users để giảm API calls
  const updateQuantity = useCallback(
    (...args: [string, string, string, number]): Promise<void> => {
      if (isLoggedIn) {
        return new Promise((resolve, reject) => {
          debounce((...debounceArgs: [string, string, string, number]) => {
            updateQuantityInternal(...debounceArgs)
              .then(resolve)
              .catch(reject);
          }, 500)(...args);
        });
      } else {
        return updateQuantityInternal(...args);
      }
    },
    [updateQuantityInternal, isLoggedIn]
  );

  // Xóa toàn bộ giỏ hàng
  const clearCart = useCallback(async () => {
    try {
      setCartItems([]);
      setCartCount(0);
      if (isLoggedIn) {
        await CartService.clearCart();
      } else {
        clearLocalCart();
      }
      dispatchCartEvent(0);
    } catch (error) {
      console.error("Failed to clear cart:", error);
      await refreshCart(); // Revert on error
    }
  }, [isLoggedIn, dispatchCartEvent, refreshCart]);

  // Cập nhật số lượng từ cartItem object
  const handleUpdateQuantity = useCallback(
    async (cartItem: CartItem, quantity: number) => {
      try {
        await updateQuantity(
          cartItem.id,
          cartItem.color || "",
          cartItem.size || "",
          quantity
        );
      } catch (error) {
        console.error("Error updating cart item:", error);
        // Lỗi được xử lý ở CartPageClient qua showToast
      }
    },
    [updateQuantity]
  );

  // Memoize context value để tránh rerender không cần thiết
  const contextValue = useMemo(
    () => ({
      cartItems,
      cartCount,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      handleUpdateQuantity,
      refreshCart,
    }),
    [
      cartItems,
      cartCount,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      handleUpdateQuantity,
      refreshCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
