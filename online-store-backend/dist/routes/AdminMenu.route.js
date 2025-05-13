"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// filepath: d:\desktop\hoc\khoa-iron-hack\J2345\project\online-store\online-store-backend\src\routes\AdminMenuItem.route.ts
const express_1 = __importDefault(require("express"));
const AdminMenuItem_controller_1 = require("../controllers/AdminMenuItem.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = express_1.default.Router();
// Route để lấy menu cho sidebar (dùng cho tất cả các user)
router.get("/", authMiddleware_1.authMiddleware, AdminMenuItem_controller_1.getAdminMenu);
// Routes cho trang quản lý CRUD
router.get("/manage", // Route riêng để lấy danh sách phẳng
authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), // Chỉ admin mới được quản lý
AdminMenuItem_controller_1.getAllAdminMenuItemsFlat);
router.post("/manage", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), AdminMenuItem_controller_1.createAdminMenuItem);
router.put("/manage/order", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), AdminMenuItem_controller_1.updateMenuOrder);
router.put("/manage/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), AdminMenuItem_controller_1.updateAdminMenuItem);
router.delete("/manage/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), AdminMenuItem_controller_1.deleteAdminMenuItem);
exports.default = router;
