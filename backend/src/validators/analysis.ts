import { body, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const analyzeValidation = [
  body("resumeText")
    .trim()
    .isLength({ min: 1, max: 20000 })
    .withMessage("Resume text is required (max 20000 chars)"),
  body("jobDescription")
    .trim()
    .isLength({ min: 1, max: 20000 })
    .withMessage("Job description is required (max 20000 chars)"),
  validate,
];