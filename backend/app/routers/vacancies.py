from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Vacancy

router = APIRouter(prefix="/vacancies", tags=["vacancies"])


@router.get("/", response_model=List[Vacancy])
def list_vacancies(role: Optional[str] = None, session: Session = Depends(get_session)):
    statement = select(Vacancy)
    if role and role != "все":
        statement = statement.where(Vacancy.role == role)
    return session.exec(statement).all()


@router.get("/{vacancy_id:path}", response_model=Vacancy)
def get_vacancy(vacancy_id: str, session: Session = Depends(get_session)):
    vacancy = session.get(Vacancy, vacancy_id)
    if not vacancy:
        raise HTTPException(404, "Vacancy not found")
    return vacancy


@router.post("/import")
def import_vacancies(vacancies: List[Vacancy], session: Session = Depends(get_session)):
    """Bulk upsert. This is the only way vacancies get into the DB right
    now — scraped and auto-extracted via scraper/refresh_vacancies.py
    (Claude Code CLI, no external LLM API key), then pushed here as JSON."""
    count = 0
    for v in vacancies:
        existing = session.get(Vacancy, v.id)
        if existing:
            session.delete(existing)
            session.flush()
        session.add(v)
        count += 1
    session.commit()
    return {"imported": count}
