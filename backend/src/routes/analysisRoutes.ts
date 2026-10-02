import { Router } from "express";
import { analyze, getHistory } from "../controllers/analysisController";
import { analyzeValidation } from "../validators/analysis";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/analyze", analyzeValidation, analyze);
router.get("/history", authenticate, getHistory);

export default router;