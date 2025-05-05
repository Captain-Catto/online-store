"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(403).json({ message: "Không có quyền truy cập" });
            return; // Chỉ return không có giá trị
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
