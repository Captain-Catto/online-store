//
import sequelize from "./config/db";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";

// Import các models
import "./models/Role";
import "./models/Users";
import "./models/RefreshToken";
import "./models/Product";
import "./models/Category";
import "./models/ProductCategory";
import "./models/ProductDetail";
import "./models/ProductInventory";
import "./models/PaymentMethod";
import "./models/PaymentStatus";
import "./models/Order";
import "./models/OrderDetail";
import "./models/Voucher";

import initAssociations from "./models/associations";
initAssociations();

// import routes
import authRoutes from "./routes/Auth.route";
import productRoutes from "./routes/Product.route";
import productDetailRoutes from "./routes/ProductDetail.route";
import categoryRoutes from "./routes/Category.route";
import voucherRoutes from "./routes/Voucher.route";
import productCategoryRoutes from "./routes/ProductCategory.route";
import productImageRoutes from "./routes/ProductImage.route";
import orderRoutes from "./routes/Order.route";
import userAddressRoutes from "./routes/UserAddress.route";
import userRoutes from "./routes/User.route";
import UserNoteRoutes from "./routes/UserNotes.route";
import navigationMenuRoutes from "./routes/NaviagationMenu.route";
import wishlistRoutes from "./routes/Wishlist.route";

dotenv.config();

const CorsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const app = express();
// Cấu hình để phục vụ file tĩnh
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use(cookieParser());
app.use(cors(CorsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-details", productDetailRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/product-images", productImageRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user-addresses", userAddressRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-notes", UserNoteRoutes);
app.use("/api/navigation", navigationMenuRoutes);
app.use("/api/wishlist", wishlistRoutes);
// Middleware xử lý lỗi

// Kết nối DB
sequelize.sync({ force: false }).then(() => {
  console.log("Database connected!");
  console.log(`Server running with db name ${process.env.DB_NAME}`);
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
