import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, SQLModel, select

from ..database import get_session
from ..models import Application, ApplicationStatus, Resume, Vacancy

router = APIRouter(prefix="/applications", tags=["applications"])


class ApplicationCreate(SQLModel):
    vacancy_id: str
    resume_id: str


class ApplicationStatusUpdate(SQLModel):
    status: ApplicationStatus


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.get("/", response_model=List[Application])
def list_applications(status: Optional[ApplicationStatus] = None, session: Session = Depends(get_session)):
    statement = select(Application)
    if status:
        statement = statement.where(Application.status == status)
    return session.exec(statement).all()


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
