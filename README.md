# GapFit AI

GapFit AI is a full-stack resume-to-job matching application that compares a candidate's resume against a job description and highlights the strongest matches, missing skills, and improvement suggestions. It combines a React frontend, an Express backend, and a Python FastAPI ML service to deliver a practical AI-powered hiring insight dashboard.

This project was built as part of the Codomax AI & Machine Learning Internship.

## Local Services

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- ML API: http://localhost:8000

## Project Overview

The platform helps job seekers understand how well their resume aligns with a role by:

- analyzing the resume and job description text
- extracting relevant skills from both sources
- calculating a match score based on skill overlap and content similarity
- identifying missing and extra skills
- providing actionable improvement suggestions
- showing the result in a simple dashboard UI

## Features

- Resume and job description input form
- AI/ML-powered skill extraction
- Skill match analysis and scoring
- Missing and matching skill breakdown
- Personalized improvement suggestions
- Local result persistence after analysis
- JWT-based auth flow for login and registration
- History support for saved analyses
- Responsive UI for desktop and mobile views

## Tech Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Recharts

### Backend
- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- JWT
- bcryptjs
- Express Validator
- Rate Limiting

### AI / ML Service
- Python
- FastAPI
- Pydantic
- FastAPI CORS
- Skill taxonomy matching
- Jaccard + cosine similarity scoring

## Project Structure

```text
Module-6-Final-Project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
├── ml/
│   ├── app/
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   └── PRD.md
├── README.md
└── .gitignore
```

## Prerequisites

Before running this project locally, make sure you have:

- Node.js 18+
- Python 3.10+
- MongoDB running locally or a MongoDB Atlas connection string
- npm
- pip

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/sohannandi/Codomax-Module-6.git
cd Codomax-Module-6
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../backend
npm install
```

### 4. Install ML dependencies

```bash
cd ../ml
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 5. Configure environment variables

Create `.env` files as needed for the backend and ML service.

#### Backend example

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/gapfit
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
```

#### ML example

```env
MODE=local
ALLOWED_ORIGINS=http://localhost:5173
```

## Running the Project

### Start the ML service

```bash
cd ml
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start the backend

```bash
cd backend
npm run dev
```

### Start the frontend

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Then open:

```text
http://localhost:5173
```

## API Endpoints

### Authentication

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive a JWT

### Analysis

- `POST /api/analyze` — Analyze resume vs job description
- `GET /api/history` — Get analysis history for authenticated user

### Health Check

- `GET /health` — Backend health endpoint
- `GET /health` in the ML service — ML health check

## How the Match Score Works

The ML service calculates a weighted match score using:

- Jaccard similarity between identified skills
- cosine similarity between the resume and job description text
- skill coverage of required job skills

The final score is normalized between 0 and 1 and then displayed as a percentage on the frontend.

## Example Result

The app shows:

- match score
- confidence score
- matching skills
- missing skills
- extra skills
- improvement suggestions

This makes it useful for job seekers and recruiters to quickly evaluate alignment between resume and role.


## Roadmap

Future improvements could include:

- PDF/DOCX resume upload support
- advanced NLP skill extraction
- recruiter dashboard
- ATS simulation
- PDF export of results
- personalization and saved candidate profiles

## License

No license file is currently included in this repository.
