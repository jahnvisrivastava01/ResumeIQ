import json
import re
from pathlib import Path
from typing import Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = Path(__file__).resolve().parents[1]
ROLES_PATH = BASE_DIR / "roles.json"

with ROLES_PATH.open("r", encoding="utf-8") as handle:
    ROLES: dict[str, list[str]] = json.load(handle)

# Canonical skill names and common spellings. Matching is intentionally transparent, not an ATS verdict.
SKILL_ALIASES = {
    "javascript": ["javascript", "js"], "typescript": ["typescript", "ts"],
    "react": ["react", "react.js", "react js"], "node.js": ["node.js", "node js", "nodejs"],
    "express.js": ["express", "express.js", "express js"], "mongodb": ["mongodb", "mongo db"],
    "sql": ["sql", "mysql", "postgresql", "postgres", "sqlite", "sql server"],
    "html": ["html", "html5"], "css": ["css", "css3"], "tailwind css": ["tailwind", "tailwind css"],
    "python": ["python"], "fastapi": ["fastapi"], "flask": ["flask"], "django": ["django"],
    "java": ["java"], "spring boot": ["spring boot"], "c++": ["c++"], "c#": ["c#", "c sharp"],
    "rest api": ["rest api", "restful api", "rest apis", "api development"],
    "git": ["git", "github"], "docker": ["docker"], "aws": ["aws", "amazon web services"],
    "firebase": ["firebase", "firebase authentication", "firestore"], "flutter": ["flutter"], "dart": ["dart"],
    "scikit-learn": ["scikit-learn", "scikit learn", "sklearn"], "machine learning": ["machine learning", "ml"],
    "pandas": ["pandas"], "numpy": ["numpy"], "power bi": ["power bi", "powerbi"],
    "excel": ["excel", "microsoft excel"], "tableau": ["tableau"], "communication": ["communication"],
    "problem solving": ["problem solving", "problem-solving"], "oop": ["oop", "object oriented programming", "object-oriented programming"],
    "data structures and algorithms": ["data structures", "algorithms", "dsa"],
    "authentication": ["authentication", "authorization", "jwt", "oauth"],
    "testing": ["unit testing", "integration testing", "pytest", "jest", "testing"],
    "ci/cd": ["ci/cd", "ci cd", "continuous integration", "continuous deployment"],
    "responsive design": ["responsive design", "responsive ui", "responsive layout"],
}


def _contains_phrase(text: str, phrase: str) -> bool:
    phrase = phrase.lower().strip()
    if not phrase:
        return False
    # Word boundaries prevent e.g. "java" from matching "javascript".
    return re.search(r"(?<![a-z0-9+#])" + re.escape(phrase) + r"(?![a-z0-9+#])", text) is not None


def extract_skills(text: str) -> list[str]:
    lower = text.lower()
    found = []
    for canonical, aliases in SKILL_ALIASES.items():
        if any(_contains_phrase(lower, alias) for alias in aliases):
            found.append(canonical)
    return sorted(set(found))


def _canonical_requirement(skill: str) -> str:
    value = skill.strip().lower()
    for canonical, aliases in SKILL_ALIASES.items():
        if value == canonical or value in aliases:
            return canonical
    return value


def _similarity(resume_text: str, job_text: str) -> int:
    if not resume_text.strip() or not job_text.strip():
        return 0
    try:
        matrix = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=6000).fit_transform([resume_text, job_text])
        return round(float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0]) * 100)
    except ValueError:
        return 0


def _role_prediction(text: str) -> str:
    # Load the optional model lazily. If it has not been trained yet, a safe keyword-based fallback keeps the API usable.
    model_path = BASE_DIR / "model.pkl"
    if model_path.exists():
        try:
            import pickle
            with model_path.open("rb") as handle:
                model = pickle.load(handle)
            return str(model.predict([text])[0])
        except Exception:
            pass
    lowered = text.lower()
    candidates = []
    for role, skills in ROLES.items():
        count = sum(1 for skill in skills if _contains_phrase(lowered, skill))
        candidates.append((count, role))
    return max(candidates, default=(0, "general fresher"))[1]


def analyze_resume(resume_text: str, role: str | None = None, job_description: str | None = None) -> dict[str, Any]:
    if not resume_text or len(resume_text.strip()) < 30:
        raise ValueError("Not enough resume text to analyze.")

    resume_lower = resume_text.lower()
    resume_skills = extract_skills(resume_text)
    target_role = (role or "").strip().lower()
    jd = (job_description or "").strip()

    if jd:
        required_skills = extract_skills(jd)
        # Include explicitly mentioned role taxonomy skills where present in the job description.
        if target_role in ROLES:
            required_skills = sorted(set(required_skills) | {s for s in ROLES[target_role] if _contains_phrase(jd.lower(), s)})
        required_skills = sorted({_canonical_requirement(skill) for skill in required_skills})
        comparison_text = jd
        mode = "job_description"
    elif target_role in ROLES:
        required_skills = sorted({_canonical_requirement(skill) for skill in ROLES[target_role]})
        comparison_text = " ".join(required_skills)
        mode = "role_template"
    else:
        raise ValueError("Choose a target role or provide a job description.")

    found = [s for s in required_skills if any(_contains_phrase(resume_lower, alias) for alias in SKILL_ALIASES.get(s, [s]))]
    missing = [s for s in required_skills if s not in found]
    coverage = round(len(found) / len(required_skills) * 100) if required_skills else 0
    similarity = _similarity(resume_text, comparison_text)
    # Transparent blend; when no recognizable skill requirements are present, rely on text similarity only.
    score = round(0.75 * coverage + 0.25 * similarity) if required_skills else similarity

    if score >= 75:
        label = "Strong alignment"
    elif score >= 50:
        label = "Partial alignment"
    else:
        label = "More tailoring recommended"

    recommendations = []
    if missing:
        recommendations.append("Review these requirements and, where you have the experience, make the evidence clearer in your resume: " + ", ".join(missing[:12]) + ("…" if len(missing) > 12 else "."))
    if not missing:
        recommendations.append("The listed requirements were detected in the resume. Strengthen the most relevant experience bullets with specific context and verifiable outcomes where available.")
    recommendations.append("Use relevant keywords naturally and only claim skills or experience you can explain in an interview.")
    if similarity < 25:
        recommendations.append("The resume text has low overall wording similarity to the target. Tailor the summary and project descriptions to the role using accurate, evidence-backed language.")

    return {
        "target_role": role.strip() if role else "Custom job description",
        "analysis_mode": mode,
        "predicted_role": _role_prediction(resume_text),
        "match_score": score,
        "match_label": label,
        "score_breakdown": {"skill_coverage": coverage, "text_similarity": similarity, "formula": "75% detected-skill coverage + 25% TF-IDF text similarity" if required_skills else "TF-IDF text similarity; no recognized skills detected in the job description"},
        "required_skills": required_skills,
        "found_skills": found,
        "missing_skills": missing,
        "resume_skills": resume_skills,
        "suggestions": recommendations,
        "suggestion": " ".join(recommendations),
        "disclaimer": "This is an indicative comparison, not an official ATS score. A skill marked not detected may still be part of your experience if it is not stated clearly in the resume."
    }
