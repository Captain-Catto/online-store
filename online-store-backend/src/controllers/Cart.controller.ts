import { Request, Response } from "express";
import Cart from "../models/Cart";
import CartItem from "../models/CartItem";
import Product from "../models/Product";
import ProductDetail from "../models/ProductDetail";
import ProductImage from "../models/ProductImage";
import ProductInventory from "../models/ProductInventory";

// Lấy giỏ hàng của người dùng đăng nhập
export const getUserCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Tìm hoặc tạo giỏ hàng cho người dùng
    const [cart] = await Cart.findOrCreate({
      where: { userId },
      defaults: { userId },
    });

    // Lấy tất cả items trong giỏ hàng với thông tin sản phẩm
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "sku"],
        },
        {
          model: ProductDetail,
          as: "productDetail",
          attributes: ["id", "price", "originalPrice"],
          include: [
            {
              model: ProductImage,
              as: "images",
              where: { isMain: true },
              required: false,
              attributes: ["url"],
              limit: 1,
            },
          ],
        },
      ],
    });

    // Format dữ liệu trả về
    const formattedItems = cartItems.map((item) => {
      const product = item.get("product") as any;
      const productDetail = item.get("productDetail") as any;
      const image = productDetail?.images?.[0]?.url || null;

      return {
        id: `${item.productId}-${item.color}-${item.size}`,
        cartItemId: item.id,
        productId: item.productId,
        productDetailId: productDetail.id,
        name: product.name,
        price: productDetail.price,
        originalPrice: productDetail.originalPrice,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        image: image,
      };
    });

    res.status(200).json({
      cartId: cart.id,
      items: formattedItems,
      totalItems: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: formattedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    });
  } catch (error: any) {
    console.error("Error getting cart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addItemToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { productId, productDetailId, quantity, color, size } = req.body;

    if (!productId || !productDetailId || !quantity || !color || !size) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Tìm hoặc tạo giỏ hàng
    const [cart] = await Cart.findOrCreate({
      where: { userId },
      defaults: { userId },
    });

    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId,
        color,
        size,
      },
    });

    if (existingItem) {
      // Cập nhật số lượng
      existingItem.quantity += quantity;
      await existingItem.save();
      res.status(200).json({
        message: "Updated item quantity",
        item: existingItem,
      });
    } else {
      // Thêm mới
      const newItem = await CartItem.create({
        cartId: cart.id,
        productId,
        productDetailId,
        quantity,
        color,
        size,
      });

      res.status(201).json({
        message: "Item added to cart",
        item: newItem,
      });
    }
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật số lượng sản phẩm
export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const itemId = parseInt(req.params.id);
    const { quantity } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (isNaN(itemId) || quantity === undefined) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }

    // Tìm cart của user
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    // Tìm cartItem
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      res.status(404).json({ message: "Item not found in cart" });
      return;
    }

    if (quantity <= 0) {
      // Xóa item nếu số lượng <= 0
      await cartItem.destroy();
      res.status(200).json({ message: "Item removed from cart" });
    } else {
      // Cập nhật số lượng
      cartItem.quantity = quantity;
      await cartItem.save();
      res
        .status(200)
        .json({ message: "Item quantity updated", item: cartItem });
    }
  } catch (error: any) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const itemId = parseInt(req.params.id);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Tìm cart của user
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    // Tìm và xóa cartItem
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      res.status(404).json({ message: "Item not found in cart" });
      return;
    }

    await cartItem.destroy();
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error: any) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ message: error.message });
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Tìm cart của user
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    // Xóa tất cả items trong cart
    await CartItem.destroy({ where: { cartId: cart.id } });

    res.status(200).json({ message: "Cart cleared" });
  } catch (error: any) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Merge giỏ hàng từ cookies vào database (cho trường hợp user vừa đăng nhập)
export const mergeCartFromCookies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { cartItems } = req.body;

    if (!userId || !cartItems || !Array.isArray(cartItems)) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }

    // Tìm hoặc tạo cart cho user
    const [cart] = await Cart.findOrCreate({
      where: { userId },
      defaults: { userId },
    });

    // Xử lý từng item trong cookie cart
    for (const item of cartItems) {
      const { productId, color, size, quantity } = item;

      // Tìm ProductDetail để lưu vào cart
      const productDetail = await ProductDetail.findOne({
        where: { productId, color },
      });

      if (!productDetail) continue;

      // Kiểm tra item đã tồn tại trong db cart chưa
      const existingItem = await CartItem.findOne({
        where: {
          cartId: cart.id,
          productId,
          color,
          size,
        },
      });

      if (existingItem) {
        // Cập nhật số lượng
        existingItem.quantity += quantity;
        await existingItem.save();
      } else {
        // Thêm mới
        await CartItem.create({
          cartId: cart.id,
          productId,
          productDetailId: productDetail.id,
          quantity,
          color,
          size,
        });
      }
    }

    // Lấy lại giỏ hàng đã cập nhật
    const updatedCartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "sku"],
        },
        {
          model: ProductDetail,
          as: "productDetail",
          attributes: ["id", "price", "originalPrice"],
          include: [
            {
              model: ProductImage,
              as: "images",
              where: { isMain: true },
              required: false,
              attributes: ["url"],
              limit: 1,
            },
          ],
        },
      ],
    });

    res.status(200).json({
      message: "Cart merged successfully",
      cartId: cart.id,
      itemCount: updatedCartItems.length,
    });
  } catch (error: any) {
    console.error("Error merging cart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Kiểm tra tồn kho sản phẩm trong giỏ hàng
export const checkStockAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ message: "Invalid items data" });
      return;
    }

    const invalidItems = [];

    // Kiểm tra từng sản phẩm
    for (const item of items) {
      const { productDetailId, size, quantity } = item;

      // Kiểm tra dữ liệu đầu vào
      if (!productDetailId || !size || !quantity) {
        continue; // Bỏ qua item không hợp lệ
      }

      // Lấy thông tin chi tiết sản phẩm
      const productDetail = await ProductDetail.findByPk(productDetailId, {
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name"],
          },
        ],
      });

      if (!productDetail) {
        invalidItems.push({
          id: productDetailId,
          name: "Sản phẩm không xác định",
          available: 0,
          requested: quantity,
        });
        continue;
      }

      // Lấy thông tin tồn kho
      const inventory = await ProductInventory.findOne({
        where: {
          productDetailId,
          size,
        },
      });

      // Nếu không tìm thấy thông tin tồn kho
      if (!inventory) {
        invalidItems.push({
          id: productDetailId,
          name: productDetail.getDataValue("product").name,
          color: productDetail.getDataValue("color"),
          size: size,
          available: 0,
          requested: quantity,
          message: `Size ${size} cho sản phẩm không tồn tại`,
        });
        continue;
      }

      // Kiểm tra số lượng tồn kho - sử dụng getDataValue như trong createOrder
      const availableStock = inventory.getDataValue("stock");

      if (availableStock === 0) {
        invalidItems.push({
          id: productDetailId,
          name: productDetail.getDataValue("product").name,
          color: productDetail.getDataValue("color"),
          size: size,
          available: 0,
          requested: quantity,
          message: `Sản phẩm đã hết hàng`,
        });
        continue;
      }

      // Kiểm tra số lượng
      if (availableStock < quantity) {
        invalidItems.push({
          id: productDetailId,
          name: productDetail.getDataValue("product").name,
          color: productDetail.getDataValue("color"),
          size: size,
          available: availableStock,
          requested: quantity,
          message: `Chỉ còn ${availableStock} sản phẩm có sẵn`,
        });
      }
    }

    // Trả về kết quả
    res.status(200).json({
      valid: invalidItems.length === 0,
      invalidItems,
    });
  } catch (error: any) {
    console.error("Error checking stock availability:", error);
    res.status(500).json({
      message: "Server error khi kiểm tra tồn kho",
      error: error.message,
    });
  }
};
