import mongoose, { Document, Schema } from "mongoose";

export interface IAnalysis extends Document {
  userId?: mongoose.Types.ObjectId;
  resumeText: string;
  jobDescription: string;
  resumePreview: string;
  jdPreview: string;
  matchScore: number;
  resumeSkills: string[];
  jdSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  suggestions: string[];
  confidence: number;
  method: string;
  createdAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    resumeText: { type: String, required: true },
    jobDescription: { type: String, required: true },
    resumePreview: { type: String, required: true },
    jdPreview: { type: String, required: true },
    matchScore: { type: Number, required: true },
    resumeSkills: [{ type: String }],
    jdSkills: [{ type: String }],
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    extraSkills: [{ type: String }],
    suggestions: [{ type: String }],
    confidence: { type: Number, required: true },
    method: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AnalysisSchema.index({ userId: 1, createdAt: -1 });
AnalysisSchema.index({ createdAt: -1 });

export const Analysis = mongoose.model<IAnalysis>("Analysis", AnalysisSchema);