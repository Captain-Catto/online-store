import sequelize from "../config/db";
import Role from "../models/Role";
import Users from "../models/Users";
import Category from "../models/Category";
import Product from "../models/Product";
import ProductDetail from "../models/ProductDetail";
import ProductInventory from "../models/ProductInventory";
import ProductImage from "../models/ProductImage";
import ProductCategory from "../models/ProductCategory";
import PaymentMethod from "../models/PaymentMethod";
import PaymentStatus from "../models/PaymentStatus";
import Voucher from "../models/Voucher";
import UserAddress from "../models/UserAddress"; // Thêm import này
import Order from "../models/Order"; // Import Order model
import OrderDetail from "../models/OrderDetail"; // Import OrderDetail model

import {
  roles,
  users,
  categories,
  products,
  productDetails,
  productInventories,
  productImages,
  productCategories,
  paymentMethods,
  paymentStatuses,
  vouchers,
  userAddresses,
  orders, // Add this
  orderDetails, // Add this
} from "./data";

// Đảm bảo associations được thiết lập đúng
import initAssociations from "../models/associations";
initAssociations();

const seedDatabase = async () => {
  try {
    // Tắt kiểm tra khóa ngoại trong quá trình tạo bảng
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    console.log("Bắt đầu đồng bộ hóa cơ sở dữ liệu...");

    // Tạo bảng theo thứ tự để tránh lỗi khóa ngoại
    // 1. Đầu tiên là các bảng cơ bản không có khóa ngoại
    await Role.sync({ force: true });
    await PaymentMethod.sync({ force: true });
    await PaymentStatus.sync({ force: true });
    await Category.sync({ force: true });
    await Voucher.sync({ force: true });

    // 2. Sau đó là các bảng có khóa ngoại đơn giản
    await Users.sync({ force: true });
    await Product.sync({ force: true });

    // 3. Các bảng có khóa ngoại phụ thuộc vào bảng trên
    await ProductDetail.sync({ force: true });
    await ProductInventory.sync({ force: true });
    await ProductImage.sync({ force: true });
    await ProductCategory.sync({ force: true });
    await UserAddress.sync({ force: true });

    // 4. Cuối cùng là các bảng liên quan đến đơn hàng
    await Order.sync({ force: true });
    await OrderDetail.sync({ force: true });

    // Bật lại kiểm tra khóa ngoại
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Bắt đầu tạo dữ liệu mẫu...");

    // Tạo dữ liệu mẫu theo thứ tự
    await Role.bulkCreate(roles);
    console.log("✓ Đã tạo roles");

    await Users.bulkCreate(users);
    console.log("✓ Đã tạo users");

    await Category.bulkCreate(categories);
    console.log("✓ Đã tạo categories");

    await Product.bulkCreate(products);
    console.log("✓ Đã tạo products");

    await ProductDetail.bulkCreate(productDetails);
    console.log("✓ Đã tạo product details");

    await ProductInventory.bulkCreate(productInventories);
    console.log("✓ Đã tạo product inventories (kho hàng)");

    await ProductImage.bulkCreate(productImages);
    console.log("✓ Đã tạo product images");

    await ProductCategory.bulkCreate(productCategories);
    console.log("✓ Đã tạo product categories");

    await PaymentMethod.bulkCreate(paymentMethods);
    console.log("✓ Đã tạo payment methods");

    await PaymentStatus.bulkCreate(paymentStatuses);
    console.log("✓ Đã tạo payment statuses");

    await Voucher.bulkCreate(vouchers);
    console.log("✓ Đã tạo vouchers");

    // Thêm phần tạo dữ liệu địa chỉ người dùng
    await UserAddress.bulkCreate(userAddresses);
    console.log("✓ Đã tạo user addresses");

    await Order.bulkCreate(orders);
    console.log("✓ Đã tạo orders");

    await OrderDetail.bulkCreate(orderDetails);
    console.log("✓ Đã tạo order details");

    console.log("Đã thêm dữ liệu mẫu vào cơ sở dữ liệu thành công!");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi thêm dữ liệu vào cơ sở dữ liệu:", error);
    console.error(error);
    process.exit(1);
  }
};

// Chạy seeder
seedDatabase();
