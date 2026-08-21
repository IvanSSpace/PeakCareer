# PeakCareer backend

FastAPI + SQLite. No LLM API dependency — resume tailoring calls the
local `claude` CLI as a headless subprocess (`app/tailoring.py`),
authenticated via the machine's own Claude Code subscription. No
separate API key involved.

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
- `GET /applications/?status=applied`, `GET /applications/{id}`, `POST /applications/` (`{vacancy_id, resume_id}`), `PATCH /applications/{id}/status` (`{status}`), `DELETE /applications/{id}`
- `POST /applications/{id}/tailor` — kicks off the tailoring pipeline in the background (`draft`/`ready` → `generating` → `ready`). Retry by POSTing again.
- `GET /applications/{id}/tailored` — the tailored resume as a diff (`{summary, experience, skills}`, each item tagged `unchanged`/`added`/`removed`)
- `PATCH /applications/{id}/tailored` — hand-edit the tailored text (`{summary, experience: string[], skills: string[]}`), re-diffs against the stored original and returns the fresh result

Statuses: `draft` → `generating` → `ready` → `applied` → `rejected` | `offer`.
The last three are still set by hand (version A from the pipeline plan: no
auto-apply).

## Tailoring pipeline (`app/tailoring.py`)

`extract_text` (pypdf/python-docx) → `structure_resume` (Haiku, cheap
parsing) → `tailor_resume` (Sonnet, the actual rewrite) → `diff_sections`
(pure `difflib`, no model — tags words/bullets/skills as
unchanged/added/removed). Each model call shells out to
`claude -p ... --model <haiku|sonnet> --output-format json --safe-mode
--tools "" --no-session-persistence`, run from `/tmp` — `--safe-mode` +
`--tools ""` are required, otherwise the headless call inherits this
repo's CLAUDE.md/agent context and answers as if continuing the coding
session instead of just processing the prompt (this was hit and fixed
during implementation).

Results are written to `backend/tailored/{application_id}.json` (not
committed). Legacy `.doc` files aren't supported for extraction
(`python-docx` only reads `.docx`) — upload still accepts `.doc` for
storage, tailoring on it will just fail and leave the status at
`generating`.

## Not built yet, on purpose

- Auth — single-user (the two founders) for now.
- PDF rendering of the final tailored resume — separate sub-project (C).
- Retry/error surfacing beyond "status stays `generating`, POST /tailor again".
