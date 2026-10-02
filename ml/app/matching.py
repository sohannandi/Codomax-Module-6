"""Match scoring algorithms for GapFit AI.

Provides local skill extraction and weighted match scoring.
"""

import math
import re
from typing import Set, Tuple

from .taxonomy import SKILL_TAXONOMY, normalize_skill, canonicalize_skill


def extract_skills_local(text: str) -> Set[str]:
    """Extract skills from text using keyword matching against the taxonomy."""
    found = set()
    text_lower = text.lower()
    for skill in SKILL_TAXONOMY:
        # Use word-boundary regex to avoid partial matches
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            found.add(skill)
    return found


def jaccard_similarity(set_a: Set[str], set_b: Set[str]) -> float:
    """Jaccard index = |A ∩ B| / |A ∪ B|."""
    if not set_a and not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union else 0.0


def cosine_similarity(text_a: str, text_b: str) -> float:
    """
    Compute cosine similarity between two texts using a simple bag-of-words model.
    Returns a value in [0, 1].
    """
    if not text_a or not text_b:
        return 0.0

    words_a = set(re.findall(r"\b\w+\b", text_a.lower()))
    words_b = set(re.findall(r"\b\w+\b", text_b.lower()))

    # Remove very common English stopwords for better signal
    stopwords = {
        "the", "and", "or", "to", "of", "a", "in", "is", "it", "you",
        "for", "on", "with", "as", "at", "by", "from", "that", "this",
        "be", "are", "was", "were", "has", "have", "had", "will", "would",
        "can", "could", "should", "may", "might", "must", "shall", "do",
        "does", "did", "so", "such", "if", "then", "else", "when", "while",
        "i", "we", "they", "he", "she", "its", "our", "your", "their",
        "my", "me", "us", "him", "her", "them", "his", "hers", "theirs",
        "about", "into", "through", "during", "before", "after", "above",
        "below", "between", "under", "again", "further", "once", "here",
        "there", "all", "any", "both", "each", "few", "more", "most",
        "other", "some", "such", "no", "nor", "not", "only", "own", "same",
        "so", "than", "too", "very", "just", "now", "also", "because",
        "as", "until", "while", "of", "at", "by", "for", "with", "about",
        "against", "between", "into", "through", "during", "before",
        "after", "above", "below", "to", "from", "up", "down", "in", "out",
        "on", "off", "over", "under", "again", "further", "then", "once",
    }
    words_a = words_a - stopwords
    words_b = words_b - stopwords

    if not words_a or not words_b:
        return 0.0

    intersection = words_a & words_b
    dot_product = len(intersection)
    magnitude_a = math.sqrt(len(words_a))
    magnitude_b = math.sqrt(len(words_b))

    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0
    return dot_product / (magnitude_a * magnitude_b)


def compute_match_score(
    resume_skills: Set[str],
    jd_skills: Set[str],
    resume_text: str,
    jd_text: str,
) -> float:
    """
    Compute a weighted match score in [0, 1].

    score = w1 * jaccard + w2 * cosine + w3 * coverage
    """
    w1, w2, w3 = 0.4, 0.3, 0.3

    jaccard = jaccard_similarity(resume_skills, jd_skills)
    cosine = cosine_similarity(resume_text, jd_text)

    # Coverage: how many required skills are covered
    if jd_skills:
        coverage = len(resume_skills & jd_skills) / len(jd_skills)
    else:
        coverage = 0.0

    score = w1 * jaccard + w2 * cosine + w3 * coverage
    return min(max(score, 0.0), 1.0)


def compute_confidence(resume_text: str, jd_text: str) -> float:
    """
    Compute confidence in the analysis based on text length and JD clarity.
    Returns a value in [0, 1].
    """
    resume_len = len(resume_text)
    jd_len = len(jd_text)

    # Longer texts give more signal
    resume_conf = min(resume_len / 500, 1.0)  # saturates at 500 chars
    jd_conf = min(jd_len / 300, 1.0)  # saturates at 300 chars

    # Average of both
    return (resume_conf + jd_conf) / 2