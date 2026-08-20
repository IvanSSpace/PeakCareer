"""Load data/vacancies.json into the running backend via /vacancies/import.

Usage:
  uvicorn app.main:app --reload   # in one terminal
  python seed.py                   # in another
"""

import json
from pathlib import Path

import httpx

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "vacancies.json"
API_URL = "http://localhost:8000/vacancies/import"


def main() -> None:
    vacancies = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    resp = httpx.post(API_URL, json=vacancies, timeout=30)
    resp.raise_for_status()
    print(resp.json())


if __name__ == "__main__":
    main()
