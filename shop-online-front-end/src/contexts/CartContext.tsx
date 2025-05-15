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
import { debounce } from "lodash";

/**
 * Định nghĩa interface cho context giỏ hàng
 */
interface CartContextType {
  /** Danh sách các mặt hàng trong giỏ hàng */
  cartItems: CartItem[];
  /** Tổng số lượng sản phẩm trong giỏ hàng */
  cartCount: number;
  /** Trạng thái đang tải giỏ hàng */
  loading: boolean;
  /** Thêm sản phẩm vào giỏ hàng */
  addToCart: (item: CartItem) => Promise<void>;
  /** Xóa sản phẩm khỏi giỏ hàng */
  removeFromCart: (id: string, color: string, size: string) => Promise<void>;
  /** Cập nhật số lượng sản phẩm trong giỏ hàng */
  updateQuantity: (
    id: string,
    color: string,
    size: string,
    quantity: number
  ) => Promise<void>;
  /** Xóa toàn bộ giỏ hàng */
  clearCart: () => Promise<void>;
  /** Helper để cập nhật số lượng từ đối tượng CartItem */
  handleUpdateQuantity: (cartItem: CartItem, quantity: number) => Promise<void>;
  /** Làm mới giỏ hàng từ server */
  refreshCart: (force?: boolean) => Promise<void>;
}

// Tạo context với giá trị mặc định là undefined
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Hook để sử dụng CartContext
 * @returns CartContext
 * @throws Error nếu sử dụng ngoài CartProvider
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

/** Props cho CartProvider */
interface CartProviderProps {
  children: ReactNode;
}

/**
 * Provider cho cart context, quản lý trạng thái giỏ hàng
 * Xử lý đồng bộ giỏ hàng giữa local và server
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // State cho giỏ hàng
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Lấy trạng thái đăng nhập từ auth context
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  // Refs để theo dõi trạng thái
  const isInitialized = useRef(false);
  const refreshInProgress = useRef(false);
  const loginInProgress = useRef(false);
  const prevIsLoggedIn = useRef(isLoggedIn);
  const lastInitTime = useRef(0);

  /**
   * Phát sự kiện khi giỏ hàng được cập nhật để các component khác lắng nghe
   * @param count - Số lượng sản phẩm mới
   * @param items - Danh sách sản phẩm mới
   */
  const dispatchCartEvent = useCallback(
    (count: number, items: CartItem[] = []) => {
      const event = new CustomEvent("cart-updated", {
        detail: { count, items, timestamp: Date.now() },
      });
      window.dispatchEvent(event);
    },
    []
  );

  /**
   * Sử dụng giỏ hàng local khi không đăng nhập hoặc có lỗi
   */
  const fallbackToLocalCart = useCallback(() => {
    const localCart = getCartFromCookie();
    const mappedItems = localCart.map((item) => ({
      ...item,
      productId: Number(item.productId),
    }));
    setCartItems(mappedItems);
    const localCount = getCartItemCount();
    setCartCount(localCount);
    dispatchCartEvent(localCount, mappedItems);
  }, [dispatchCartEvent]);

  /**
   * Làm mới giỏ hàng từ server hoặc local
   * @param force - Bỏ qua cache và bắt buộc tải lại nếu true
   */
  const refreshCart = useCallback(
    async (force = false) => {
      // Tránh gọi đồng thời
      if (refreshInProgress.current && !force) {
        return;
      }

      refreshInProgress.current = true;
      const shouldShowLoading = !loading;
      if (shouldShowLoading) setLoading(true);

      try {
        // Kiểm tra trạng thái đăng nhập
        const localIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const effectiveIsLoggedIn = localIsLoggedIn || isLoggedIn;

        if (effectiveIsLoggedIn) {
          // Kiểm tra token
          const authToken = sessionStorage.getItem("authToken");
          if (!authToken) {
            fallbackToLocalCart();
            return;
          }

          // Sử dụng cache nếu không force
          if (!force) {
            const cacheKey = "cartData";
            const cachedCart = sessionStorage.getItem(cacheKey);
            if (cachedCart) {
              try {
                const { data, timestamp } = JSON.parse(cachedCart);
                // Cache 1 phút
                if (Date.now() - timestamp < 60 * 1000) {
                  setCartItems(data.items || []);
                  setCartCount(data.totalItems || 0);
                  dispatchCartEvent(data.totalItems || 0, data.items || []);

                  if (shouldShowLoading) setLoading(false);
                  refreshInProgress.current = false;
                  return;
                }
              } catch {
                // Tiếp tục nếu parsing lỗi
              }
            }
          }

          // Fetch từ server
          const cartData = await CartService.getCart();

          // Cập nhật state và cache
          setCartItems(cartData.items || []);
          setCartCount(cartData.totalItems || 0);
          dispatchCartEvent(cartData.totalItems || 0, cartData.items || []);

          sessionStorage.setItem(
            "cartData",
            JSON.stringify({ data: cartData, timestamp: Date.now() })
          );
        } else {
          fallbackToLocalCart();
        }
      } catch {
        fallbackToLocalCart();
      } finally {
        if (shouldShowLoading) setLoading(false);
        refreshInProgress.current = false;
      }
    },
    [isLoggedIn, loading, dispatchCartEvent, fallbackToLocalCart]
  );

  /**
   * Khởi tạo giỏ hàng khi component mount hoặc sau đăng nhập
   * @param force - Bỏ qua kiểm tra điều kiện nếu true
   */
  const initializeCart = useCallback(
    async (force = false) => {
      // Kiểm tra các điều kiện để tránh khởi tạo không cần thiết
      if (isInitialized.current && !force) {
        return;
      }

      if (authLoading && !force) {
        return;
      }

      if (loginInProgress.current && !force) {
        return;
      }

      // Ngăn khởi tạo quá dày
      const now = Date.now();
      if (now - lastInitTime.current < 500 && !force) {
        return;
      }
      lastInitTime.current = now;

      // Cập nhật trạng thái
      isInitialized.current = true;
      loginInProgress.current = false;
      setLoading(true);

      try {
        // Xác định trạng thái đăng nhập
        const localIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const effectiveIsLoggedIn = localIsLoggedIn || isLoggedIn;

        if (effectiveIsLoggedIn) {
          // Kiểm tra token
          const authToken = sessionStorage.getItem("authToken");
          if (!authToken) {
            fallbackToLocalCart();
            return;
          }

          // Merge giỏ hàng local nếu có
          const localCart = getCartFromCookie();
          if (localCart.length > 0) {
            try {
              await CartService.mergeCartFromCookies();
              clearLocalCart();
            } catch {
              // Tiếp tục ngay cả khi merge thất bại
            }
          }

          // Refresh giỏ hàng từ server
          await refreshCart(true);
        } else {
          fallbackToLocalCart();
        }
      } catch {
        fallbackToLocalCart();
      } finally {
        setLoading(false);
      }
    },
    [isLoggedIn, authLoading, refreshCart, fallbackToLocalCart]
  );

  /**
   * Xử lý sự kiện đăng nhập/đăng xuất và thay đổi trạng thái isLoggedIn
   */
  useEffect(() => {
    // Xử lý sự kiện đăng nhập thành công
    const handleLoginSuccess = () => {
      // Reset trạng thái và khởi tạo lại giỏ hàng
      isInitialized.current = false;
      refreshInProgress.current = false;

      setTimeout(() => {
        initializeCart(true);
      }, 700);
    };

    // Xử lý sự kiện đăng xuất thành công
    const handleLogoutSuccess = () => {
      // Đặt lại state
      setCartItems([]);
      setCartCount(0);
      dispatchCartEvent(0, []);

      // Reset flags
      isInitialized.current = false;
      refreshInProgress.current = false;
      loginInProgress.current = false;

      // Xóa cache
      sessionStorage.removeItem("cartData");
    };

    // Đăng ký lắng nghe sự kiện
    window.addEventListener("auth-login-success", handleLoginSuccess);
    window.addEventListener("auth-logout-success", handleLogoutSuccess);

    // Xử lý thay đổi trạng thái đăng nhập
    if (!authLoading && prevIsLoggedIn.current !== isLoggedIn) {
      prevIsLoggedIn.current = isLoggedIn;
      isInitialized.current = false;
      loginInProgress.current = false;

      setTimeout(() => {
        initializeCart(true);
      }, 500);
    }

    return () => {
      window.removeEventListener("auth-login-success", handleLoginSuccess);
      window.removeEventListener("auth-logout-success", handleLogoutSuccess);
    };
  }, [isLoggedIn, authLoading, initializeCart, dispatchCartEvent]);

  /**
   * Khởi tạo giỏ hàng khi component mount
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      initializeCart();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initializeCart]);

  /**
   * Lắng nghe sự kiện cart-updated để đồng bộ giữa các instance
   */
  useEffect(() => {
    const handleCartUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.count !== undefined) {
        const { count, items } = customEvent.detail;

        // Cập nhật count
        setCartCount((prev) => (prev !== count ? count : prev));

        // Cập nhật items
        if (items && Array.isArray(items) && items.length > 0) {
          setCartItems(items);
        }
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

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param item - Sản phẩm cần thêm
   */
  const addToCart = useCallback(
    async (item: CartItem) => {
      try {
        // Optimistic UI update
        const existingItemIndex = cartItems.findIndex(
          (i) =>
            i.id === item.id && i.color === item.color && i.size === item.size
        );

        let updatedItems: CartItem[];
        if (existingItemIndex >= 0) {
          // Nếu sản phẩm đã tồn tại, tăng số lượng
          updatedItems = [...cartItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + item.quantity,
          };
        } else {
          // Nếu là sản phẩm mới, thêm vào mảng
          updatedItems = [...cartItems, item];
        }

        // Cập nhật state
        setCartItems(updatedItems);
        const newCount = updatedItems.reduce((sum, i) => sum + i.quantity, 0);
        setCartCount(newCount);
        dispatchCartEvent(newCount, updatedItems);

        // Xử lý với server hoặc local storage
        if (isLoggedIn) {
          const productDetailId = item.productDetailId;
          await CartService.addToCart(
            Number(item.productId),
            Number(productDetailId),
            item.color,
            item.size,
            item.quantity
          );
          await refreshCart(true);
        } else {
          addToLocalCart(item);
        }
      } catch {
        // Xử lý lỗi và đồng bộ lại
        await refreshCart(true);
      }
    },
    [cartItems, isLoggedIn, dispatchCartEvent, refreshCart]
  );

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param id - ID sản phẩm
   * @param color - Màu sắc
   * @param size - Kích cỡ
   */
  const removeFromCart = useCallback(
    async (id: string, color: string, size: string) => {
      try {
        // Optimistic UI update
        const originalItems = [...cartItems];
        const updatedItems = cartItems.filter(
          (item) =>
            !(item.id === id && item.color === color && item.size === size)
        );

        // Cập nhật state
        setCartItems(updatedItems);
        const newCount = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(newCount);
        dispatchCartEvent(newCount, updatedItems);

        // Xử lý với server hoặc local storage
        if (isLoggedIn) {
          const itemToRemove = originalItems.find(
            (item) =>
              item.id === id && item.color === color && item.size === size
          );
          if (itemToRemove?.cartItemId) {
            await CartService.removeCartItem(itemToRemove.cartItemId);
            await refreshCart(true);
          }
        } else {
          removeFromLocalCart(id, color, size);
        }
      } catch {
        // Xử lý lỗi và đồng bộ lại
        await refreshCart(true);
      }
    },
    [cartItems, isLoggedIn, dispatchCartEvent, refreshCart]
  );

  /**
   * Cập nhật số lượng sản phẩm - hàm nội bộ không debounce
   * @param id - ID sản phẩm
   * @param color - Màu sắc
   * @param size - Kích cỡ
   * @param quantity - Số lượng mới
   */
  const updateQuantityInternal = useCallback(
    async (id: string, color: string, size: string, quantity: number) => {
      try {
        // Nếu số lượng <= 0, xóa sản phẩm
        if (quantity <= 0) {
          await removeFromCart(id, color, size);
          return;
        }

        // Optimistic UI update
        const originalItems = [...cartItems];
        const updatedItems = cartItems.map((item) =>
          item.id === id && item.color === color && item.size === size
            ? { ...item, quantity }
            : item
        );

        // Cập nhật state
        setCartItems(updatedItems);
        const newCount = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(newCount);
        dispatchCartEvent(newCount, updatedItems);

        // Xử lý với server hoặc local storage
        if (isLoggedIn) {
          const itemToUpdate = originalItems.find(
            (item) =>
              item.id === id && item.color === color && item.size === size
          );
          if (itemToUpdate?.cartItemId) {
            await CartService.updateCartItem(itemToUpdate.cartItemId, quantity);
            await refreshCart(true);
          }
        } else {
          updateLocalCartQuantity(id, color, size, quantity);
        }
      } catch (error) {
        // Rollback UI nếu thất bại
        setCartItems(cartItems);
        setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
        dispatchCartEvent(cartCount, cartItems);
        throw error;
      }
    },
    [
      cartItems,
      cartCount,
      isLoggedIn,
      removeFromCart,
      dispatchCartEvent,
      refreshCart,
    ]
  );

  /**
   * Cập nhật số lượng sản phẩm - hàm public với debounce
   * @param id - ID sản phẩm
   * @param color - Màu sắc
   * @param size - Kích cỡ
   * @param quantity - Số lượng mới
   */
  const updateQuantity = useCallback(
    (...args: [string, string, string, number]): Promise<void> => {
      // Sử dụng debounce khi đăng nhập
      if (isLoggedIn) {
        return new Promise((resolve, reject) => {
          debounce((...debounceArgs: [string, string, string, number]) => {
            updateQuantityInternal(...debounceArgs)
              .then(resolve)
              .catch(reject);
          }, 500)(...args);
        });
      } else {
        // Không cần debounce khi làm việc với local storage
        return updateQuantityInternal(...args);
      }
    },
    [updateQuantityInternal, isLoggedIn]
  );

  /**
   * Xóa toàn bộ giỏ hàng
   */
  const clearCart = useCallback(async () => {
    try {
      // Optimistic UI update
      setCartItems([]);
      setCartCount(0);
      dispatchCartEvent(0, []);

      // Xử lý với server hoặc local storage
      if (isLoggedIn) {
        await CartService.clearCart();
      } else {
        clearLocalCart();
      }
    } catch {
      // Xử lý lỗi và đồng bộ lại
      await refreshCart(true);
    }
  }, [isLoggedIn, dispatchCartEvent, refreshCart]);

  /**
   * Helper để cập nhật số lượng từ đối tượng CartItem
   * @param cartItem - CartItem cần cập nhật
   * @param quantity - Số lượng mới
   */
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
        throw error;
      }
    },
    [updateQuantity]
  );

  /**
   * Memoize context value để tránh render không cần thiết
   */
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
