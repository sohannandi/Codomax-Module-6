const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface AnalyzeResponse {
  analysisId: string;
  matchScore: number;
  resumeSkills: string[];
  jdSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  suggestions: string[];
  confidence: number;
  method: string;
  createdAt: string;
}

export type AnalysisResult = AnalyzeResponse;

export async function analyzeAPI(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jobDescription }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Analysis failed");
  }
  return response.json();
}

export async function getHistoryAPI(token: string) {
  const response = await fetch(`${API_URL}/api/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }
  return response.json();
}

export async function registerAPI(
  email: string,
  password: string,
  name: string
) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Registration failed");
  }
  return response.json();
}

export async function loginAPI(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Login failed");
  }
  return response.json();
}