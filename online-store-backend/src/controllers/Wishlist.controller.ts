import { Request, Response } from "express";
import Wishlist from "../models/Wishlist";
import Product from "../models/Product";
import ProductDetail from "../models/ProductDetail";
import ProductImage from "../models/ProductImage";

// Lấy danh sách yêu thích của người dùng đang đăng nhập
export const getUserWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const wishlistItems = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "sku", "status"],
          include: [
            {
              model: ProductDetail,
              as: "details",
              attributes: ["id", "color", "price", "originalPrice"],
            },
            {
              model: ProductImage,
              as: "images",
              attributes: ["id", "url", "isMain", "color"],
              limit: 1,
              where: { isMain: true },
              required: false,
            },
          ],
        },
      ],
    });

    res.status(200).json(wishlistItems);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm sản phẩm vào danh sách yêu thích
export const addToWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    // Kiểm tra sự tồn tại của sản phẩm
    const productExists = await Product.findByPk(productId);
    if (!productExists) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Kiểm tra nếu sản phẩm đã có trong danh sách yêu thích
    const existingItem = await Wishlist.findOne({
      where: {
        userId: req.user.id,
        productId,
      },
    });

    if (existingItem) {
      res.status(400).json({ message: "Product already in wishlist" });
      return;
    }

    // Thêm vào danh sách yêu thích
    const wishlistItem = await Wishlist.create({
      userId: req.user.id,
      productId,
    });

    res.status(201).json({
      message: "Product added to wishlist successfully",
      data: wishlistItem,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa sản phẩm khỏi danh sách yêu thích
export const removeFromWishlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { productId } = req.params;

    // Tìm và xóa mục yêu thích
    const deleted = await Wishlist.destroy({
      where: {
        userId: req.user.id,
        productId,
      },
    });

    if (deleted === 0) {
      res.status(404).json({ message: "Item not found in wishlist" });
      return;
    }

    res
      .status(200)
      .json({ message: "Item removed from wishlist successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Kiểm tra xem sản phẩm có trong danh sách yêu thích không
export const checkWishlistItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { productId } = req.params;

    const item = await Wishlist.findOne({
      where: {
        userId: req.user.id,
        productId,
      },
    });

    res.status(200).json({
      inWishlist: !!item,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
