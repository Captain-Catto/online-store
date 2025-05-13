"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initAssociations;
const Product_1 = __importDefault(require("./Product"));
const ProductDetail_1 = __importDefault(require("./ProductDetail"));
const ProductInventory_1 = __importDefault(require("./ProductInventory"));
const ProductImage_1 = __importDefault(require("./ProductImage"));
const Category_1 = __importDefault(require("./Category"));
const ProductCategory_1 = __importDefault(require("./ProductCategory"));
const Order_1 = __importDefault(require("./Order"));
const OrderDetail_1 = __importDefault(require("./OrderDetail"));
const Users_1 = __importDefault(require("./Users"));
const UserAddress_1 = __importDefault(require("./UserAddress"));
const Role_1 = __importDefault(require("./Role"));
const Voucher_1 = __importDefault(require("./Voucher"));
const PaymentMethod_1 = __importDefault(require("./PaymentMethod"));
const PaymentStatus_1 = __importDefault(require("./PaymentStatus"));
const RefreshToken_1 = __importDefault(require("./RefreshToken"));
const UserNotes_1 = __importDefault(require("./UserNotes"));
const Suitability_1 = __importDefault(require("./Suitability"));
const ProductSuitability_1 = __importDefault(require("./ProductSuitability"));
const NavigationMenu_1 = __importDefault(require("./NavigationMenu"));
const Wishlist_1 = __importDefault(require("./Wishlist"));
const Cart_1 = __importDefault(require("./Cart"));
const CartItem_1 = __importDefault(require("./CartItem"));
const ProductSize_1 = __importDefault(require("./ProductSize"));
function initAssociations() {
    // Product - ProductDetail relationship
    Product_1.default.hasMany(ProductDetail_1.default, { foreignKey: "productId", as: "details" });
    ProductDetail_1.default.belongsTo(Product_1.default, { foreignKey: "productId", as: "product" });
    // ProductDetail - ProductInventory relationship
    ProductDetail_1.default.hasMany(ProductInventory_1.default, {
        foreignKey: "productDetailId",
        as: "inventories",
    });
    ProductInventory_1.default.belongsTo(ProductDetail_1.default, {
        foreignKey: "productDetailId",
        as: "productDetail",
    });
    // ProductDetail - ProductImage relationship
    ProductDetail_1.default.hasMany(ProductImage_1.default, {
        foreignKey: "productDetailId",
        as: "images",
    });
    ProductImage_1.default.belongsTo(ProductDetail_1.default, {
        foreignKey: "productDetailId",
        as: "productDetail",
    });
    // Product - Category relationship (many-to-many)
    Product_1.default.belongsToMany(Category_1.default, {
        through: ProductCategory_1.default,
        foreignKey: "productId",
        otherKey: "categoryId",
        as: "categories",
    });
    Category_1.default.belongsToMany(Product_1.default, {
        through: ProductCategory_1.default,
        foreignKey: "categoryId",
        otherKey: "productId",
        as: "products",
    });
    // Order - OrderDetail relationship
    Order_1.default.hasMany(OrderDetail_1.default, {
        foreignKey: "orderId",
        as: "orderDetails",
        onDelete: "CASCADE",
    });
    OrderDetail_1.default.belongsTo(Order_1.default, { foreignKey: "orderId", as: "order" });
    // Order - User relationship
    Order_1.default.belongsTo(Users_1.default, { foreignKey: "userId", as: "user" });
    Users_1.default.hasMany(Order_1.default, { foreignKey: "userId", as: "orders" });
    // User - Role relationship
    Users_1.default.belongsTo(Role_1.default, { foreignKey: "roleId", as: "role" });
    Role_1.default.hasMany(Users_1.default, { foreignKey: "roleId", as: "users" });
    // User - RefreshToken relationship
    Users_1.default.hasMany(RefreshToken_1.default, { foreignKey: "userId", as: "refreshTokens" });
    RefreshToken_1.default.belongsTo(Users_1.default, { foreignKey: "userId", as: "user" });
    // OrderDetail relationships
    OrderDetail_1.default.belongsTo(Product_1.default, { foreignKey: "productId", as: "product" });
    Product_1.default.hasMany(OrderDetail_1.default, { foreignKey: "productId", as: "orderDetails" });
    OrderDetail_1.default.belongsTo(Voucher_1.default, {
        foreignKey: "voucherId",
        as: "voucher",
        onDelete: "SET NULL",
    });
    OrderDetail_1.default.belongsTo(ProductDetail_1.default, {
        foreignKey: "productDetailId",
        as: "productDetail",
        onDelete: "SET NULL",
    });
    ProductDetail_1.default.hasMany(OrderDetail_1.default, {
        foreignKey: "productDetailId",
        as: "productOrderDetails",
    });
    // Order - PaymentMethod relationship
    Order_1.default.belongsTo(PaymentMethod_1.default, {
        foreignKey: "paymentMethodId",
        as: "paymentMethod",
    });
    PaymentMethod_1.default.hasMany(Order_1.default, { foreignKey: "paymentMethodId", as: "orders" });
    // Order - PaymentStatus relationship
    Order_1.default.belongsTo(PaymentStatus_1.default, {
        foreignKey: "paymentStatusId",
        as: "paymentStatus",
    });
    PaymentStatus_1.default.hasMany(Order_1.default, { foreignKey: "paymentStatusId", as: "orders" });
    // User - UserAddress relationship
    Users_1.default.hasMany(UserAddress_1.default, { foreignKey: "userId", as: "addresses" });
    UserAddress_1.default.belongsTo(Users_1.default, { foreignKey: "userId", as: "user" });
    // user - userNotes relationship
    UserNotes_1.default.belongsTo(Users_1.default, { foreignKey: "userId", as: "user" });
    Users_1.default.hasMany(UserNotes_1.default, { foreignKey: "userId", as: "notes" });
    // Thiết lập mối quan hệ cha-con
    Category_1.default.hasMany(Category_1.default, {
        foreignKey: "parentId",
        as: "children",
    });
    Category_1.default.belongsTo(Category_1.default, {
        foreignKey: "parentId",
        as: "parent",
    });
    // mối quan hệ many-to-many giữa Product và Suitability
    Product_1.default.belongsToMany(Suitability_1.default, {
        through: ProductSuitability_1.default,
        foreignKey: "productId",
        otherKey: "suitabilityId",
        as: "suitabilities",
    });
    Suitability_1.default.belongsToMany(Product_1.default, {
        through: ProductSuitability_1.default,
        foreignKey: "suitabilityId",
        otherKey: "productId",
        as: "products",
    });
    // mqh giữa navigation menu và category
    NavigationMenu_1.default.belongsTo(Category_1.default, {
        foreignKey: "categoryId",
        as: "category",
    });
    Category_1.default.hasMany(NavigationMenu_1.default, {
        foreignKey: "categoryId",
        as: "navigationMenus",
    });
    // Wishlist - User mqh
    Wishlist_1.default.belongsTo(Users_1.default, {
        foreignKey: "userId",
        as: "user",
    });
    Users_1.default.hasMany(Wishlist_1.default, {
        foreignKey: "userId",
        as: "wishlists",
    });
    // Wishlist - Product mqh
    Wishlist_1.default.belongsTo(Product_1.default, {
        foreignKey: "productId",
        as: "product",
    });
    Product_1.default.hasMany(Wishlist_1.default, {
        foreignKey: "productId",
        as: "wishlists",
    });
    // Cart - User relationship
    Users_1.default.hasOne(Cart_1.default, { foreignKey: "userId", as: "cart" });
    Cart_1.default.belongsTo(Users_1.default, { foreignKey: "userId", as: "user" });
    // Cart - CartItem relationship
    Cart_1.default.hasMany(CartItem_1.default, { foreignKey: "cartId", as: "items" });
    CartItem_1.default.belongsTo(Cart_1.default, { foreignKey: "cartId", as: "cart" });
    // CartItem - Product relationship
    Product_1.default.hasMany(CartItem_1.default, { foreignKey: "productId", as: "cartItems" });
    CartItem_1.default.belongsTo(Product_1.default, { foreignKey: "productId", as: "product" });
    // CartItem - ProductDetail relationship
    ProductDetail_1.default.hasMany(CartItem_1.default, {
        foreignKey: "productDetailId",
        as: "cartItems",
    });
    CartItem_1.default.belongsTo(ProductDetail_1.default, {
        foreignKey: "productDetailId",
        as: "productDetail",
    });
    // mối quan hệ giữa ProductSize và Category
    ProductSize_1.default.belongsTo(Category_1.default, { foreignKey: "categoryId", as: "category" });
    Category_1.default.hasMany(ProductSize_1.default, { foreignKey: "categoryId", as: "sizes" });
}
