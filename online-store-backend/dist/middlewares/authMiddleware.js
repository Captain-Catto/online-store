"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        // Kiểm tra xem có header Authorization không
        const authHeader = req.headers.authorization;
        // Nếu không có header Authorization hoặc không phải Bearer token
        // thì trả về lỗi 401 Unauthorized
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Không tìm thấy token" });
            return; // Chỉ return không có giá trị
        }
        // Tách token ra khỏi header Authorization
        const token = authHeader.split(" ")[1];
        // Giải mã token bằng secret key
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Đặt thông tin user vào req.user
        req.user = {
            id: decoded.id,
            role: decoded.role,
            username: decoded.username,
        };
        next(); // Gọi next() để tiếp tục middleware chain
    }
    catch (error) {
        res.status(401).json({ message: "Token không hợp lệ" });
        return; // Chỉ return không có giá trị
    }
};
exports.authMiddleware = authMiddleware;
