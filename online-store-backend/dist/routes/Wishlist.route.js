"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Wishlist_controller_1 = require("../controllers/Wishlist.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Tất cả các routes đều yêu cầu đăng nhập
router.get("/", authMiddleware_1.authMiddleware, Wishlist_controller_1.getUserWishlist);
router.post("/", authMiddleware_1.authMiddleware, Wishlist_controller_1.addToWishlist);
router.delete("/:productId", authMiddleware_1.authMiddleware, Wishlist_controller_1.removeFromWishlist);
router.get("/check/:productId", authMiddleware_1.authMiddleware, Wishlist_controller_1.checkWishlistItem);
exports.default = router;
