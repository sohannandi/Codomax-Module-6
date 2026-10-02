import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { config } from "../config";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, name });

    const token = jwt.sign(
      { userId: String(user._id) },
      config.jwtSecret as jwt.Secret,
      { expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"] }
    );

    return res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: String(user._id) },
      config.jwtSecret as jwt.Secret,
      { expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"] }
    );

    return res.status(200).json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
};