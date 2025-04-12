import { Request, Response } from "express";
import Users from "../models/Users";
import RefreshToken from "../models/RefreshToken";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserAddress from "../models/UserAddress";
import Role from "../models/Role";

// Tạo mới access token
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "Không có Refresh Token" });
      return;
    }

    // Kiểm tra Refresh Token trong cơ sở dữ liệu
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });
    if (!storedToken) {
      res.status(403).json({ message: "Refresh Token không hợp lệ" });
      return;
    }

    // Xác minh Refresh Token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: number };

    // Tạo Access Token mới
    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken });
  } catch (error: any) {
    res.status(403).json({ message: "Refresh Token không hợp lệ" });
  }
};

// Đăng ký
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const user = await Users.findOne({ where: { email } });
    if (user) {
      res.status(400).json({ message: "Email đã tồn tại" });
      return;
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    await Users.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      res.status(400).json({ message: "Email không tồn tại" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
      return;
    }

    const refreshExpiration = rememberMe ? "30d" : "7d";

    const refreshMaxAge = rememberMe
      ? 30 * 24 * 60 * 60 * 1000 // 30 ngày
      : 7 * 24 * 60 * 60 * 1000; // 7 ngày

    const accessToken = jwt.sign(
      { id: user.id, role: user.roleId, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: refreshExpiration }
    );

    // tạo Refresh Token mới
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
    });

    // Lưu Refresh Token vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: refreshMaxAge,
    });

    res.status(200).json({ message: "Đăng nhập thành công", accessToken });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng xuất
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "Không có Refresh Token" });
      return;
    }

    // kiểm tra Refresh Token trong cơ sở dữ liệu
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });
    if (!storedToken) {
      res.status(403).json({ message: "Refresh Token không hợp lệ" });
      return;
    }

    // Xóa refresh token trong cơ sở dữ liệu
    await RefreshToken.destroy({ where: { token: refreshToken } });

    // Xóa refresh token trong cookie
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Không có thông tin người dùng" });
      return;
    }

    const user = await Users.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
        {
          model: UserAddress,
          as: "addresses",
          order: [["isDefault", "DESC"]],
        },
      ],
    });

    if (!user) {
      res.status(404).json({ message: "Người dùng không tồn tại" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin người dùng theo ID (admin only)
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Kiểm tra quyền admin
    if (req.user?.role !== 1) {
      res.status(403).json({ message: "Không có quyền truy cập" });
      return;
    }

    const { id } = req.params;
    const user = await Users.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
        {
          model: UserAddress,
          as: "addresses",
        },
      ],
    });

    if (!user) {
      res.status(404).json({ message: "Người dùng không tồn tại" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách người dùng (admin only)
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Kiểm tra quyền admin
    if (req.user?.role !== 1) {
      res.status(403).json({ message: "Không có quyền truy cập" });
      return;
    }

    // Phân trang
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await Users.findAndCountAll({
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      users,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Không có thông tin người dùng" });
      return;
    }

    const userId = req.user.id;
    const { username, phoneNumber, dateOfBirth } = req.body;

    const user = await Users.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "Người dùng không tồn tại" });
      return;
    }

    // Update user information
    await user.update({
      username: username || user.getDataValue("username"),
      phoneNumber: phoneNumber,
      dateOfBirth: dateOfBirth,
    });

    // Return updated user without password
    const updatedUser = await Users.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
