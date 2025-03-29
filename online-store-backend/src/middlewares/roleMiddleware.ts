import { Request, Response, NextFunction } from "express";

export const roleMiddleware = (roles: number[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.body.user.role;

    if (!roles.includes(userRole)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
};
