import sequelize from "../config/db";
import Role from "../models/Role";
import Users from "../models/Users";
import Category from "../models/Category";
import Product from "../models/Product";
import ProductDetail from "../models/ProductDetail";
import ProductInventory from "../models/ProductInventory";
import ProductImage from "../models/ProductImage"; // Thêm import này
import ProductCategory from "../models/ProductCategory";
import PaymentMethod from "../models/PaymentMethod";
import PaymentStatus from "../models/PaymentStatus";
import Voucher from "../models/Voucher";

// Import dữ liệu mẫu
import {
  roles,
  users,
  categories,
  products,
  productDetails,
  productInventories,
  productImages, // Thêm import này
  productCategories,
  paymentMethods,
  paymentStatuses,
  vouchers,
} from "./data";

// Đảm bảo associations được thiết lập đúng
import initAssociations from "../models/associations";
initAssociations();

const seedDatabase = async () => {
  try {
    // Đồng bộ hóa cơ sở dữ liệu
    await sequelize.sync({ force: true }); // CHÚ Ý: sẽ xóa tất cả dữ liệu hiện có!

    console.log("Bắt đầu tạo dữ liệu mẫu...");

    // Tạo dữ liệu mẫu
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

    // Thêm dòng này để tạo dữ liệu ProductImage
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
