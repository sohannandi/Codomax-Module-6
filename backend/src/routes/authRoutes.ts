import { Router } from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/authController";
import { validate } from "../validators/auth";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").trim().notEmpty(),
    validate,
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
    validate,
  ],
  login
);

export default router;