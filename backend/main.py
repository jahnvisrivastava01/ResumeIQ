
import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from utils.matcher import ROLES, analyze_resume
from utils.parser import parse_resume


app = FastAPI(
    title="ResumeIQ API",
    version="2.1.0",
    description="Resume analysis and job-description matching API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "ResumeIQ API",
        "version": "2.1.0",
    }


@app.get("/api/roles")
def get_roles():
    return {"roles": sorted(ROLES.keys())}


@app.post("/api/analyze")
async def analyze(
    file: UploadFile = File(...),
    role: Optional[str] = Form(default=None),
    job_description: Optional[str] = Form(default=None),
):
    # Require a target role or job description.
    if not (role and role.strip()) and not (
        job_description and job_description.strip()
    ):
        raise HTTPException(
            status_code=400,
            detail="Choose a target role or paste a job description.",
        )

    if job_description and len(job_description) > 20000:
        raise HTTPException(
            status_code=413,
            detail="Job description must be 20,000 characters or fewer.",
        )

    # Validate the file extension.
    suffix = Path(file.filename or "").suffix.lower()

    if suffix not in {".pdf", ".docx"}:
        await file.close()
        raise HTTPException(
            status_code=400,
            detail="Please upload a resume in PDF or DOCX format.",
        )

    temp_path = None

    try:
        # Save the uploaded file because parse_resume expects a file path.
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp_file:
            temp_path = temp_file.name

            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                temp_file.write(chunk)

        # Extract text and reject documents that don't resemble resumes.
        try:
            resume_text = parse_resume(temp_path)
        except ValueError as exc:
            raise HTTPException(
                status_code=422,
                detail=str(exc),
            ) from exc

        if not resume_text or not resume_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No readable text was found. Please upload another resume.",
            )

        # Run matching only after resume validation succeeds.
        try:
            result = analyze_resume(
                resume_text,
                role,
                job_description,
            )
            return result
        except ValueError as exc:
            raise HTTPException(
                status_code=422,
                detail=str(exc),
            ) from exc

    finally:
        await file.close()

        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


# Serve the built React frontend if it exists.
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST = (BASE_DIR.parent / "frontend" / "dist").resolve()

if FRONTEND_DIST.is_dir():
    assets_dir = FRONTEND_DIST / "assets"

    if assets_dir.is_dir():
        app.mount(
            "/assets",
            StaticFiles(directory=str(assets_dir)),
            name="assets",
        )

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        requested = (FRONTEND_DIST / full_path).resolve()

        # Prevent paths outside the frontend directory from being served.
        if (
            requested != FRONTEND_DIST
            and FRONTEND_DIST not in requested.parents
        ):
            raise HTTPException(
                status_code=404,
                detail="File not found.",
            )

        if requested.is_file():
            return FileResponse(str(requested))

        index_file = FRONTEND_DIST / "index.html"

        if index_file.is_file():
            return FileResponse(str(index_file))

        raise HTTPException(
            status_code=404,
            detail="Frontend build not found.",
        )
