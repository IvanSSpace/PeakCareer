import uuid
from datetime import date
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlmodel import Session, select

from ..database import get_session
from ..models import Resume

router = APIRouter(prefix="/resumes", tags=["resumes"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ACCEPTED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB, same cap as the frontend's localStorage version


@router.get("/", response_model=List[Resume])
def list_resumes(session: Session = Depends(get_session)):
    return session.exec(select(Resume)).all()


@router.post("/", response_model=Resume)
async def upload_resume(file: UploadFile = File(...), session: Session = Depends(get_session)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ACCEPTED_EXTENSIONS:
        raise HTTPException(400, "Только PDF или DOCX")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "Файл больше 5 МБ")

    resume_id = str(uuid.uuid4())
    stored_name = f"{resume_id}{ext}"
    (UPLOAD_DIR / stored_name).write_bytes(content)

    resume = Resume(
        id=resume_id,
        name=Path(file.filename or stored_name).stem,
        file_name=file.filename or stored_name,
        size=len(content),
        content_type=file.content_type or "application/octet-stream",
        uploaded_at=date.today().isoformat(),
        file_path=stored_name,
    )
    session.add(resume)
    session.commit()
    session.refresh(resume)
    return resume


@router.patch("/{resume_id}", response_model=Resume)
def rename_resume(resume_id: str, name: str = Form(...), session: Session = Depends(get_session)):
    resume = session.get(Resume, resume_id)
    if not resume:
        raise HTTPException(404, "Resume not found")
    trimmed = name.strip()
    if trimmed:
        resume.name = trimmed
    session.add(resume)
    session.commit()
    session.refresh(resume)
    return resume


@router.get("/{resume_id}/download")
def download_resume(resume_id: str, session: Session = Depends(get_session)):
    resume = session.get(Resume, resume_id)
    if not resume:
        raise HTTPException(404, "Resume not found")
    path = UPLOAD_DIR / resume.file_path
    if not path.exists():
        raise HTTPException(404, "File missing on disk")
    return FileResponse(path, filename=resume.file_name)


@router.delete("/{resume_id}")
def delete_resume(resume_id: str, session: Session = Depends(get_session)):
    resume = session.get(Resume, resume_id)
    if not resume:
        raise HTTPException(404, "Resume not found")
    path = UPLOAD_DIR / resume.file_path
    if path.exists():
        path.unlink()
    session.delete(resume)
    session.commit()
    return {"deleted": resume_id}
