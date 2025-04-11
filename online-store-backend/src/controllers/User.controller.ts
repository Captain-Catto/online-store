import { Request, Response } from "express";
import Users from "../models/Users";
import RefreshToken from "../models/RefreshToken";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
    const { email, password } = req.body;

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

    const accessToken = jwt.sign(
      { id: user.id, role: user.roleId, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    // tạo Refresh Token mới
    await RefreshToken.create({ token: refreshToken, userId: user.id });

    // Lưu Refresh Token vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

// // lấy thông tin ng dùng
// export const getUserInfo = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const user = await Users.findByPk(req.userId);
//     if (!user) {
//       res.status(404).json({ message: "Người dùng không tồn tại" });
//       return;
//     }

//     res.status(200).json({ user });
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };
