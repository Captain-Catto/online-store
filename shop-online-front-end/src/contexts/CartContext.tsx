"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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

  // Fetch cart data on auth change
  useEffect(() => {
    if (authLoading) return;

    const initializeCart = async () => {
      setLoading(true);

      if (isLoggedIn) {
        try {
          // First try to merge local cart to database if there are items
          const localCart = getCartFromCookie();
          if (localCart.length > 0) {
            await CartService.mergeCartFromCookies();
          }

          // Then fetch the cart from database
          const cartData = await CartService.getCart();
          setCartItems(cartData.items);
          setCartCount(cartData.totalItems);
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          // Fallback to local cart
          const localCart = getCartFromCookie();
          setCartItems(
            localCart.map((item) => ({
              ...item,
              productId: Number(item.productId), // Chắc chắn productId là number
            }))
          );
          setCartCount(getCartItemCount());
        }
      } else {
        // Not authenticated, use local cart
        const localCart = getCartFromCookie();
        setCartItems(
          localCart.map((item) => ({
            ...item,
            productId: Number(item.productId), // Chắc chắn productId là number
          }))
        );
        setCartCount(getCartItemCount());
      }

      setLoading(false);
    };

    initializeCart();
  }, [isLoggedIn, authLoading]);

  // Listen for cart-updated events (for legacy compatibility)
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

  const addToCart = async (item: CartItem) => {
    if (isLoggedIn) {
      try {
        const productDetailId = item.productDetailId;
        console.log("Adding to cart:", {
          productDetailId: Number(productDetailId),
        });
        await CartService.addToCart(
          Number(item.productId),
          Number(productDetailId),
          item.color,
          item.size,
          item.quantity
        );

        // Refresh cart from server
        const cartData = await CartService.getCart();
        console.log("API cart structure:", {
          items:
            cartData.items && cartData.items.length > 0
              ? cartData.items[0]
              : "No items",
          totalItems: cartData.totalItems,
          hasItemsProperty: "items" in cartData,
        });
        setCartItems(cartData.items);
        setCartCount(cartData.totalItems);
      } catch (error) {
        console.error("Failed to add to cart:", error);
        // Fallback to local cart
        const updatedCart = addToLocalCart(item);
        setCartItems(updatedCart);
        setCartCount(getCartItemCount());
      }
    } else {
      // Not authenticated, use local cart
      const updatedCart = addToLocalCart(item);
      setCartItems(updatedCart);
      setCartCount(getCartItemCount());
    }

    // For compatibility with existing code
    const event = new CustomEvent("cart-updated", {
      detail: {
        count: isLoggedIn ? await getServerCartCount() : getCartItemCount(),
      },
    });
    window.dispatchEvent(event);
  };

  const removeFromCart = async (id: string, color: string, size: string) => {
    if (isLoggedIn) {
      try {
        // Find the cart item ID from the local state
        const cartItem = cartItems.find(
          (item) => item.id === id && item.color === color && item.size === size
        );

        if (cartItem && cartItem.cartItemId) {
          await CartService.removeCartItem(cartItem.cartItemId);

          // Refresh cart from server
          const cartData = await CartService.getCart();
          setCartItems(cartData.items);
          setCartCount(cartData.totalItems);
        }
      } catch (error) {
        console.error("Failed to remove from cart:", error);
        // Fallback to local cart
        const updatedCart = removeFromLocalCart(id, color, size);
        setCartItems(updatedCart);
        setCartCount(getCartItemCount());
      }
    } else {
      // Not authenticated, use local cart
      const updatedCart = removeFromLocalCart(id, color, size);
      setCartItems(updatedCart);
      setCartCount(getCartItemCount());
    }

    // For compatibility with existing code
    const event = new CustomEvent("cart-updated", {
      detail: {
        count: isLoggedIn ? await getServerCartCount() : getCartItemCount(),
      },
    });
    window.dispatchEvent(event);
  };

  const updateQuantity = async (
    id: string,
    color: string,
    size: string,
    quantity: number
  ) => {
    if (isLoggedIn) {
      try {
        // Find the cart item ID from the local state
        const cartItem = cartItems.find(
          (item) => item.id === id && item.color === color && item.size === size
        );

        if (cartItem && cartItem.cartItemId) {
          if (quantity <= 0) {
            await CartService.removeCartItem(cartItem.cartItemId);
          } else {
            await CartService.updateCartItem(cartItem.cartItemId, quantity);
          }

          // Refresh cart from server
          const cartData = await CartService.getCart();
          setCartItems(cartData.items);
          setCartCount(cartData.totalItems);
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
        // Fallback to local cart
        const updatedCart = updateLocalCartQuantity(id, color, size, quantity);
        setCartItems(updatedCart);
        setCartCount(getCartItemCount());
      }
    } else {
      // Not authenticated, use local cart
      const updatedCart = updateLocalCartQuantity(id, color, size, quantity);
      setCartItems(updatedCart);
      setCartCount(getCartItemCount());
    }

    // For compatibility with existing code
    const event = new CustomEvent("cart-updated", {
      detail: {
        count: isLoggedIn ? await getServerCartCount() : getCartItemCount(),
      },
    });
    window.dispatchEvent(event);
  };

  const clearCart = async () => {
    if (isLoggedIn) {
      try {
        await CartService.clearCart();
        setCartItems([]);
        setCartCount(0);
      } catch (error) {
        console.error("Failed to clear cart:", error);
        // Fallback to local cart
        clearLocalCart();
        setCartItems([]);
        setCartCount(0);
      }
    } else {
      // Not authenticated, use local cart
      clearLocalCart();
      setCartItems([]);
      setCartCount(0);
    }

    // For compatibility with existing code
    const event = new CustomEvent("cart-updated", {
      detail: { count: 0 },
    });
    window.dispatchEvent(event);
  };

  const handleUpdateQuantity = async (cartItem: CartItem, quantity: number) => {
    try {
      // Trước tiên, cập nhật UI ngay lập tức cho phản hồi tức thì
      const updatedItems = cartItems.map((item) => {
        if (
          item.id === cartItem.id &&
          item.color === cartItem.color &&
          item.size === cartItem.size
        ) {
          return { ...item, quantity };
        }
        return item;
      });

      // Xóa item khỏi danh sách nếu quantity = 0
      const optimisticItems =
        quantity === 0
          ? updatedItems.filter(
              (item) =>
                !(
                  item.id === cartItem.id &&
                  item.color === cartItem.color &&
                  item.size === cartItem.size
                )
            )
          : updatedItems;

      // Cập nhật UI ngay
      setCartItems(optimisticItems);
      setCartCount(
        optimisticItems.reduce((sum, item) => sum + item.quantity, 0)
      );

      // Sau đó gọi API
      if (quantity === 0) {
        if (isLoggedIn && cartItem.cartItemId) {
          await CartService.removeCartItem(cartItem.cartItemId);
        } else {
          removeFromLocalCart(cartItem.id, cartItem.color, cartItem.size);
        }
      } else {
        if (isLoggedIn && cartItem.cartItemId) {
          await CartService.updateCartItem(cartItem.cartItemId, quantity);
        } else {
          updateLocalCartQuantity(
            cartItem.id,
            cartItem.color,
            cartItem.size,
            quantity
          );
        }
      }

      // Fetch lại dữ liệu sau khi API hoàn tất để đảm bảo đồng bộ
      if (isLoggedIn) {
        const cartData = await CartService.getCart();
        setCartItems(cartData.items);
        setCartCount(cartData.totalItems);
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      // Khôi phục lại dữ liệu ban đầu nếu API gặp lỗi
      if (isLoggedIn) {
        const cartData = await CartService.getCart();
        setCartItems(cartData.items);
        setCartCount(cartData.totalItems);
      }
    }
  };

  // Helper method to get cart count from server
  const getServerCartCount = async (): Promise<number> => {
    try {
      const cartData = await CartService.getCart();
      return cartData.totalItems;
    } catch (error) {
      console.error("Failed to get cart count:", error);
      return getCartItemCount();
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        handleUpdateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
