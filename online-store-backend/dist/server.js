"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//
const db_1 = __importDefault(require("./config/db"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Import các models
require("./models/Role");
require("./models/Users");
require("./models/RefreshToken");
require("./models/Product");
require("./models/Category");
require("./models/ProductCategory");
require("./models/ProductDetail");
require("./models/ProductInventory");
require("./models/PaymentMethod");
require("./models/PaymentStatus");
require("./models/Order");
require("./models/OrderDetail");
require("./models/Voucher");
const associations_1 = __importDefault(require("./models/associations"));
(0, associations_1.default)();
// import routes
const Auth_route_1 = __importDefault(require("./routes/Auth.route"));
const Product_route_1 = __importDefault(require("./routes/Product.route"));
const ProductDetail_route_1 = __importDefault(require("./routes/ProductDetail.route"));
const Category_route_1 = __importDefault(require("./routes/Category.route"));
const Voucher_route_1 = __importDefault(require("./routes/Voucher.route"));
const ProductCategory_route_1 = __importDefault(require("./routes/ProductCategory.route"));
const ProductImage_route_1 = __importDefault(require("./routes/ProductImage.route"));
const Order_route_1 = __importDefault(require("./routes/Order.route"));
const UserAddress_route_1 = __importDefault(require("./routes/UserAddress.route"));
const User_route_1 = __importDefault(require("./routes/User.route"));
const UserNotes_route_1 = __importDefault(require("./routes/UserNotes.route"));
const NaviagationMenu_route_1 = __importDefault(require("./routes/NaviagationMenu.route"));
const Wishlist_route_1 = __importDefault(require("./routes/Wishlist.route"));
const Suitability_route_1 = __importDefault(require("./routes/Suitability.route"));
const AdminMenu_route_1 = __importDefault(require("./routes/AdminMenu.route"));
const Cart_route_1 = __importDefault(require("./routes/Cart.route"));
dotenv_1.default.config();
const CorsOptions = {
    origin: ["http://localhost:3001", "http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
};
const app = (0, express_1.default)();
// Cấu hình để phục vụ file tĩnh
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../public/uploads")));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(CorsOptions));
app.use(express_1.default.json());
// Routes
app.use("/api/auth", Auth_route_1.default);
app.use("/api/products", Product_route_1.default);
app.use("/api/product-details", ProductDetail_route_1.default);
app.use("/api/categories", Category_route_1.default);
app.use("/api/vouchers", Voucher_route_1.default);
app.use("/api/product-categories", ProductCategory_route_1.default);
app.use("/api/product-images", ProductImage_route_1.default);
app.use("/api/orders", Order_route_1.default);
app.use("/api/user-addresses", UserAddress_route_1.default);
app.use("/api/users", User_route_1.default);
app.use("/api/user-notes", UserNotes_route_1.default);
app.use("/api/navigation", NaviagationMenu_route_1.default);
app.use("/api/wishlist", Wishlist_route_1.default);
app.use("/api/suitabilities", Suitability_route_1.default);
app.use("/api/admin-menu", AdminMenu_route_1.default);
app.use("/api/cart", Cart_route_1.default);
// Middleware xử lý lỗi
// Kết nối DB
db_1.default.sync({ force: false }).then(() => {
    console.log("Database connected!");
    console.log(`Server running with db name ${process.env.DB_NAME}`);
});
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
