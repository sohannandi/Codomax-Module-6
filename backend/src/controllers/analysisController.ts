import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import mongoose from "mongoose";
import { Analysis } from "../models/Analysis";
import { config } from "../config";

async function callMlService(
  resumeText: string,
  jobDescription: string
): Promise<any> {
  const url = `${config.mlServiceUrl}/analyze`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    throw new Error("ML service unavailable");
  }
}

export const analyze = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeText, jobDescription } = req.body;

    const mlResult = await callMlService(resumeText, jobDescription);

    const analysis = new Analysis({
      userId: req.userId ? new mongoose.Types.ObjectId(req.userId) : undefined,
      resumeText,
      jobDescription,
      resumePreview: resumeText.slice(0, 200) + (resumeText.length > 200 ? "..." : ""),
      jdPreview: jobDescription.slice(0, 200) + (jobDescription.length > 200 ? "..." : ""),
      matchScore: mlResult.match_score,
      resumeSkills: mlResult.resume_skills,
      jdSkills: mlResult.jd_skills,
      matchingSkills: mlResult.matching_skills,
      missingSkills: mlResult.missing_skills,
      extraSkills: mlResult.extra_skills,
      suggestions: mlResult.suggestions,
      confidence: mlResult.confidence,
      method: mlResult.method,
    });

    await analysis.save();

    return res.status(200).json({
      analysisId: analysis._id,
      matchScore: analysis.matchScore,
      resumeSkills: analysis.resumeSkills,
      jdSkills: analysis.jdSkills,
      matchingSkills: analysis.matchingSkills,
      missingSkills: analysis.missingSkills,
      extraSkills: analysis.extraSkills,
      suggestions: analysis.suggestions,
      confidence: analysis.confidence,
      method: analysis.method,
      createdAt: analysis.createdAt,
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return res.status(500).json({ error: error.message || "Analysis failed" });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const history = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("matchScore createdAt resumePreview jdPreview");

    return res.status(200).json(history);
  } catch (error: any) {
    console.error("History error:", error);
    return res.status(500).json({ error: "Failed to retrieve history" });
  }
};