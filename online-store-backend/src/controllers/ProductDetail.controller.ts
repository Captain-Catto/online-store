import { Request, Response } from "express";
import ProductDetail from "../models/ProductDetail";
import Product from "../models/Product";

// Tạo chi tiết sản phẩm
export const createProductDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, color, size, stock, images } = req.body;

    // Tạo đường dẫn hình ảnh tĩnh
    const imagePath = JSON.stringify(images); // Lưu các hình ảnh dưới dạng chuỗi JSON

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findByPk(productId);
    if (!product) {
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Tạo chi tiết sản phẩm
    const productDetail = await ProductDetail.create({
      productId,
      color,
      size,
      stock,
      imagePath,
    });

    res.status(201).json({
      ...productDetail.toJSON(),
      images: images,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết sản phẩm
// Lấy tất cả chi tiết sản phẩm với hình ảnh được parse
export const getProductDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productDetails = await ProductDetail.findAll();

    // Map qua mỗi productDetail để parse imagePath
    const formattedProductDetails = productDetails.map((detail) => {
      let images = [];
      try {
        images = JSON.parse(detail.getDataValue("imagePath") || "[]");
      } catch (e) {
        images = [];
      }

      return {
        ...detail.toJSON(),
        images,
      };
    });

    res.status(200).json(formattedProductDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết sản phẩm theo id
export const getProductDetailById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const productDetail = await ProductDetail.findByPk(id);

    if (!productDetail) {
      res.status(404).json({ message: "Không tìm thấy chi tiết sản phẩm" });
      return;
    }

    // Parse imagePath từ JSON string thành mảng
    let images = [];
    try {
      images = JSON.parse(productDetail.getDataValue("imagePath") || "[]");
    } catch (e) {
      images = [];
    }
    // Trả về response với images đã được parse
    res.status(200).json({
      ...productDetail.toJSON(),
      images,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// lấy chi tiết sản phẩm theo id sản phẩm
export const getProductDetailsByProductId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    console.log(productId);
    if (!productId) {
      res.status(400).json({ message: "Thiếu id sản phẩm" });
      return;
    }
    const productDetails = await ProductDetail.findAll({
      where: { productId },
    });

    res.status(200).json(productDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật chi tiết sản phẩm
export const updateProductDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { color, size, stock } = req.body;

    const productDetail = await ProductDetail.findByPk(id);
    if (!productDetail) {
      res.status(404).json({ message: "Không tìm thấy chi tiết sản phẩm" });
      return;
    }

    await productDetail.update({ color, size, stock });
    res.status(200).json(productDetail);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa chi tiết sản phẩm
export const deleteProductDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const productDetail = await ProductDetail.findByPk(id);

    if (!productDetail) {
      res.status(404).json({ message: "Không tìm thấy chi tiết sản phẩm" });
      return;
    }

    await productDetail.destroy();
    res.status(200).json({ message: "Xóa thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
