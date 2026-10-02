import { useLocation } from "react-router-dom";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalysisResult {
  matchScore: number;
  resumeSkills: string[];
  jdSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  suggestions: string[];
  confidence: number;
  method: string;
}

export default function Results() {
  const { state } = useLocation();
  let parsedStoredResult: AnalysisResult | null = null;

  if (typeof window !== "undefined") {
    const storedResult = localStorage.getItem("gapfit-analysis-result");
    if (storedResult) {
      try {
        parsedStoredResult = JSON.parse(storedResult) as AnalysisResult;
      } catch {
        localStorage.removeItem("gapfit-analysis-result");
      }
    }
  }

  const result = (state as AnalysisResult | null) ?? parsedStoredResult;

  if (!result) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">No results</h2>
        <p className="text-gray-500 mt-2">
          Please analyze a resume first from the home page.
        </p>
      </div>
    );
  }

  const radarData = [
    { skill: "Matching", value: result.matchingSkills.length * 10 },
    { skill: "Missing", value: result.missingSkills.length * 10 },
    { skill: "Extra", value: result.extraSkills.length * 10 },
  ];

  const barData = [
    { name: "Match Score", value: result.matchScore },
    { name: "Confidence", value: Math.round(result.confidence * 100) },
  ];

  return (
    <div className="space-y-8 animate-bounce-in">
      <h1 className="text-3xl font-bold text-gray-800">Results</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Match Score</h2>
          <p className="text-4xl font-bold text-primary-600">
            {Math.round(result.matchScore * 100)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Confidence</h2>
          <p className="text-4xl font-bold text-green-600">
            {Math.round(result.confidence * 100)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Method</h2>
          <p className="text-lg font-semibold text-gray-700 capitalize">
            {result.method}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Skill Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis />
              <Radar
                name="Skills"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Score Metrics
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold text-green-700 mb-3">
            ✅ Matching Skills ({result.matchingSkills.length})
          </h2>
          {result.matchingSkills.length ? (
            <ul className="flex flex-wrap gap-2">
              {result.matchingSkills.map((s) => (
                <li key={s} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">None</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold text-red-700 mb-3">
            ❌ Missing Skills ({result.missingSkills.length})
          </h2>
          {result.missingSkills.length ? (
            <ul className="flex flex-wrap gap-2">
              {result.missingSkills.map((s) => (
                <li key={s} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-500">🎉 All required skills covered!</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          💡 Suggestions
        </h2>
        {result.suggestions.length ? (
          <ul className="list-disc pl-5 space-y-2">
            {result.suggestions.map((s, i) => (
              <li key={i} className="text-gray-600">
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No suggestions.</p>
        )}
      </div>
    </div>
  );
}