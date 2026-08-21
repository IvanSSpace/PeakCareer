from enum import Enum
from typing import List, Optional

from sqlmodel import JSON, Column, Field, SQLModel


class ApplicationStatus(str, Enum):
    draft = "draft"
    generating = "generating"
    ready = "ready"
    applied = "applied"
    rejected = "rejected"
    offer = "offer"


class Vacancy(SQLModel, table=True):
    """Mirrors data/vacancies.json. Populated via /vacancies/import, called
    by scraper/refresh_vacancies.py after scrape + auto-extract (Claude
    Code CLI, no external LLM API key)."""

    id: str = Field(primary_key=True)  # e.g. "proglib_jobs/1065"
    url: str
    source_channel: str
    title: str
    company: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: Optional[str] = None
    location: Optional[str] = None
    remote: bool = False
    category: str
    stack: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    apply_via: str
    role: str
    language: Optional[str] = None
    posted_at: Optional[str] = None  # ISO-дата поста в Telegram; None — добавлено вручную, не экспайрится


class Resume(SQLModel, table=True):
    id: str = Field(primary_key=True)  # uuid4
    name: str  # editable display name
    file_name: str  # original uploaded filename
    size: int
    content_type: str
    uploaded_at: str  # ISO date
    file_path: str  # filename under backend/uploads/


class Application(SQLModel, table=True):
    """One resume x one vacancy, tracked through the manual-apply flow
    (version A — no auto-submit, human applies and flips the status)."""

    id: str = Field(primary_key=True)  # uuid4
    vacancy_id: str = Field(foreign_key="vacancy.id")
    resume_id: str = Field(foreign_key="resume.id")
    status: ApplicationStatus = ApplicationStatus.draft
    # Populated by app/tailoring.py via a `claude -p` CLI subprocess — no
    # external LLM API key, just the local Claude Code subscription.
    tailored_resume_path: Optional[str] = None
    cover_letter_path: Optional[str] = None
    created_at: str  # ISO datetime
    updated_at: str  # ISO datetime
