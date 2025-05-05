"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const Role_1 = __importDefault(require("../models/Role"));
const Users_1 = __importDefault(require("../models/Users"));
const Category_1 = __importDefault(require("../models/Category"));
const Product_1 = __importDefault(require("../models/Product"));
const ProductDetail_1 = __importDefault(require("../models/ProductDetail"));
const ProductInventory_1 = __importDefault(require("../models/ProductInventory"));
const ProductImage_1 = __importDefault(require("../models/ProductImage"));
const ProductCategory_1 = __importDefault(require("../models/ProductCategory"));
const PaymentMethod_1 = __importDefault(require("../models/PaymentMethod"));
const PaymentStatus_1 = __importDefault(require("../models/PaymentStatus"));
const Voucher_1 = __importDefault(require("../models/Voucher"));
const UserAddress_1 = __importDefault(require("../models/UserAddress")); // Thêm import này
const Order_1 = __importDefault(require("../models/Order")); // Import Order model
const OrderDetail_1 = __importDefault(require("../models/OrderDetail")); // Import OrderDetail model
const data_1 = require("./data");
// Đảm bảo associations được thiết lập đúng
const associations_1 = __importDefault(require("../models/associations"));
(0, associations_1.default)();
const seedDatabase = async () => {
    try {
        // Tắt kiểm tra khóa ngoại trong quá trình tạo bảng
        await db_1.default.query("SET FOREIGN_KEY_CHECKS = 0");
        console.log("Bắt đầu đồng bộ hóa cơ sở dữ liệu...");
        // Tạo bảng theo thứ tự để tránh lỗi khóa ngoại
        // 1. Đầu tiên là các bảng cơ bản không có khóa ngoại
        await Role_1.default.sync({ force: true });
        await PaymentMethod_1.default.sync({ force: true });
        await PaymentStatus_1.default.sync({ force: true });
        await Category_1.default.sync({ force: true });
        await Voucher_1.default.sync({ force: true });
        // 2. Sau đó là các bảng có khóa ngoại đơn giản
        await Users_1.default.sync({ force: true });
        await Product_1.default.sync({ force: true });
        // 3. Các bảng có khóa ngoại phụ thuộc vào bảng trên
        await ProductDetail_1.default.sync({ force: true });
        await ProductInventory_1.default.sync({ force: true });
        await ProductImage_1.default.sync({ force: true });
        await ProductCategory_1.default.sync({ force: true });
        await UserAddress_1.default.sync({ force: true });
        // 4. Cuối cùng là các bảng liên quan đến đơn hàng
        await Order_1.default.sync({ force: true });
        await OrderDetail_1.default.sync({ force: true });
        // Bật lại kiểm tra khóa ngoại
        await db_1.default.query("SET FOREIGN_KEY_CHECKS = 1");
        console.log("Bắt đầu tạo dữ liệu mẫu...");
        // Tạo dữ liệu mẫu theo thứ tự
        await Role_1.default.bulkCreate(data_1.roles);
        console.log("✓ Đã tạo roles");
        await Users_1.default.bulkCreate(data_1.users);
        console.log("✓ Đã tạo users");
        await Category_1.default.bulkCreate(data_1.categories);
        console.log("✓ Đã tạo categories");
        await Product_1.default.bulkCreate(data_1.products);
        console.log("✓ Đã tạo products");
        await ProductDetail_1.default.bulkCreate(data_1.productDetails);
        console.log("✓ Đã tạo product details");
        await ProductInventory_1.default.bulkCreate(data_1.productInventories);
        console.log("✓ Đã tạo product inventories (kho hàng)");
        await ProductImage_1.default.bulkCreate(data_1.productImages);
        console.log("✓ Đã tạo product images");
        await ProductCategory_1.default.bulkCreate(data_1.productCategories);
        console.log("✓ Đã tạo product categories");
        await PaymentMethod_1.default.bulkCreate(data_1.paymentMethods);
        console.log("✓ Đã tạo payment methods");
        await PaymentStatus_1.default.bulkCreate(data_1.paymentStatuses);
        console.log("✓ Đã tạo payment statuses");
        await Voucher_1.default.bulkCreate(data_1.vouchers);
        console.log("✓ Đã tạo vouchers");
        // Thêm phần tạo dữ liệu địa chỉ người dùng
        await UserAddress_1.default.bulkCreate(data_1.userAddresses);
        console.log("✓ Đã tạo user addresses");
        await Order_1.default.bulkCreate(data_1.orders);
        console.log("✓ Đã tạo orders");
        await OrderDetail_1.default.bulkCreate(data_1.orderDetails);
        console.log("✓ Đã tạo order details");
        console.log("Đã thêm dữ liệu mẫu vào cơ sở dữ liệu thành công!");
        process.exit(0);
    }
    catch (error) {
        console.error("Lỗi khi thêm dữ liệu vào cơ sở dữ liệu:", error);
        console.error(error);
        process.exit(1);
    }
};
// Chạy seeder
seedDatabase();
