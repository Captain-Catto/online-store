// Sửa file online-store-backend/src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Mở rộng interface Request để bao gồm user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: number;
        username: string;
      };
    }
  }
}
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Không tìm thấy token" });
      return; // Chỉ return không có giá trị
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Đặt thông tin user vào req.user
    req.user = {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
    };

    next(); // Gọi next() để tiếp tục middleware chain
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
    return; // Chỉ return không có giá trị
  }
};
