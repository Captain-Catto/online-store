import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

//middleware kiểm tra token
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  // nếu ko ko có token
  if (!token) {
    res.status(401).json({ message: "ko có token mà đòi vô" });
    return;
  }

  try {
    // kiểm tra token, nếu ko đúng sẽ bắn lỗi tham số truyền vào ko đúng với
    // yêu cầu của hàm verify
    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        message: "JWT_SECRET chưa đc cung cấp",
      });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "token đc cung cấp ko đúng" });
  }
};
