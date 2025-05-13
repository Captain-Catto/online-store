"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddressByAdmin = exports.setDefaultAddressByAdmin = exports.updateAddressByAdmin = exports.createAddressByAdmin = exports.getAddressByIdForAdmin = exports.getAddressesByUserId = exports.deleteAddress = exports.setDefaultAddress = exports.updateAddress = exports.getAddressById = exports.getUserAddresses = exports.createAddress = void 0;
const UserAddress_1 = __importDefault(require("../models/UserAddress"));
const db_1 = __importDefault(require("../config/db"));
const sequelize_1 = require("sequelize");
const Users_1 = __importDefault(require("../models/Users"));
const UserAddress_2 = __importDefault(require("../models/UserAddress"));
/**
 * Create a new address for the logged-in user
 */
const createAddress = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { fullName, phoneNumber, streetAddress, ward, district, city, isDefault, } = req.body;
        if (!req.user) {
            await t.rollback();
            res.status(401).json({ message: "Không có thông tin người dùng" });
            return;
        }
        const userId = req.user.id;
        // Check if this is the first address or set as default
        if (isDefault) {
            // Reset any existing default address
            await UserAddress_1.default.update({ isDefault: false }, { where: { userId }, transaction: t });
        }
        // Create new address
        const newAddress = await UserAddress_1.default.create({
            userId,
            fullName,
            phoneNumber,
            streetAddress,
            ward,
            district,
            city,
            isDefault: isDefault || false,
        }, { transaction: t });
        await t.commit();
        res.status(201).json({
            message: "Thêm địa chỉ thành công",
            address: newAddress,
        });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({
            message: "Lỗi khi thêm địa chỉ",
            error: error.message,
        });
    }
};
exports.createAddress = createAddress;
/**
 * Get all addresses for the logged-in user
 */
const getUserAddresses = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Không có thông tin người dùng" });
            return;
        }
        const userId = req.user.id;
        console.log("Fetching addresses for user ID:", userId);
        const addresses = await UserAddress_1.default.findAll({
            where: { userId },
            order: [
                ["isDefault", "DESC"],
                ["createdAt", "DESC"],
            ],
        });
        console.log("Found addresses:", addresses.length);
        res.status(200).json(addresses);
    }
    catch (error) {
        console.error("Error in getUserAddresses:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getUserAddresses = getUserAddresses;
/**
 * Get address by ID (only if it belongs to the logged-in user)
 */
const getAddressById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.body.user.id;
        const address = await UserAddress_1.default.findOne({
            where: { id, userId },
        });
        if (!address) {
            res.status(404).json({ message: "Địa chỉ không tồn tại" });
            return;
        }
        res.status(200).json(address);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAddressById = getAddressById;
/**
 * Update an address (only if it belongs to the logged-in user)
 */
const updateAddress = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { id } = req.params;
        const { fullName, phoneNumber, streetAddress, ward, district, city, isDefault, } = req.body;
        if (!req.user) {
            await t.rollback();
            res.status(401).json({ message: "Không có thông tin người dùng" });
            return;
        }
        const userId = req.user.id;
        // Find address and check ownership
        const address = await UserAddress_1.default.findOne({
            where: { id, userId },
            transaction: t,
        });
        if (!address) {
            await t.rollback();
            res.status(404).json({ message: "Địa chỉ không tồn tại" });
            return;
        }
        // If setting as default, reset other addresses
        if (isDefault && !address.getDataValue("isDefault")) {
            await UserAddress_1.default.update({ isDefault: false }, { where: { userId, id: { [sequelize_1.Op.ne]: id } }, transaction: t });
        }
        // Update the address
        await address.update({
            fullName: fullName || address.getDataValue("fullName"),
            phoneNumber: phoneNumber || address.getDataValue("phoneNumber"),
            streetAddress: streetAddress || address.getDataValue("streetAddress"),
            ward: ward !== undefined ? ward : address.getDataValue("ward"),
            district: district || address.getDataValue("district"),
            city: city || address.getDataValue("city"),
            isDefault: isDefault !== undefined
                ? isDefault
                : address.getDataValue("isDefault"),
        }, { transaction: t });
        await t.commit();
        res.status(200).json({
            message: "Cập nhật địa chỉ thành công",
            address,
        });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({
            message: "Lỗi khi cập nhật địa chỉ",
            error: error.message,
        });
    }
};
exports.updateAddress = updateAddress;
/**
 * Set an address as default
 */
const setDefaultAddress = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { id } = req.params;
        if (!req.user) {
            await t.rollback();
            res.status(401).json({ message: "Không có thông tin người dùng" });
            return;
        }
        const userId = req.user.id;
        // Find address and check ownership
        const address = await UserAddress_1.default.findOne({
            where: { id, userId },
            transaction: t,
        });
        if (!address) {
            await t.rollback();
            res.status(404).json({ message: "Địa chỉ không tồn tại" });
            return;
        }
        // Reset all addresses for this user
        await UserAddress_1.default.update({ isDefault: false }, { where: { userId }, transaction: t });
        // Set this address as default
        await address.update({ isDefault: true }, { transaction: t });
        await t.commit();
        res.status(200).json({
            message: "Đã đặt làm địa chỉ mặc định",
            address,
        });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
exports.setDefaultAddress = setDefaultAddress;
/**
 * Delete an address (only if it belongs to the logged-in user)
 */
const deleteAddress = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { id } = req.params;
        if (!req.user) {
            await t.rollback();
            res.status(401).json({ message: "Không có thông tin người dùng" });
            return;
        }
        const userId = req.user.id;
        // Find address and check ownership
        const address = await UserAddress_1.default.findOne({
            where: { id, userId },
            transaction: t,
        });
        if (!address) {
            await t.rollback();
            res.status(404).json({ message: "Địa chỉ không tồn tại" });
            return;
        }
        // Check if it's the only address
        const addressCount = await UserAddress_1.default.count({
            where: { userId },
            transaction: t,
        });
        // Delete the address
        await address.destroy({ transaction: t });
        // If deleted address was default and there are other addresses, set the first one as default
        if (address.getDataValue("isDefault") && addressCount > 1) {
            const firstAddress = await UserAddress_1.default.findOne({
                where: { userId },
                transaction: t,
            });
            if (firstAddress) {
                await firstAddress.update({ isDefault: true }, { transaction: t });
            }
        }
        await t.commit();
        res.status(200).json({ message: "Xóa địa chỉ thành công" });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
exports.deleteAddress = deleteAddress;
// ADMIN CONTROLLERS
/**
 * Lấy tất cả địa chỉ của một người dùng cụ thể (chỉ admin)
 */
const getAddressesByUserId = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        // Kiểm tra người dùng tồn tại
        const user = await Users_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        // Lấy tất cả địa chỉ của người dùng đó
        const addresses = await UserAddress_2.default.findAll({
            where: { userId },
            order: [
                ["isDefault", "DESC"],
                ["id", "ASC"],
            ],
        });
        res.status(200).json(addresses);
    }
    catch (error) {
        console.error("Error in getAddressesByUserId:", error);
        res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
    }
};
exports.getAddressesByUserId = getAddressesByUserId;
/**
 * Lấy thông tin một địa chỉ cụ thể (chỉ admin)
 */
const getAddressByIdForAdmin = async (req, res) => {
    try {
        const addressId = parseInt(req.params.id);
        const address = await UserAddress_2.default.findByPk(addressId);
        if (!address) {
            res.status(404).json({ message: "Không tìm thấy địa chỉ" });
            return;
        }
        res.status(200).json(address);
    }
    catch (error) {
        console.error("Error in getAddressByIdForAdmin:", error);
        res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
    }
};
exports.getAddressByIdForAdmin = getAddressByIdForAdmin;
/**
 * Tạo địa chỉ mới cho người dùng (chỉ admin)
 */
const createAddressByAdmin = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        // Kiểm tra người dùng tồn tại
        const user = await Users_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        const { fullName, phoneNumber, streetAddress, city, district, ward, isDefault, } = req.body;
        // Kiểm tra dữ liệu đầu vào
        if (!fullName ||
            !phoneNumber ||
            !streetAddress ||
            !city ||
            !district ||
            !ward) {
            res
                .status(400)
                .json({ message: "Vui lòng điền đầy đủ thông tin địa chỉ" });
            return;
        }
        // Nếu là địa chỉ mặc định, hủy địa chỉ mặc định hiện tại
        if (isDefault) {
            await UserAddress_2.default.update({ isDefault: false }, { where: { userId, isDefault: true } });
        }
        // Tạo địa chỉ mới
        const newAddress = await UserAddress_2.default.create({
            userId,
            fullName,
            phoneNumber,
            streetAddress,
            city,
            district,
            ward,
            isDefault: isDefault || false,
        });
        res.status(201).json({
            message: "Tạo địa chỉ thành công",
            address: newAddress,
        });
    }
    catch (error) {
        console.error("Error in createAddressByAdmin:", error);
        res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
    }
};
exports.createAddressByAdmin = createAddressByAdmin;
/**
 * Cập nhật địa chỉ người dùng (chỉ admin)
 */
const updateAddressByAdmin = async (req, res) => {
    try {
        const addressId = parseInt(req.params.id);
        // Tìm địa chỉ
        const addressToUpdate = await UserAddress_2.default.findByPk(addressId);
        if (!addressToUpdate) {
            res.status(404).json({ message: "Không tìm thấy địa chỉ" });
            return;
        }
        const { fullName, phoneNumber, streetAddress, city, district, ward, isDefault, } = req.body;
        // Kiểm tra dữ liệu đầu vào
        if (!fullName ||
            !phoneNumber ||
            !streetAddress ||
            !city ||
            !district ||
            !ward) {
            res
                .status(400)
                .json({ message: "Vui lòng điền đầy đủ thông tin địa chỉ" });
            return;
        }
        // Nếu đang đặt làm địa chỉ mặc định, hủy địa chỉ mặc định hiện tại
        if (isDefault && !addressToUpdate.isDefault) {
            await UserAddress_2.default.update({ isDefault: false }, { where: { userId: addressToUpdate.userId, isDefault: true } });
        }
        // Cập nhật địa chỉ
        await addressToUpdate.update({
            fullName,
            phoneNumber,
            streetAddress,
            city,
            district,
            ward,
            isDefault: isDefault || false,
        });
        res.status(200).json({
            message: "Cập nhật địa chỉ thành công",
            address: addressToUpdate,
        });
    }
    catch (error) {
        console.error("Error in updateAddressByAdmin:", error);
        res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
    }
};
exports.updateAddressByAdmin = updateAddressByAdmin;
/**
 * Đặt địa chỉ mặc định (chỉ admin)
 */
const setDefaultAddressByAdmin = async (req, res) => {
    try {
        const addressId = parseInt(req.params.id);
        // Tìm địa chỉ
        const address = await UserAddress_2.default.findByPk(addressId);
        if (!address) {
            res.status(404).json({ message: "Không tìm thấy địa chỉ" });
            return;
        }
        // Đã là mặc định rồi thì không cần làm gì
        if (address.isDefault) {
            res.status(200).json({
                message: "Địa chỉ này đã là địa chỉ mặc định",
                address,
            });
            return;
        }
        // Hủy địa chỉ mặc định hiện tại
        await UserAddress_2.default.update({ isDefault: false }, { where: { userId: address.userId, isDefault: true } });
        // Đặt địa chỉ mới làm mặc định
        await address.update({ isDefault: true });
        res.status(200).json({
            message: "Đặt địa chỉ mặc định thành công",
            address,
        });
    }
    catch (error) {
        console.error("Error in setDefaultAddressByAdmin:", error);
        res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
    }
};
exports.setDefaultAddressByAdmin = setDefaultAddressByAdmin;
/**
 * Xóa địa chỉ người dùng (chỉ admin)
 */
const deleteAddressByAdmin = async (req, res) => {
    try {
        const addressId = parseInt(req.params.id);
        // Tìm địa chỉ
        const address = await UserAddress_2.default.findByPk(addressId);
        if (!address) {
            res.status(404).json({ message: "Không tìm thấy địa chỉ" });
            return;
        }
        // Không cho phép xóa địa chỉ mặc định
        if (address.isDefault) {
            res.status(400).json({
                message: "Không thể xóa địa chỉ mặc định. Vui lòng đặt một địa chỉ khác làm mặc định trước khi xóa.",
            });
            return;
        }
        // Xóa địa chỉ
        await address.destroy();
        res.status(200).json({ message: "Xóa địa chỉ thành công" });
    }
    catch (error) {
        console.error("Error in deleteAddressByAdmin:", error);
        res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
    }
};
exports.deleteAddressByAdmin = deleteAddressByAdmin;
