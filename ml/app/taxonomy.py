"""Skill taxonomy for GapFit AI.

A curated list of canonical skill names. Both extraction methods map
raw text to these names.
"""

import re

SKILL_TAXONOMY: Set[str] = {
    # Programming languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go",
    "rust", "php", "swift", "kotlin", "scala", "r", "perl", "bash", "shell",
    "html", "css", "sql", "graphql", "dart", "lua", "haskell", "elixir",

    # Data science & ML
    "machine learning", "deep learning", "pandas", "numpy", "scikit-learn",
    "tensorflow", "pytorch", "keras", "matplotlib", "seaborn", "plotly",
    "tableau", "power bi", "statistics", "data analysis", "data visualization",
    "data science", "nlp", "natural language processing", "computer vision",
    "reinforcement learning", "neural networks", "feature engineering",
    "model evaluation", "hyperparameter tuning", "time series analysis",

    # Web development
    "react", "angular", "vue", "node.js", "express", "django", "flask",
    "fastapi", "next.js", "nuxt", "svelte", "sveltekit", "tailwind css",
    "bootstrap", "sass", "webpack", "vite", "rest api", "graphql api",
    "web development", "frontend development", "backend development",

    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "amazon web services",
    "docker", "kubernetes", "terraform", "jenkins", "github actions",
    "ci/cd", "devops", "cloud computing", "serverless", "microservices",

    # Databases
    "mongodb", "mysql", "postgresql", "postgres", "sqlite", "redis",
    "cassandra", "dynamodb", "firebase", "oracle", "mssql",

    # Tools & platforms
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "figma", "adobe creative suite", "canva", "notion", "trello",
    "asana", "slack", "microsoft office", "excel", "powerpoint", "word",

    # Soft skills
    "communication", "leadership", "teamwork", "problem solving",
    "project management", "agile", "scrum", "critical thinking",
    "creativity", "adaptability", "time management", "public speaking",
    "negotiation", "mentoring", "coaching", "conflict resolution",

    # Business
    "business analysis", "financial modeling", "market research",
    "digital marketing", "seo", "content marketing", "social media",
    "email marketing", "analytics", "a/b testing", "growth hacking",
    "product management", "user experience", "ux design", "ui design",
    "user research", "wireframing", "prototyping",
}


def normalize_skill(name: str) -> str:
    """Normalize a skill name to lowercase with single spaces."""
    return re.sub(r"\s+", " ", name.strip().lower())


def canonicalize_skill(name: str) -> str:
    """Map a raw skill name to the taxonomy if possible; otherwise return normalized."""
    normalized = normalize_skill(name)
    if normalized in SKILL_TAXONOMY:
        return normalized
    # Try partial match: if the raw name contains a taxonomy skill or vice versa
    for skill in SKILL_TAXONOMY:
        if skill in normalized or normalized in skill:
            return skill
    return normalized