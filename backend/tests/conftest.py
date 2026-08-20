import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_session
from app.main import app
from app.routers import resumes


@pytest.fixture(name="session")
def session_fixture():
    # StaticPool: every connection shares the same in-memory DB, so tables
    # created here are visible to requests made through the TestClient.
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session, tmp_path, monkeypatch):
    # Redirect resume file writes to pytest's tmp_path so tests never touch
    # the real backend/uploads/ directory.
    monkeypatch.setattr(resumes, "UPLOAD_DIR", tmp_path)

    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
