import Product from "./Product";
import ProductDetail from "./ProductDetail";
import ProductInventory from "./ProductInventory";
import ProductImage from "./ProductImage";
import Category from "./Category";
import ProductCategory from "./ProductCategory";
import Order from "./Order";
import OrderDetail from "./OrderDetail";
import Users from "./Users";
import UserAddress from "./UserAddress";
import Role from "./Role";
import Voucher from "./Voucher";
import PaymentMethod from "./PaymentMethod";
import PaymentStatus from "./PaymentStatus";
import RefreshToken from "./RefreshToken";
import UserNote from "./UserNotes";
import Suitability from "./Suitability";
import ProductSuitability from "./ProductSuitability";

export default function initAssociations() {
  // Product - ProductDetail relationship
  Product.hasMany(ProductDetail, { foreignKey: "productId", as: "details" });
  ProductDetail.belongsTo(Product, { foreignKey: "productId", as: "product" });

  // ProductDetail - ProductInventory relationship
  ProductDetail.hasMany(ProductInventory, {
    foreignKey: "productDetailId",
    as: "inventories",
  });
  ProductInventory.belongsTo(ProductDetail, {
    foreignKey: "productDetailId",
    as: "productDetail",
  });

  // ProductDetail - ProductImage relationship
  ProductDetail.hasMany(ProductImage, {
    foreignKey: "productDetailId",
    as: "images",
  });
  ProductImage.belongsTo(ProductDetail, {
    foreignKey: "productDetailId",
    as: "productDetail",
  });

  // Product - Category relationship (many-to-many)
  Product.belongsToMany(Category, {
    through: ProductCategory,
    foreignKey: "productId",
    otherKey: "categoryId",
    as: "categories",
  });

  Category.belongsToMany(Product, {
    through: ProductCategory,
    foreignKey: "categoryId",
    otherKey: "productId",
    as: "products",
  });

  // Order - OrderDetail relationship
  Order.hasMany(OrderDetail, {
    foreignKey: "orderId",
    as: "orderDetails",
    onDelete: "CASCADE",
  });
  OrderDetail.belongsTo(Order, { foreignKey: "orderId", as: "order" });

  // Order - User relationship
  Order.belongsTo(Users, { foreignKey: "userId", as: "user" });
  Users.hasMany(Order, { foreignKey: "userId", as: "orders" });

  // User - Role relationship
  Users.belongsTo(Role, { foreignKey: "roleId", as: "role" });
  Role.hasMany(Users, { foreignKey: "roleId", as: "users" });

  // User - RefreshToken relationship
  Users.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
  RefreshToken.belongsTo(Users, { foreignKey: "userId", as: "user" });

  // OrderDetail relationships
  OrderDetail.belongsTo(Product, { foreignKey: "productId", as: "product" });
  OrderDetail.belongsTo(Voucher, {
    foreignKey: "voucherId",
    as: "voucher",
    onDelete: "SET NULL",
  });
  OrderDetail.belongsTo(ProductDetail, {
    foreignKey: "productDetailId",
    as: "productDetail",
    onDelete: "SET NULL",
  });
  ProductDetail.hasMany(OrderDetail, {
    foreignKey: "productDetailId",
    as: "productOrderDetails",
  });

  // Order - PaymentMethod relationship
  Order.belongsTo(PaymentMethod, {
    foreignKey: "paymentMethodId",
    as: "paymentMethod",
  });
  PaymentMethod.hasMany(Order, { foreignKey: "paymentMethodId", as: "orders" });

  // Order - PaymentStatus relationship
  Order.belongsTo(PaymentStatus, {
    foreignKey: "paymentStatusId",
    as: "paymentStatus",
  });
  PaymentStatus.hasMany(Order, { foreignKey: "paymentStatusId", as: "orders" });

  // User - UserAddress relationship
  Users.hasMany(UserAddress, { foreignKey: "userId", as: "addresses" });
  UserAddress.belongsTo(Users, { foreignKey: "userId", as: "user" });

  // user - userNotes relationship
  UserNote.belongsTo(Users, { foreignKey: "userId", as: "user" });
  Users.hasMany(UserNote, { foreignKey: "userId", as: "notes" });

  // Thiết lập mối quan hệ cha-con
  Category.hasMany(Category, {
    foreignKey: "parentId",
    as: "children",
  });

  Category.belongsTo(Category, {
    foreignKey: "parentId",
    as: "parent",
  });

  // mối quan hệ many-to-many giữa Product và Suitability
  Product.belongsToMany(Suitability, {
    through: ProductSuitability,
    foreignKey: "productId",
    otherKey: "suitabilityId",
    as: "suitabilities",
  });

  Suitability.belongsToMany(Product, {
    through: ProductSuitability,
    foreignKey: "suitabilityId",
    otherKey: "productId",
    as: "products",
  });
}
