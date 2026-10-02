import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = (decoded as { userId: string }).userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}