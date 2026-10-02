import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeAPI, AnalysisResult } from "@/services/api";

export default function Analyzer() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || !jdText.trim()) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeAPI(resumeText, jdText);
      setResult(data);
      localStorage.setItem("gapfit-analysis-result", JSON.stringify(data));
      navigate("/results", { state: data });
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-bounce-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Analyze Your Resume
      </h1>
      <p className="text-gray-500 mb-8">
        Paste your resume and a job description to see how well you match.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resume
          </label>
          <textarea
            rows={8}
            className="w-full border rounded-lg p-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            rows={8}
            className="w-full border rounded-lg p-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            placeholder="Paste the job description here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>
    </div>
  );
}