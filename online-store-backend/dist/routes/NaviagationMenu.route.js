"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NavigationMenu_controller_1 = require("../controllers/NavigationMenu.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Route công khai cho frontend
router.get("/public", NavigationMenu_controller_1.getPublicNavigationMenu);
// Routes cho admin
router.get("/", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), NavigationMenu_controller_1.getAllNavigationMenus);
router.post("/", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), NavigationMenu_controller_1.createNavigationMenu);
router.put("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), NavigationMenu_controller_1.updateNavigationMenu);
router.delete("/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)([1]), NavigationMenu_controller_1.deleteNavigationMenu);
exports.default = router;
