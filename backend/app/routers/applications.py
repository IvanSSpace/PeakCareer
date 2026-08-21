import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlmodel import Session, SQLModel, select

from ..database import get_session
from ..models import Application, ApplicationStatus, Resume, Vacancy
from ..tailoring import diff_sections, extract_text, structure_resume, tailor_resume
from . import resumes as resumes_router

router = APIRouter(prefix="/applications", tags=["applications"])

TAILORED_DIR = Path(__file__).resolve().parent.parent.parent / "tailored"
TAILORED_DIR.mkdir(exist_ok=True)


class ApplicationCreate(SQLModel):
    vacancy_id: str
    resume_id: str


class ApplicationStatusUpdate(SQLModel):
    status: ApplicationStatus


class TailoredEdit(SQLModel):
    summary: str
    experience: List[str]
    skills: List[str]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _tailored_path(application_id: str) -> Path:
    return TAILORED_DIR / f"{application_id}.json"


def run_tailoring_job(application_id: str, engine) -> None:
    """Runs in the background after POST /{id}/tailor responds. Leaves the
    application in `generating` on any failure — a retry is just another
    POST to the same endpoint."""
    with Session(engine) as session:
        application = session.get(Application, application_id)
        if not application:
            return
        vacancy = session.get(Vacancy, application.vacancy_id)
        resume = session.get(Resume, application.resume_id)
        if not vacancy or not resume:
            return

        try:
            resume_path = resumes_router.UPLOAD_DIR / resume.file_path
            text = extract_text(resume_path)
            original = structure_resume(text)
            tailored = tailor_resume(original, vacancy)
            diff = diff_sections(original, tailored)
        except Exception as exc:  # noqa: BLE001 — любая ошибка пайплайна не должна ронять background task
            print(f"[tailoring] application {application_id} failed: {exc}")
            return

        _tailored_path(application_id).write_text(
            json.dumps({"original": original, "tailored": tailored, "diff": diff}, ensure_ascii=False)
        )
        application.status = ApplicationStatus.ready
        application.tailored_resume_path = _tailored_path(application_id).name
        application.updated_at = _now()
        session.add(application)
        session.commit()


@router.get("/", response_model=List[Application])
def list_applications(status: Optional[ApplicationStatus] = None, session: Session = Depends(get_session)):
    statement = select(Application)
    if status:
        statement = statement.where(Application.status == status)
    return session.exec(statement).all()


@router.get("/{application_id}", response_model=Application)
def get_application(application_id: str, session: Session = Depends(get_session)):
    application = session.get(Application, application_id)
    if not application:
        raise HTTPException(404, "Application not found")
    return application


@router.post("/", response_model=Application)
def create_application(payload: ApplicationCreate, session: Session = Depends(get_session)):
    if not session.get(Vacancy, payload.vacancy_id):
        raise HTTPException(404, "Vacancy not found")
    if not session.get(Resume, payload.resume_id):
        raise HTTPException(404, "Resume not found")

    now = _now()
    application = Application(
        id=str(uuid.uuid4()),
        vacancy_id=payload.vacancy_id,
        resume_id=payload.resume_id,
        status=ApplicationStatus.draft,
        created_at=now,
        updated_at=now,
    )
    session.add(application)
    session.commit()
    session.refresh(application)
    return application


@router.post("/{application_id}/tailor", response_model=Application)
def trigger_tailoring(application_id: str, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    application = session.get(Application, application_id)
    if not application:
        raise HTTPException(404, "Application not found")

    application.status = ApplicationStatus.generating
    application.updated_at = _now()
    session.add(application)
    session.commit()
    session.refresh(application)

    # session.get_bind() — тот же engine, что использует текущий запрос (в
    # тестах это in-memory StaticPool из conftest, не реальный файл БД).
    background_tasks.add_task(run_tailoring_job, application_id, session.get_bind())
    return application


@router.get("/{application_id}/tailored")
def get_tailored(application_id: str, session: Session = Depends(get_session)):
    application = session.get(Application, application_id)
    if not application:
        raise HTTPException(404, "Application not found")
    path = _tailored_path(application_id)
    if not path.exists():
        raise HTTPException(404, "Результат ещё не готов")
    return json.loads(path.read_text())["diff"]


@router.patch("/{application_id}/tailored")
def edit_tailored(application_id: str, payload: TailoredEdit, session: Session = Depends(get_session)):
    application = session.get(Application, application_id)
    if not application:
        raise HTTPException(404, "Application not found")
    path = _tailored_path(application_id)
    if not path.exists():
        raise HTTPException(404, "Результат ещё не готов")

    stored = json.loads(path.read_text())
    tailored = {"summary": payload.summary, "experience": payload.experience, "skills": payload.skills}
    diff = diff_sections(stored["original"], tailored)
    stored["tailored"] = tailored
    stored["diff"] = diff
    path.write_text(json.dumps(stored, ensure_ascii=False))
    return diff


@router.patch("/{application_id}/status", response_model=Application)
def update_status(
    application_id: str, payload: ApplicationStatusUpdate, session: Session = Depends(get_session)
):
    application = session.get(Application, application_id)
    if not application:
        raise HTTPException(404, "Application not found")
    application.status = payload.status
    application.updated_at = _now()
    session.add(application)
    session.commit()
    session.refresh(application)
    return application


@router.delete("/{application_id}")
def delete_application(application_id: str, session: Session = Depends(get_session)):
    application = session.get(Application, application_id)
    if not application:
        raise HTTPException(404, "Application not found")
    session.delete(application)
    session.commit()
    return {"deleted": application_id}
