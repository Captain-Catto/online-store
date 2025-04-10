import { Request, Response, NextFunction } from "express";

export const roleMiddleware = (allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Không có quyền truy cập" });
      return; // Chỉ return không có giá trị
    }

    next();
  };
};
