import { Request, Response } from "express";
import Users from "../models/Users";
import RefreshToken from "../models/RefreshToken";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserAddress from "../models/UserAddress";
import Role from "../models/Role";
import PasswordReset from "../models/PasswordReset";
import crypto from "crypto";
import { sendEmail } from "../utils/email";
import { Op, Sequelize } from "sequelize";
import Order from "../models/Order";
import sequelize from "sequelize";

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

    // Tìm thêm thông tin người dùng từ database
    const user = await Users.findByPk(decoded.id);
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    // Tạo Access Token mới với đầy đủ thông tin
    const accessToken = jwt.sign(
      {
        id: user.id,
        role: user.roleId,
        username: user.username,
      },
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
      res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
      return;
    }

    // Kiểm tra trạng thái tài khoản
    if (!user.isActive) {
      res.status(403).json({
        message:
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ với quản trị viên.",
      });
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
      roleId: user.roleId,
    });

    console.log("Setting refresh token cookie:", {
      token: refreshToken.substring(0, 10) + "...",
      maxAge: refreshMaxAge,
      httpOnly: true,
    });

    // Lưu Refresh Token vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: refreshMaxAge,
      secure: process.env.NODE_ENV === "production", // Chỉ bật secure trong production
      sameSite: "lax", // Cần thiết cho các trình duyệt hiện đại
      path: "/", // Đảm bảo cookie có thể truy cập từ mọi đường dẫn
    });
    console.log("Cookie headers:", res.getHeaders());
    res.status(200).json({ message: "Đăng nhập thành công", accessToken });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng xuất
// Đăng xuất
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      // Không có token trong cookie, vẫn xóa cookie để đảm bảo
      res.clearCookie("refreshToken", {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.status(200).json({ message: "Đăng xuất thành công" });
      return;
    }

    // Kiểm tra token có tồn tại trong database không
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    // Nếu token tồn tại trong database, xóa nó
    if (storedToken) {
      await RefreshToken.destroy({
        where: { token: refreshToken },
      });
    }

    // Luôn xóa cookie bất kể token có trong database hay không
    res.clearCookie("refreshToken", {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error: any) {
    console.error("Logout error:", error);
    // Vẫn cố gắng xóa cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(200).json({ message: "Đăng xuất thành công" });
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
    const { id } = req.params;
    const user = await Users.findByPk(id, {
      attributes: {
        exclude: ["password"],
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM orders
              WHERE orders.userId = Users.id
            )`),
            "totalOrders",
          ],
          [
            Sequelize.literal(`(
              SELECT COALESCE(SUM(orders.total), 0)
              FROM orders
              WHERE orders.userId = Users.id
            )`),
            "totalSpent",
          ],
        ],
      },
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

// chỉ admin
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Sử dụng req.user từ middleware xác thực
    if (!req.user || req.user.role !== 1) {
      res.status(403).json({ message: "Không có quyền truy cập" });
      return;
    }

    // thêm điều kiện để lấy tất cả người dùng
    const { search } = req.query;
    const whereCondition: any = search
      ? {
          [Op.or]: [
            { username: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phoneNumber: { [Op.like]: `%${search}%` } },
            { roleId: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    // thêm điều kiện nếu như có truyền vào status
    if (req.query.status === "active") {
      whereCondition.isActive = true; // hoặc 1
    } else if (req.query.status === "inactive") {
      whereCondition.isActive = false; // hoặc 0
    } else {
      whereCondition.isActive = { [Op.ne]: null }; // Lấy tất cả người dùng có trạng thái không null
    }

    // Phân trang
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await Users.findAndCountAll({
      where: whereCondition,
      attributes: {
        exclude: ["password"],
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM orders
              WHERE orders.userId = Users.id
            )`),
            "totalOrders",
          ],
          [
            Sequelize.literal(`(
              SELECT COALESCE(SUM(orders.total), 0)
              FROM orders
              WHERE orders.userId = Users.id
            )`),
            "totalSpent",
          ],
        ],
      },
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
      distinct: true,
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
    console.error("Error in getAllUsers:", error);
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

// Quên mật khẩu
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email là bắt buộc" });
      return;
    }

    // Tìm người dùng theo email
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      // Vì lý do bảo mật, không tiết lộ là email không tồn tại
      res.status(200).json({
        message:
          "Đã gửi hướng dẫn đặt lại mật khẩu nếu email tồn tại trong hệ thống",
      });
      return;
    }

    // Xóa các token reset cũ của user này
    await PasswordReset.destroy({ where: { userId: user.id } });

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Thời gian hết hạn (1 giờ)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Lưu token vào database
    await PasswordReset.create({
      userId: user.id,
      token: resetToken,
      expiresAt,
    });

    // URL đặt lại mật khẩu
    const resetUrl = `${
      process.env.CLIENT_URL || "http://localhost:3001"
    }/reset-password/${resetToken}`;

    // Gửi email
    await sendEmail({
      to: email,
      subject: "Đặt lại mật khẩu",
      text: `Để đặt lại mật khẩu, vui lòng truy cập đường dẫn: ${resetUrl}. Đường dẫn này có hiệu lực trong 1 giờ.`,
      html: `
        <h1>Yêu cầu đặt lại mật khẩu</h1>
        <p>Chào bạn,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
        <a href="${resetUrl}" style="background-color:#4CAF50; color:white; padding:10px 15px; text-decoration:none; border-radius:5px; display:inline-block; margin:15px 0;">
          Đặt lại mật khẩu
        </a>
        <p>Đường dẫn này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `,
    });

    res.status(200).json({
      message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
    });
  } catch (error: any) {
    console.error("Lỗi quên mật khẩu:", error);
    res.status(500).json({
      message: "Đã có lỗi xảy ra khi xử lý yêu cầu đặt lại mật khẩu",
    });
  }
};

// Kiểm tra token đặt lại mật khẩu
export const validateResetToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;

    // Kiểm tra token có tồn tại và còn hiệu lực
    const resetRecord = await PasswordReset.findOne({
      where: {
        token,
        expiresAt: {
          [Op.gt]: new Date(), // Token chưa hết hạn
        },
      },
    });

    if (!resetRecord) {
      res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
      return;
    }

    res.status(200).json({ message: "Token hợp lệ" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
      return;
    }

    // Kiểm tra token có tồn tại và còn hiệu lực
    const resetRecord = await PasswordReset.findOne({
      where: {
        token,
        expiresAt: {
          [Op.gt]: new Date(), // Token chưa hết hạn
        },
      },
    });

    if (!resetRecord) {
      res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
      return;
    }

    // Lấy thông tin người dùng để cập nhật mật khẩu
    const user = await Users.findByPk(resetRecord.userId);
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cập nhật mật khẩu
    await user.update({ password: hashedPassword });

    // Xóa token đã sử dụng
    await resetRecord.destroy();

    // Xóa tất cả refresh tokens của người dùng này (đăng xuất khỏi tất cả thiết bị)
    await RefreshToken.destroy({ where: { userId: user.id } });

    res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error: any) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    res.status(500).json({ message: error.message });
  }
};

// Khóa/Mở khóa tài khoản người dùng (Admin only)
export const toggleUserStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || req.user.role !== 1) {
      res.status(403).json({ message: "Không có quyền truy cập" });
      return;
    }

    const userId = parseInt(req.params.id);

    // Tìm người dùng
    const user = await Users.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    // Không cho phép khóa tài khoản admin
    if (user.roleId === 1) {
      res
        .status(403)
        .json({ message: "Không thể khóa tài khoản quản trị viên" });
      return;
    }

    // Đảo ngược trạng thái
    const newStatus = !user.isActive;
    await user.update({ isActive: newStatus });

    // Nếu đang khóa tài khoản, xóa tất cả refresh tokens để đăng xuất khỏi tất cả thiết bị
    if (newStatus === false) {
      await RefreshToken.destroy({ where: { userId: user.id } });
    }

    res.status(200).json({
      message: `Tài khoản đã được ${newStatus ? "mở khóa" : "khóa"} thành công`,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
  }
};
