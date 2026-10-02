# PRD — AI Resume-to-Job Gap Analyzer (Final Project)

## 1. Project Overview

**Product Name:** GapFit AI  
**Tagline:** "Bridge the gap between your resume and your dream job."

**Description:** A full-stack web application that accepts a resume and a job description, analyzes them using AI/ML, and returns structured job-fit insights: skill overlap, missing skills, match score, and personalized improvement suggestions.

**Problem:** Job seekers struggle to tailor resumes to specific roles. Recruiters use ATS (Applicant Tracking Systems) that filter on keywords. Candidates lack visibility into which skills to highlight or acquire.

**Solution:** An AI-powered gap analyzer that parses both documents, extracts skills, computes semantic similarity, and delivers actionable feedback.

---

## 2. Problem Statement

- **Primary:** Candidates submit generic resumes that don't match job requirements, leading to low interview rates.
- **Secondary:** Recruiters receive mismatched applications; ATS filters out qualified candidates due to keyword gaps.
- **Opportunity:** Automate skill extraction and comparison to empower candidates with data-driven resume optimization.

---

## 3. Solution

A web application with three main user flows:
1. **Upload / Paste:** User provides resume text (or uploads PDF/DOCX) and job description text.
2. **Process:** Backend calls an AI/ML service to extract skills, compute match, and generate suggestions.
3. **Results:** Frontend displays a visual dashboard: match score, skill Venn diagram, missing skills with learning resources, and a downloadable report.

---

## 4. Features

### Core Features (MVP)
| ID | Feature | Description |
|----|---------|-------------|
| F1 | Resume Input | Text area + file upload (PDF, DOCX, TXT) |
| F2 | Job Description Input | Text area + file upload |
| F3 | AI Skill Extraction | LLM or ML model extracts canonical skills from both texts |
| F4 | Match Analysis | Compute Jaccard similarity + semantic similarity on skill sets |
| F5 | Results Dashboard | Match score (0–100%), Venn diagram, missing skills, suggestions |
| F6 | Download Report | PDF/JSON export of analysis |
| F7 | History | Persist analyses per user (auth required) |

### Enhanced Features (Post-MVP)
- User authentication (register/login, JWT)
- Saved analyses with re-run option
- LinkedIn profile import (OAuth)
- Skill learning resource links (Coursera, freeCodeCamp, etc.)
- ATS simulation preview
- Multi-language support

---

## 5. Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │    Backend      │      │   AI/ML Service │
│   (React/Vite)  │◄────►│  (Node/Express) │◄────►│   (Python)      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                       │                        │
         │                       ▼                        │
         │              ┌─────────────────┐              │
         └─────────────►│   Database      │◄─────────────┘
                        │   (MongoDB)     │
                        └─────────────────┘
```

### Component Details

**Frontend (React + Vite + Tailwind CSS)**
- Single-page app with responsive layout
- File upload with drag-and-drop
- Real-time progress indicator during analysis
- Results visualization (charts, tables, download button)
- Accessible (WCAG AA) and mobile-first

**Backend (Node.js + Express)**
- REST API: `POST /api/analyze`, `GET /api/history/:userId`
- Multer for file upload handling
- Input validation (express-validator)
- Rate limiting (express-rate-limit)
- CORS configuration
- Environment-based config

**AI/ML Service (Python FastAPI)**
- Endpoint: `POST /analyze` → returns structured JSON
- Two modes:
  1. **LLM mode:** Calls OpenAI/Gemini API with a structured prompt
  2. **Local ML mode:** TF-IDF + cosine similarity on skill vocabulary (fallback)
- Skill canonicalization using a curated taxonomy
- Returns: match_score, skill_sets, missing_skills, suggestions, confidence

**Database (MongoDB)**
- Collections: `users`, `analyses`
- Indexes on `userId`, `createdAt`
- TTL index for temporary uploads

---

## 6. Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Recharts (charts), React Hook Form |
| Backend | Node.js 20, Express 4, TypeScript, Zod (validation) |
| AI/ML | Python 3.11, FastAPI, scikit-learn, openai / google-generativeai (optional) |
| Database | MongoDB 6+ (Atlas or local) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| File Upload | Multer, pdf-parse, mammoth (DOCX) |
| Deployment | Frontend: Vercel/Netlify; Backend: Render/Railway; ML: Render/Modal; DB: MongoDB Atlas |
| CI/CD | GitHub Actions |

---

## 7. Installation & Setup

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB (local or Atlas)
- npm / pnpm

### Environment Variables
See `.env.example` in each service directory.

**Backend (`.env`)**
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/gapfit
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
```

**ML Service (`.env`)**
```env
PORT=8000
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
MODE=hybrid  # "llm", "local", or "hybrid"
```

**Frontend (`.env`)**
```env
VITE_API_URL=http://localhost:4000
```

### Running Locally

```bash
# 1. Start MongoDB (if local)
mongod

# 2. Backend
cd backend
npm install
npm run dev

# 3. ML Service
cd ml
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 4. Frontend
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

---

## 8. API Documentation

### POST `/api/analyze`
Analyze a resume against a job description.

**Request (multipart/form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| resume | file / string | Yes | Resume file (PDF/DOCX/TXT) or raw text |
| jobDescription | file / string | Yes | JD file or raw text |
| userId | string | No | Authenticated user ID (if logged in) |

**Response (200):**
```json
{
  "analysisId": "abc123",
  "matchScore": 78,
  "resumeSkills": ["python", "pandas", "sql", "communication"],
  "jdSkills": ["python", "pandas", "numpy", "sql", "tableau", "machine learning"],
  "matchingSkills": ["python", "pandas", "sql"],
  "missingSkills": ["numpy", "tableau", "machine learning"],
  "extraSkills": ["communication"],
  "suggestions": [
    "Add Tableau projects to your portfolio.",
    "Complete a Machine Learning course (e.g., Coursera ML Specialization)."
  ],
  "confidence": 0.92,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Errors:** 400 (validation), 413 (file too large), 500 (ML service error)

---

### GET `/api/history/:userId`
Retrieve past analyses for a user.

**Response (200):**
```json
[
  {
    "analysisId": "abc123",
    "matchScore": 78,
    "createdAt": "2024-01-15T10:30:00Z",
    "resumePreview": "Sohan Kumar - Junior Data Analyst...",
    "jdPreview": "Junior Data Analyst - Required Skills..."
  }
]
```

---

## 9. AI/ML Methodology

### Skill Taxonomy
A curated list of ~300 canonical skills organized by category (programming, data science, cloud, soft skills, etc.). Both extraction methods map raw text to this taxonomy.

### Extraction Methods
1. **LLM Extraction (Primary):**
   - Prompt engineered for structured JSON output
   - Few-shot examples for consistency
   - Temperature 0.1 for determinism
   - Model: GPT-3.5-turbo or Gemini Pro

2. **Local Extraction (Fallback):**
   - TF-IDF vectorization on skill taxonomy
   - Cosine similarity threshold to match phrases
   - Runs offline, no API cost

### Match Scoring
```
match_score = (w1 * jaccard) + (w2 * semantic_similarity) + (w3 * coverage)
```
- `jaccard` = |resume ∩ JD| / |resume ∪ JD|
- `semantic_similarity` = cosine similarity of skill embeddings (sentence-transformers)
- `coverage` = |resume ∩ JD| / |JD|
- Default weights: w1=0.4, w2=0.3, w3=0.3

### Confidence
Based on text length, extraction method agreement, and JD clarity.

---

## 10. Results & Metrics

### Expected Performance (MVP)
- End-to-end latency: < 3 seconds (LLM mode), < 1 second (local mode)
- Match accuracy (human eval): > 85% agreement
- Skill extraction F1: > 0.80 on annotated test set

### Success Metrics
- User completes analysis in < 2 minutes
- 70% of users download the report
- 40% return rate within 30 days

---

## 11. Limitations

- **LLM hallucination:** May invent skills; mitigated by taxonomy mapping
- **File parsing:** PDF/DOCX extraction quality varies; plain text fallback
- **Domain specificity:** Taxonomy biased toward tech roles; needs expansion for other domains
- **Cost:** LLM API calls incur per-analysis cost; local mode is free but less accurate
- **No guarantee:** Tool provides guidance, not hiring decisions

---

## 12. Future Improvements

1. **Fine-tuned model:** Train a small BERT classifier on labeled resume-JD pairs
2. **ATS simulation:** Emulate common ATS parsing and scoring
3. **Resume rewrite:** Generate an optimized resume version
4. **Company-specific models:** Learn from a company's historical hires
5. **Mobile app:** React Native wrapper
6. **Team features:** Recruiter dashboard for bulk analysis

---

## 13. Screenshots

> Add screenshots here after implementation.

| Screen | Description |
|--------|-------------|
| `screenshots/home.png` | Landing page with upload areas |
| `screenshots/loading.png` | Analysis progress indicator |
| `screenshots/results.png` | Results dashboard with charts |
| `screenshots/history.png` | User analysis history |

---

## 14. Contributors

- Sohan Kumar — Full-stack development, ML, documentation

---

## 15. License

MIT License — see LICENSE file.