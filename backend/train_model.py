"""Train a small demo role classifier. The matcher has a keyword fallback if this model is absent."""
import pickle
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parent
examples = [
    ("html css javascript react tailwind responsive frontend ui", "frontend developer"),
    ("react js responsive design api integration html css", "frontend developer"),
    ("node express mongodb api backend python fastapi sql", "backend developer"),
    ("java spring boot rest api sql backend development", "backend developer"),
    ("react node mongodb full stack development api html css", "full stack developer"),
    ("html css javascript node express full stack", "full stack developer"),
    ("machine learning python tensorflow numpy pandas scikit learn", "machine learning engineer"),
    ("deep learning nlp python scikit learn model training", "machine learning engineer"),
    ("python sql pandas excel data analysis power bi tableau", "data analyst"),
    ("data cleaning visualization statistics sql python", "data analyst"),
    ("manual testing selenium test cases bug tracking jira", "software tester"),
    ("automation testing selenium webdriver qa testing", "software tester"),
    ("docker kubernetes aws linux ci cd jenkins", "devops engineer"),
    ("devops pipelines cloud deployment docker kubernetes", "devops engineer"),
]
X, y = zip(*examples)
model = Pipeline([("tfidf", TfidfVectorizer()), ("classifier", MultinomialNB())])
model.fit(X, y)
with (BASE_DIR / "model.pkl").open("wb") as f:
    pickle.dump(model, f)
print(f"Saved demo role classifier to {BASE_DIR / 'model.pkl'}")
