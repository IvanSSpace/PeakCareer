# PeakCareer backend

FastAPI + SQLite. No LLM API dependency — extraction/tailoring stays
manual (Claude Code session) until a provider is decided at
publication time. This just persists what's already manual: vacancies,
resumes, and application status.

## Run

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive docs: http://localhost:8000/docs

Seed real vacancies (from `../data/vacancies.json`) into a running server:

```bash
python seed.py
```

## Test

```bash
python -m pytest -v
```

## Endpoints

- `GET /vacancies/?role=Backend` — list, optional role filter
- `GET /vacancies/{id}` — single vacancy (id contains `/`, e.g. `proglib_jobs/1065`)
- `POST /vacancies/import` — bulk upsert from a JSON array (how data gets in — see `seed.py`)
- `GET /resumes/`, `POST /resumes/` (multipart file), `PATCH /resumes/{id}` (form field `name`), `GET /resumes/{id}/download`, `DELETE /resumes/{id}`
- `GET /applications/?status=applied`, `POST /applications/` (`{vacancy_id, resume_id}`), `PATCH /applications/{id}/status` (`{status}`), `DELETE /applications/{id}`

Statuses: `draft` → `ready` → `applied` → `rejected` | `offer` — set by hand
(version A from the pipeline plan: no auto-apply).

## Not built yet, on purpose

- Auth — single-user (the two founders) for now.
- Real LLM-backed tailoring (`Application.tailored_resume_path`) — field
  exists, nothing writes it yet.
- Frontend isn't wired to this — it still runs on localStorage. Hooking
  it up is a separate, deliberately unstarted step.
