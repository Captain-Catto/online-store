"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserByAdmin = exports.toggleUserStatus = exports.resetPassword = exports.validateResetToken = exports.forgotPassword = exports.updateUser = exports.getAllUsers = exports.getUserById = exports.getCurrentUser = exports.logout = exports.login = exports.register = exports.refreshToken = void 0;
const Users_1 = __importDefault(require("../models/Users"));
const RefreshToken_1 = __importDefault(require("../models/RefreshToken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserAddress_1 = __importDefault(require("../models/UserAddress"));
const Role_1 = __importDefault(require("../models/Role"));
const PasswordReset_1 = __importDefault(require("../models/PasswordReset"));
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../utils/email");
const sequelize_1 = require("sequelize");
// Tạo mới access token
const refreshToken = async (req, res) => {
    try {
        // Lấy refreshToken từ cookie
        const refreshToken = req.cookies.refreshToken;
        // Trường hợp 1: Không tìm thấy token trong cookie
        if (!refreshToken) {
            // Vẫn nên xóa cookie để đảm bảo
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
            });
            res.status(401).json({ message: "Không tìm thấy Refresh Token" });
            return;
        }
        // Tìm token trong database
        const tokenRecord = await RefreshToken_1.default.findOne({
            where: { token: refreshToken },
            include: [
                {
                    model: Users_1.default,
                    as: "user",
                    attributes: ["id", "username", "roleId"],
                },
            ],
        });
        // Trường hợp 2: Token không tìm thấy trong database
        if (!tokenRecord) {
            // Xóa cookie vì token không hợp lệ
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
            });
            res.status(401).json({ message: "Refresh Token không hợp lệ" });
            return;
        }
        // Xác thực Refresh Token
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            // Tạo access token mới
            const accessToken = jsonwebtoken_1.default.sign({
                id: decoded.id,
                role: decoded.role,
            }, process.env.JWT_SECRET, { expiresIn: "15m" });
            // Trả về access token mới
            res.status(200).json({
                message: "Token đã được làm mới",
                accessToken,
            });
        }
        catch (error) {
            // Token hết hạn hoặc không hợp lệ
            // Xóa token khỏi database
            await tokenRecord.destroy();
            // Xóa cookie
            res.clearCookie("refreshToken");
            res.status(401).json({ message: "Refresh Token hết hạn" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.refreshToken = refreshToken;
// Đăng ký
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Kiểm tra email đã tồn tại chưa
        const user = await Users_1.default.findOne({ where: { email } });
        if (user) {
            res.status(400).json({ message: "Email đã tồn tại" });
            return;
        }
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Tạo user mới
        await Users_1.default.create({
            email,
            password: hashedPassword,
        });
        res.status(201).json({ message: "Đăng ký thành công" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.register = register;
// Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const user = await Users_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
            return;
        }
        // Kiểm tra trạng thái tài khoản
        if (!user.isActive) {
            res.status(403).json({
                message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ với quản trị viên.",
            });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
            return;
        }
        const refreshExpiration = rememberMe ? "30d" : "7d";
        const refreshMaxAge = rememberMe
            ? 30 * 24 * 60 * 60 * 1000 // 30 ngày
            : 7 * 24 * 60 * 60 * 1000; // 7 ngày
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.roleId, username: user.username }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.roleId }, process.env.JWT_REFRESH_SECRET, { expiresIn: refreshExpiration });
        // tạo Refresh Token mới
        await RefreshToken_1.default.create({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.login = login;
// Đăng xuất
// Đăng xuất
const logout = async (req, res) => {
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
        const storedToken = await RefreshToken_1.default.findOne({
            where: { token: refreshToken },
        });
        // Nếu token tồn tại trong database, xóa nó
        if (storedToken) {
            await RefreshToken_1.default.destroy({
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
    }
    catch (error) {
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
exports.logout = logout;
// Lấy thông tin người dùng hiện tại
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Không có thông tin người dùng" });
            return;
        }
        const user = await Users_1.default.findByPk(req.user.id, {
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: Role_1.default,
                    as: "role",
                    attributes: ["id", "name"],
                },
                {
                    model: UserAddress_1.default,
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
    }
    catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getCurrentUser = getCurrentUser;
// Lấy thông tin người dùng theo ID (admin only)
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Users_1.default.findByPk(id, {
            attributes: {
                exclude: ["password"],
                include: [
                    [
                        sequelize_1.Sequelize.literal(`(
              SELECT COUNT(*)
              FROM orders
              WHERE orders.userId = users.id
            )`),
                        "totalOrders",
                    ],
                    [
                        // tính tổng giá trị đơn hàng đã hoàn thành thay vì tổng tất cả đơn hàng
                        sequelize_1.Sequelize.literal(`(
              SELECT COALESCE(SUM(orders.total), 0)
              FROM orders
              WHERE orders.userId = Users.id AND orders.status = 'delivered'
            )`),
                        "totalSpent",
                    ],
                ],
            },
            include: [
                {
                    model: Role_1.default,
                    as: "role",
                    attributes: ["id", "name"],
                },
                {
                    model: UserAddress_1.default,
                    as: "addresses",
                },
            ],
        });
        if (!user) {
            res.status(404).json({ message: "Người dùng không tồn tại" });
            return;
        }
        if (req.user?.role === 2) {
            // Ẩn một phần email và số điện thoại
            if (user.email) {
                // Ẩn một phần email chừa lại 4 ký tự đầu và 4 ký tự sau trước @
                // nếu dưới 10 thì chừa lại 4 ký tự cuối,
                // nếu như dưới 4 ký tự thì ẩn hết
                user.email = user.email.replace(/^(.{4})(.*)(@.*)$/, (match, p1, p2, p3) => {
                    if (p1.length + p2.length < 10) {
                        // Nếu phần trước @ có dưới 10 ký tự
                        if (p1.length + p2.length <= 4) {
                            // Nếu phần trước @ ngắn (≤ 4 ký tự), ẩn hết
                            return `${"*".repeat(p1.length + p2.length)}${p3}`;
                        }
                        else {
                            // Giữ 4 ký tự cuối trước @
                            return `${"*".repeat(p1.length + p2.length - 4)}${p2.slice(-4)}${p3}`;
                        }
                    }
                    else {
                        // Giữ 4 ký tự đầu và 4 ký tự cuối trước @
                        return `${p1}${"*".repeat(p2.length - 4)}${p2.slice(-4)}${p3}`;
                    }
                });
            }
            if (user.phoneNumber) {
                // nửa đầu của số điện thoại
                user.phoneNumber =
                    user.phoneNumber.substring(0, 3) +
                        "***" +
                        // nửa sau của số điện thoại
                        (user.phoneNumber.length > 6
                            ? user.phoneNumber.substring(user.phoneNumber.length - 4)
                            : "");
            }
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUserById = getUserById;
// chỉ admin
const getAllUsers = async (req, res) => {
    try {
        // Sử dụng req.user từ middleware xác thực
        if (!req.user || (req.user.role !== 1 && req.user.role !== 2)) {
            res.status(403).json({ message: "Không có quyền truy cập" });
            return;
        }
        // thêm điều kiện để lấy tất cả người dùng
        const { search } = req.query;
        const whereCondition = search
            ? {
                [sequelize_1.Op.or]: [
                    { username: { [sequelize_1.Op.like]: `%${search}%` } },
                    { email: { [sequelize_1.Op.like]: `%${search}%` } },
                    { phoneNumber: { [sequelize_1.Op.like]: `%${search}%` } },
                    { roleId: { [sequelize_1.Op.like]: `%${search}%` } },
                ],
            }
            : {};
        // thêm điều kiện nếu như có truyền vào status
        if (req.query.status === "active") {
            whereCondition.isActive = true; // hoặc 1
        }
        else if (req.query.status === "inactive") {
            whereCondition.isActive = false; // hoặc 0
        }
        else {
            whereCondition.isActive = { [sequelize_1.Op.ne]: null }; // Lấy tất cả người dùng có trạng thái không null
        }
        // Phân trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows: users } = await Users_1.default.findAndCountAll({
            where: whereCondition,
            attributes: {
                exclude: ["password"],
                include: [
                    [
                        sequelize_1.Sequelize.literal(`(
              SELECT COUNT(*)
              FROM orders
              WHERE orders.userId = users.id
            )`),
                        "totalOrders",
                    ],
                    [
                        // tính tổng giá trị đơn hàng đã hoàn thành thay vì tổng tất cả đơn hàng
                        sequelize_1.Sequelize.literal(`(
              SELECT COALESCE(SUM(orders.total), 0)
              FROM orders
              WHERE orders.userId = Users.id AND orders.status = 'delivered'
            )`),
                        "totalSpent",
                    ],
                ],
            },
            include: [
                {
                    model: Role_1.default,
                    as: "role",
                    attributes: ["id", "name"],
                },
            ],
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            distinct: true,
        });
        // Kiểm tra nếu user hiện tại là employee (role 3), ẩn một phần thông tin nhạy cảm
        if (req.user?.role === 2) {
            users.forEach((user) => {
                // Ẩn một phần email
                user.email = user.email.replace(/^(.{4})(.*)(@.*)$/, (match, p1, p2, p3) => {
                    if (p1.length + p2.length < 10) {
                        // Nếu phần trước @ có dưới 10 ký tự
                        if (p1.length + p2.length <= 4) {
                            // Nếu phần trước @ ngắn (≤ 4 ký tự), ẩn hết
                            return `${"*".repeat(p1.length + p2.length)}${p3}`;
                        }
                        else {
                            // Giữ 4 ký tự cuối trước @
                            return `${"*".repeat(p1.length + p2.length - 4)}${p2.slice(-4)}${p3}`;
                        }
                    }
                    else {
                        // Giữ 4 ký tự đầu và 4 ký tự cuối trước @
                        return `${p1}${"*".repeat(p2.length - 4)}${p2.slice(-4)}${p3}`;
                    }
                });
                // Ẩn một phần số điện thoại
                if (user.phoneNumber) {
                    user.phoneNumber =
                        user.phoneNumber.substring(0, 3) +
                            "***" +
                            (user.phoneNumber.length > 6
                                ? user.phoneNumber.substring(user.phoneNumber.length - 4)
                                : "");
                }
            });
        }
        res.status(200).json({
            users,
            pagination: {
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: page,
                perPage: limit,
            },
        });
    }
    catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAllUsers = getAllUsers;
// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Không có thông tin người dùng" });
            return;
        }
        const userId = req.user.id;
        const { username, phoneNumber, dateOfBirth } = req.body;
        const user = await Users_1.default.findByPk(userId);
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
        const updatedUser = await Users_1.default.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });
        res.status(200).json({
            message: "Cập nhật thông tin thành công",
            user: updatedUser,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateUser = updateUser;
// Quên mật khẩu
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email là bắt buộc" });
            return;
        }
        // Tìm người dùng theo email
        const user = await Users_1.default.findOne({ where: { email } });
        if (!user) {
            // Vì lý do bảo mật, không tiết lộ là email không tồn tại
            res.status(200).json({
                message: "Đã gửi hướng dẫn đặt lại mật khẩu nếu email tồn tại trong hệ thống",
            });
            return;
        }
        // Xóa các token reset cũ của user này
        await PasswordReset_1.default.destroy({ where: { userId: user.id } });
        // Tạo token ngẫu nhiên
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        // Thời gian hết hạn (1 giờ)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        // Lưu token vào database
        await PasswordReset_1.default.create({
            userId: user.id,
            token: resetToken,
            expiresAt,
        });
        // URL đặt lại mật khẩu
        const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3001"}/reset-password/${resetToken}`;
        // Gửi email
        await (0, email_1.sendEmail)({
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
    }
    catch (error) {
        console.error("Lỗi quên mật khẩu:", error);
        res.status(500).json({
            message: "Đã có lỗi xảy ra khi xử lý yêu cầu đặt lại mật khẩu",
        });
    }
};
exports.forgotPassword = forgotPassword;
// Kiểm tra token đặt lại mật khẩu
const validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        // Kiểm tra token có tồn tại và còn hiệu lực
        const resetRecord = await PasswordReset_1.default.findOne({
            where: {
                token,
                expiresAt: {
                    [sequelize_1.Op.gt]: new Date(), // Token chưa hết hạn
                },
            },
        });
        if (!resetRecord) {
            res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
            return;
        }
        res.status(200).json({ message: "Token hợp lệ" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.validateResetToken = validateResetToken;
// Đặt lại mật khẩu
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!password || password.length < 6) {
            res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
            return;
        }
        // Kiểm tra token có tồn tại và còn hiệu lực
        const resetRecord = await PasswordReset_1.default.findOne({
            where: {
                token,
                expiresAt: {
                    [sequelize_1.Op.gt]: new Date(), // Token chưa hết hạn
                },
            },
        });
        if (!resetRecord) {
            res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
            return;
        }
        // Lấy thông tin người dùng để cập nhật mật khẩu
        const user = await Users_1.default.findByPk(resetRecord.userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Cập nhật mật khẩu
        await user.update({ password: hashedPassword });
        // Xóa token đã sử dụng
        await resetRecord.destroy();
        // Xóa tất cả refresh tokens của người dùng này (đăng xuất khỏi tất cả thiết bị)
        await RefreshToken_1.default.destroy({ where: { userId: user.id } });
        res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
    }
    catch (error) {
        console.error("Lỗi đặt lại mật khẩu:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.resetPassword = resetPassword;
// Khóa/Mở khóa tài khoản người dùng (Admin only)
const toggleUserStatus = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user || req.user.role !== 1) {
            res.status(403).json({ message: "Không có quyền truy cập" });
            return;
        }
        const userId = parseInt(req.params.id);
        // Tìm người dùng
        const user = await Users_1.default.findByPk(userId);
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
            await RefreshToken_1.default.destroy({ where: { userId: user.id } });
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
    }
    catch (error) {
        console.error("Error toggling user status:", error);
        res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
    }
};
exports.toggleUserStatus = toggleUserStatus;
// update thông tin người dùng (admin only)
const updateUserByAdmin = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.user || req.user.role !== 1) {
            res.status(403).json({ message: "Không có quyền truy cập" });
            return;
        }
        const userId = parseInt(req.params.id);
        const { username, phoneNumber, dateOfBirth } = req.body;
        // validate dữ liệu đầu vào
        if (!username) {
            res.status(400).json({ message: "Tên người dùng là bắt buộc" });
            return;
        }
        // kiểm tra sdt có hợp lệ hay không
        // Số điện thoại từ 10 đến 15 chữ số
        // Regex cho số điện thoại Việt Nam
        const phoneRegex = /^(0[3|5|7|8|9]|[1-9][0-9])[0-9]{8,14}$/;
        if (phoneNumber && !phoneRegex.test(phoneNumber)) {
            res.status(400).json({
                message: "Số điện thoại không hợp lệ, Số điện thoại từ 10-15 chữ số, đúng định dạng 0xx-xxx-xxxx",
            });
            return;
        }
        // Tìm người dùng
        const user = await Users_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        // Cập nhật thông tin người dùng
        await user.update({
            username,
            phoneNumber,
            dateOfBirth,
        });
        res.status(200).json({
            message: "Cập nhật thông tin thành công",
            user: {
                id: user.id,
                username: user.username,
                phoneNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth,
            },
        });
    }
    catch (error) {
        console.error("Error updating user by admin:", error);
        res.status(500).json({ message: error.message || "Đã xảy ra lỗi" });
    }
};
exports.updateUserByAdmin = updateUserByAdmin;
