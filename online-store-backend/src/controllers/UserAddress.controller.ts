import { Request, Response } from "express";
import UserAddress from "../models/UserAddress";
import sequelize from "../config/db";
import { Op } from "sequelize";
import Users from "../models/Users";
import Address from "../models/UserAddress";

/**
 * Create a new address for the logged-in user
 */
export const createAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const {
      fullName,
      phoneNumber,
      streetAddress,
      ward,
      district,
      city,
      isDefault,
    } = req.body;

    if (!req.user) {
      await t.rollback();
      res.status(401).json({ message: "Không có thông tin người dùng" });
      return;
    }
    const userId = req.user.id;

    // Check if this is the first address or set as default
    if (isDefault) {
      // Reset any existing default address
      await UserAddress.update(
        { isDefault: false },
        { where: { userId }, transaction: t }
      );
    }

    // Create new address
    const newAddress = await UserAddress.create(
      {
        userId,
        fullName,
        phoneNumber,
        streetAddress,
        ward,
        district,
        city,
        isDefault: isDefault || false,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      message: "Thêm địa chỉ thành công",
      address: newAddress,
    });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({
      message: "Lỗi khi thêm địa chỉ",
      error: error.message,
    });
  }
};

/**
 * Get all addresses for the logged-in user
 */
export const getUserAddresses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Không có thông tin người dùng" });
      return;
    }

    const userId = req.user.id;

    console.log("Fetching addresses for user ID:", userId);

    const addresses = await UserAddress.findAll({
      where: { userId },
      order: [
        ["isDefault", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    console.log("Found addresses:", addresses.length);
    res.status(200).json(addresses);
  } catch (error: any) {
    console.error("Error in getUserAddresses:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get address by ID (only if it belongs to the logged-in user)
 */
export const getAddressById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.body.user.id;

    const address = await UserAddress.findOne({
      where: { id, userId },
    });

    if (!address) {
      res.status(404).json({ message: "Địa chỉ không tồn tại" });
      return;
    }

    res.status(200).json(address);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update an address (only if it belongs to the logged-in user)
 */
export const updateAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      fullName,
      phoneNumber,
      streetAddress,
      ward,
      district,
      city,
      isDefault,
    } = req.body;

    if (!req.user) {
      await t.rollback();
      res.status(401).json({ message: "Không có thông tin người dùng" });
      return;
    }
    const userId = req.user.id;

    // Find address and check ownership
    const address = await UserAddress.findOne({
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
      await UserAddress.update(
        { isDefault: false },
        { where: { userId, id: { [Op.ne]: id } }, transaction: t }
      );
    }

    // Update the address
    await address.update(
      {
        fullName: fullName || address.getDataValue("fullName"),
        phoneNumber: phoneNumber || address.getDataValue("phoneNumber"),
        streetAddress: streetAddress || address.getDataValue("streetAddress"),
        ward: ward !== undefined ? ward : address.getDataValue("ward"),
        district: district || address.getDataValue("district"),
        city: city || address.getDataValue("city"),
        isDefault:
          isDefault !== undefined
            ? isDefault
            : address.getDataValue("isDefault"),
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({
      message: "Cập nhật địa chỉ thành công",
      address,
    });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({
      message: "Lỗi khi cập nhật địa chỉ",
      error: error.message,
    });
  }
};

/**
 * Set an address as default
 */
export const setDefaultAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    if (!req.user) {
      await t.rollback();
      res.status(401).json({ message: "Không có thông tin người dùng" });
      return;
    }
    const userId = req.user.id;

    // Find address and check ownership
    const address = await UserAddress.findOne({
      where: { id, userId },
      transaction: t,
    });

    if (!address) {
      await t.rollback();
      res.status(404).json({ message: "Địa chỉ không tồn tại" });
      return;
    }

    // Reset all addresses for this user
    await UserAddress.update(
      { isDefault: false },
      { where: { userId }, transaction: t }
    );

    // Set this address as default
    await address.update({ isDefault: true }, { transaction: t });

    await t.commit();

    res.status(200).json({
      message: "Đã đặt làm địa chỉ mặc định",
      address,
    });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete an address (only if it belongs to the logged-in user)
 */
export const deleteAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    if (!req.user) {
      await t.rollback();
      res.status(401).json({ message: "Không có thông tin người dùng" });
      return;
    }
    const userId = req.user.id;

    // Find address and check ownership
    const address = await UserAddress.findOne({
      where: { id, userId },
      transaction: t,
    });

    if (!address) {
      await t.rollback();
      res.status(404).json({ message: "Địa chỉ không tồn tại" });
      return;
    }

    // Check if it's the only address
    const addressCount = await UserAddress.count({
      where: { userId },
      transaction: t,
    });

    // Delete the address
    await address.destroy({ transaction: t });

    // If deleted address was default and there are other addresses, set the first one as default
    if (address.getDataValue("isDefault") && addressCount > 1) {
      const firstAddress = await UserAddress.findOne({
        where: { userId },
        transaction: t,
      });

      if (firstAddress) {
        await firstAddress.update({ isDefault: true }, { transaction: t });
      }
    }

    await t.commit();

    res.status(200).json({ message: "Xóa địa chỉ thành công" });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// ADMIN CONTROLLERS

/**
 * Lấy tất cả địa chỉ của một người dùng cụ thể (chỉ admin)
 */
export const getAddressesByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);

    // Kiểm tra người dùng tồn tại
    const user = await Users.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    // Lấy tất cả địa chỉ của người dùng đó
    const addresses = await Address.findAll({
      where: { userId },
      order: [
        ["isDefault", "DESC"],
        ["id", "ASC"],
      ],
    });

    res.status(200).json(addresses);
  } catch (error: any) {
    console.error("Error in getAddressesByUserId:", error);
    res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
  }
};

/**
 * Lấy thông tin một địa chỉ cụ thể (chỉ admin)
 */
export const getAddressByIdForAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const addressId = parseInt(req.params.id);

    const address = await Address.findByPk(addressId);
    if (!address) {
      res.status(404).json({ message: "Không tìm thấy địa chỉ" });
      return;
    }

    res.status(200).json(address);
  } catch (error: any) {
    console.error("Error in getAddressByIdForAdmin:", error);
    res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
  }
};

/**
 * Tạo địa chỉ mới cho người dùng (chỉ admin)
 */
export const createAddressByAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);

    // Kiểm tra người dùng tồn tại
    const user = await Users.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    const {
      fullName,
      phoneNumber,
      streetAddress,
      city,
      district,
      ward,
      isDefault,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (
      !fullName ||
      !phoneNumber ||
      !streetAddress ||
      !city ||
      !district ||
      !ward
    ) {
      res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin địa chỉ" });
      return;
    }

    // Nếu là địa chỉ mặc định, hủy địa chỉ mặc định hiện tại
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId, isDefault: true } }
      );
    }

    // Tạo địa chỉ mới
    const newAddress = await Address.create({
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
  } catch (error: any) {
    console.error("Error in createAddressByAdmin:", error);
    res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
  }
};

/**
 * Cập nhật địa chỉ người dùng (chỉ admin)
 */
export const updateAddressByAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const addressId = parseInt(req.params.id);

    // Tìm địa chỉ
    const addressToUpdate = await Address.findByPk(addressId);
    if (!addressToUpdate) {
      res.status(404).json({ message: "Không tìm thấy địa chỉ" });
      return;
    }

    const {
      fullName,
      phoneNumber,
      streetAddress,
      city,
      district,
      ward,
      isDefault,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (
      !fullName ||
      !phoneNumber ||
      !streetAddress ||
      !city ||
      !district ||
      !ward
    ) {
      res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin địa chỉ" });
      return;
    }

    // Nếu đang đặt làm địa chỉ mặc định, hủy địa chỉ mặc định hiện tại
    if (isDefault && !addressToUpdate.isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId: addressToUpdate.userId, isDefault: true } }
      );
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
  } catch (error: any) {
    console.error("Error in updateAddressByAdmin:", error);
    res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
  }
};

/**
 * Đặt địa chỉ mặc định (chỉ admin)
 */
export const setDefaultAddressByAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const addressId = parseInt(req.params.id);

    // Tìm địa chỉ
    const address = await Address.findByPk(addressId);
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
    await Address.update(
      { isDefault: false },
      { where: { userId: address.userId, isDefault: true } }
    );

    // Đặt địa chỉ mới làm mặc định
    await address.update({ isDefault: true });

    res.status(200).json({
      message: "Đặt địa chỉ mặc định thành công",
      address,
    });
  } catch (error: any) {
    console.error("Error in setDefaultAddressByAdmin:", error);
    res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
  }
};

/**
 * Xóa địa chỉ người dùng (chỉ admin)
 */
export const deleteAddressByAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const addressId = parseInt(req.params.id);

    // Tìm địa chỉ
    const address = await Address.findByPk(addressId);
    if (!address) {
      res.status(404).json({ message: "Không tìm thấy địa chỉ" });
      return;
    }

    // Không cho phép xóa địa chỉ mặc định
    if (address.isDefault) {
      res.status(400).json({
        message:
          "Không thể xóa địa chỉ mặc định. Vui lòng đặt một địa chỉ khác làm mặc định trước khi xóa.",
      });
      return;
    }

    // Xóa địa chỉ
    await address.destroy();

    res.status(200).json({ message: "Xóa địa chỉ thành công" });
  } catch (error: any) {
    console.error("Error in deleteAddressByAdmin:", error);
    res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
  }
};
