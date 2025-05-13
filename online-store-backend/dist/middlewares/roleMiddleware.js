"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.permissionMiddleware = exports.roleMiddleware = exports.Permission = void 0;
// Định nghĩa các permission chi tiết
var Permission;
(function (Permission) {
    Permission["VIEW_USERS"] = "VIEW_USERS";
    Permission["EDIT_USERS"] = "EDIT_USERS";
    Permission["TOGGLE_USER_STATUS"] = "TOGGLE_USER_STATUS";
    Permission["VIEW_ORDERS"] = "VIEW_ORDERS";
    Permission["VIEW_FULL_ORDERS"] = "VIEW_FULL_ORDERS";
    Permission["MANAGE_ORDERS"] = "MANAGE_ORDERS";
    Permission["VIEW_FULL_USER_INFO"] = "VIEW_FULL_USER_INFO";
    Permission["EDIT_USERS_ADDRESS"] = "EDIT_USERS_ADDRESS";
})(Permission || (exports.Permission = Permission = {}));
// Ánh xạ role với các permission
const rolePermissions = {
    1: [
        // Admin - Full quyền
        Permission.VIEW_FULL_USER_INFO,
        Permission.EDIT_USERS,
        Permission.TOGGLE_USER_STATUS,
        Permission.VIEW_ORDERS,
        Permission.VIEW_FULL_ORDERS,
        Permission.MANAGE_ORDERS,
        Permission.VIEW_FULL_USER_INFO,
        Permission.EDIT_USERS_ADDRESS,
    ],
    2: [
        // Employee - Quyền hạn chế
        Permission.VIEW_USERS,
        Permission.VIEW_ORDERS,
        Permission.MANAGE_ORDERS,
        Permission.EDIT_USERS_ADDRESS,
    ],
    3: [], // User thông thường - Không có quyền admin
};
// Middleware kiểm tra role (giữ lại để tương thích với code cũ)
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(403).json({ message: "Không có quyền truy cập" });
            return;
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
// Middleware mới kiểm tra permission chi tiết
const permissionMiddleware = (requiredPermissions) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            res.status(403).json({ message: "Không có quyền truy cập" });
            return;
        }
        const userPermissions = rolePermissions[userRole] || [];
        // Kiểm tra xem người dùng có tất cả permission cần thiết không
        const hasAllPermissions = requiredPermissions.every((permission) => userPermissions.includes(permission));
        if (!hasAllPermissions) {
            res
                .status(403)
                .json({ message: "Không đủ quyền thực hiện hành động này" });
            return;
        }
        next();
    };
};
exports.permissionMiddleware = permissionMiddleware;
// Helper function để kiểm tra quyền
const hasPermission = (role, permission) => {
    const permissions = rolePermissions[role] || [];
    return permissions.includes(permission);
};
exports.hasPermission = hasPermission;
