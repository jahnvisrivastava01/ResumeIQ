# ResumeIQ — AI-Powered Resume Analyzer

ResumeIQ is an AI-powered resume analysis web application that helps candidates evaluate their resumes against job requirements, identify skill gaps, and discover areas for improvement.

🚀 **Live Demo:** [ResumeIQ](https://resume-scanner-ai-363o.onrender.com/)

## ✨ Features

- **Resume Upload:** Upload resumes in PDF or DOCX format.
- **Resume Validation:** Validate uploaded files and check for readable resume content.
- **Job Role Analysis:** Analyze resumes against supported job roles.
- **Custom Job Description Matching:** Compare your resume with a specific job description.
- **Resume Match Score:** Evaluate resume relevance against target job requirements.
- **Skill Gap Analysis:** Identify skills that may be missing from your resume.
- **Improvement Suggestions:** Get recommendations to improve your resume's alignment with a target role.
- **Responsive UI:** Access the application through desktop and mobile browsers.

## 🛠️ Tech Stack

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

**Machine Learning and Document Processing**
- Scikit-learn
- TF-IDF Vectorization
- Multinomial Naive Bayes
- PyPDF / PDF text extraction
- python-docx

## 📁 Project Structure

```text
ResumeIQ/
├── backend/
│   ├── main.py
│   ├── roles.json
│   ├── train_model.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── tests/
│   │   └── test_matcher.py
│   └── utils/
│       ├── matcher.py
│       └── parser.py
└── frontend/
    ├── public/
    ├── src/
    ├── package.json
    ├── package-lock.json
    └── .env.example
```

## 💻 Run Locally

### Prerequisites

- Python installed
- Node.js and npm installed
- Git installed

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
python -m uvicorn main:app --reload
```

Backend API documentation:

`http://127.0.0.1:8000/docs`

### 3. Set up the frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL provided by Vite in your terminal.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/roles` | Retrieve supported job roles |
| POST | `/api/analyze` | Analyze an uploaded resume |

Interactive API documentation is available at `/docs` when the backend is running.

## 🔮 Future Improvements

- More advanced semantic resume matching.
- Expanded job-role and industry coverage.
- More detailed downloadable analysis reports.
- Enhanced resume recommendations.
- Further improvements to accessibility and user experience.

## 👩‍💻 Author

**Jahnvi Srivastava**

---

If you find this project useful, consider giving the repository a ⭐.
