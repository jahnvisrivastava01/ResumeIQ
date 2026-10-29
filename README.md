# ResumeIQ — AI-Powered Resume Analyzer

ResumeIQ is an AI-powered resume analysis web application that helps candidates evaluate their resumes against job requirements, understand skill gaps, and identify areas for improvement.

## Features

- **Resume Upload:** Upload resumes in PDF or DOCX format.
- **Resume Validation:** Check whether uploaded content resembles a resume.
- **Job Role Analysis:** Analyze resumes against supported job roles.
- **Job Description Matching:** Compare a resume with a custom job description.
- **Match Score:** View a relevance score based on resume and job requirements.
- **Skill Gap Analysis:** Identify skills that may be missing from the resume.
- **Improvement Suggestions:** Get suggestions to improve resume alignment.
- **Responsive Interface:** Use the application on desktop and mobile screens.

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS
- Axios

**Backend**
- Python
- FastAPI
- Uvicorn

**Resume Processing and Machine Learning**
- PyPDF2
- python-docx
- Scikit-learn
- TF-IDF and Multinomial Naive Bayes

## Project Structure

```text
ResumeIQ/
├── backend/
│   ├── main.py
│   ├── roles.json
│   ├── train_model.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── tests/
│   └── utils/
└── frontend/
    ├── public/
    ├── src/
    ├── package.json
    └── .env.example
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/jahnvisrivastava01/resume_scanner_ai.git
cd resume_scanner_ai
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn main:app --reload
```

### 3. Set up the frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/roles` | Retrieve supported job roles |
| POST | `/api/analyze` | Analyze an uploaded resume |

## Future Improvements

- More advanced semantic matching.
- Additional resume formats and validation.
- Expanded job-role coverage.
- More detailed, downloadable analysis reports.

## Author

**Jahnvi Srivastava**


