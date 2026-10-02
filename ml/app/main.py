"""GapFit AI — ML Service (FastAPI).

Provides skill extraction and match scoring for resume vs job description.
Supports LLM mode (OpenAI/Gemini) and local mode (TF-IDF + cosine similarity).
"""

import os
import re
from typing import List, Dict, Set, Tuple
from dataclasses import dataclass, asdict

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from .taxonomy import SKILL_TAXONOMY, normalize_skill
from .matching import (
    extract_skills_local,
    jaccard_similarity,
    cosine_similarity,
    compute_match_score,
    compute_confidence,
)

load_dotenv()

app = FastAPI(title="GapFit AI ML Service", version="1.0.0")

# CORS — restrict to frontend in production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., min_length=1, max_length=20000)
    job_description: str = Field(..., min_length=1, maxLength=20000)


class AnalyzeResponse(BaseModel):
    match_score: float
    resume_skills: List[str]
    jd_skills: List[str]
    matching_skills: List[str]
    missing_skills: List[str]
    extra_skills: List[str]
    suggestions: List[str]
    confidence: float
    method: str


class HealthResponse(BaseModel):
    status: str
    version: str
    mode: str


@app.get("/health", response_model=HealthResponse)
async def health():
    return {
        "status": "ok",
        "version": "1.0.0",
        "mode": os.getenv("MODE", "local"),
    }


def extract_skills_llm(text: str) -> Set[str]:
    """Extract skills using an LLM (OpenAI or Gemini). Falls back to local on failure."""
    mode = os.getenv("MODE", "local")

    if mode == "openai":
        try:
            import openai
            openai.api_key = os.getenv("OPENAI_API_KEY")
            if not openai.api_key:
                raise ValueError("OPENAI_API_KEY not set")

            prompt = (
                "Extract the canonical skills from the following text. "
                "Return ONLY a JSON array of skill names (lowercase, short phrases). "
                "Use only skills from this taxonomy: "
                + ", ".join(sorted(SKILL_TAXONOMY))
                + "\n\nText: " + text
            )

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
            )
            import json
            skills = json.loads(response.choices[0].message["content"])
            return {normalize_skill(s) for s in skills if s}
        except Exception as e:
            print(f"LLM extraction failed ({e}); falling back to local")
            return extract_skills_local(text)

    elif mode == "gemini":
        try:
            import google.generativeai as genai
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("GEMINI_API_KEY not set")
            genai.configure(api_key=api_key)

            model = genai.GenerativeModel("gemini-pro")
            prompt = (
                "Extract canonical skills from the text. "
                "Return ONLY a JSON array of skill names (lowercase). "
                "Taxonomy: " + ", ".join(sorted(SKILL_TAXONOMY))
                + "\n\nText: " + text
            )
            response = model.generate_content(prompt)
            import json
            skills = json.loads(response.text)
            return {normalize_skill(s) for s in skills if s}
        except Exception as e:
            print(f"LLM extraction failed ({e}); falling back to local")
            return extract_skills_local(text)

    # Default: local
    return extract_skills_local(text)


def generate_suggestions(missing: Set[str], extra: Set[str]) -> List[str]:
    """Generate actionable suggestions based on missing/extra skills."""
    suggestions = []
    if missing:
        top_missing = sorted(missing)[:3]
        suggestions.append(
            f"Consider gaining experience in: {', '.join(top_missing)}."
        )
    if len(missing) > 3:
        suggestions.append(
            "Prioritize the top 2-3 missing skills based on the job's most important requirements."
        )
    if extra:
        suggestions.append(
            f"Your additional skills ({', '.join(sorted(extra))}) may be valuable for related roles."
        )
    if not missing and not extra:
        suggestions.append("Excellent match! Consider highlighting quantifiable achievements.")
    return suggestions


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    """Analyze a resume against a job description."""
    try:
        resume_skills = extract_skills_llm(req.resume_text)
        jd_skills = extract_skills_llm(req.job_description)

        matching = resume_skills & jd_skills
        missing = jd_skills - resume_skills
        extra = resume_skills - jd_skills

        match_score = compute_match_score(
            resume_skills, jd_skills, req.resume_text, req.job_description
        )
        confidence = compute_confidence(req.resume_text, req.job_description)

        suggestions = generate_suggestions(missing, extra)

        method = os.getenv("MODE", "local")
        if method in ("openai", "gemini"):
            method = f"llm-{method}"
        else:
            method = "local"

        return {
            "match_score": round(match_score, 2),
            "resume_skills": sorted(resume_skills),
            "jd_skills": sorted(jd_skills),
            "matching_skills": sorted(matching),
            "missing_skills": sorted(missing),
            "extra_skills": sorted(extra),
            "suggestions": suggestions,
            "confidence": round(confidence, 2),
            "method": method,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))