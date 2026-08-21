"""One-command refresh of data/vacancies.json: scrape -> auto-extract (Haiku) ->
remote-only filter -> expire stale entries -> mirror to frontend -> best-effort
backend import.

No external LLM API key — extraction shells out to the local `claude` CLI,
authenticated via the machine's Claude Code subscription (same pattern as
backend/app/tailoring.py: --safe-mode --tools "" isolates the call from this
repo's project context, otherwise it answers as if continuing this session
instead of processing the prompt).

Usage: python refresh_vacancies.py
"""

import json
import os
import re
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
from fetch_telegram import CHANNELS, fetch_channel

DATA_PATH = Path(__file__).parent.parent / "data" / "vacancies.json"
FRONTEND_SAMPLE_PATH = (
    Path(__file__).parent.parent / "src" / "modules" / "aggregator" / "vacancies.sample.json"
)
BACKEND_IMPORT_URL = "http://localhost:8000/vacancies/import"

MAX_AGE_DAYS = 21
CLAUDE_TIMEOUT_SECONDS = 120
ROLES = ["DevOps", "Architect", "Fullstack", "Frontend", "Backend", "Mobile", "Data", "QA"]


def load_existing() -> dict:
    if not DATA_PATH.exists():
        return {}
    vacancies = json.loads(DATA_PATH.read_text())
    return {v["id"]: v for v in vacancies}


_FENCE_RE = re.compile(r"```(?:json)?\s*\n?(.*?)\n?```", re.DOTALL)


def _strip_json_fence(text: str) -> str:
    # Модель иногда дописывает пояснение прозой ПОСЛЕ закрывающего ``` (особенно на
    # skip-ответах) — regex вытаскивает именно содержимое фенса, а не весь хвост текста.
    t = text.strip()
    m = _FENCE_RE.search(t)
    return m.group(1).strip() if m else t


def _clean_subprocess_env() -> dict:
    # Этот скрипт часто запускают из-под самой Claude Code сессии (её bash-тул) —
    # тогда CLAUDECODE/CLAUDE_CODE_SESSION_ID и т.п. утекают в дочерний процесс, и
    # вложенный `claude -p` детектит, что он внутри активной сессии, и вместо ответа
    # на промпт иногда галлюцинирует tool-call на внешнюю сессию. Чистим env, чтобы
    # дочерний вызов всегда вёл себя как чистый prompt->completion.
    return {k: v for k, v in os.environ.items() if not k.startswith(("CLAUDE", "AI_AGENT"))}


def run_claude(prompt: str) -> dict | None:
    try:
        proc = subprocess.run(
            [
                "claude", "-p", prompt,
                "--model", "haiku",
                "--output-format", "json",
                "--safe-mode",
                "--tools", "",
                "--no-session-persistence",
            ],
            capture_output=True,
            text=True,
            timeout=CLAUDE_TIMEOUT_SECONDS,
            cwd="/tmp",
            env=_clean_subprocess_env(),
        )
    except subprocess.TimeoutExpired:
        print("  claude CLI timed out, skipping post")
        return None

    if proc.returncode != 0:
        print(f"  claude CLI exited {proc.returncode}: {proc.stderr.strip()[:200]}")
        return None

    try:
        envelope = json.loads(proc.stdout)
        parsed = json.loads(_strip_json_fence(envelope.get("result", "")))
    except json.JSONDecodeError:
        print("  could not parse claude output, skipping post")
        return None
    if not isinstance(parsed, dict):
        print(f"  claude returned {type(parsed).__name__}, not an object — skipping post")
        return None
    return parsed


def extract_vacancy(post: dict) -> dict | None:
    prompt = (
        "Ты извлекаешь структурированные данные вакансии из поста Telegram-канала. "
        "Если пост НЕ является вакансией (реклама, шум, репост не по теме, анонс курса и т.п.) — "
        'верни СТРОГО {"skip": true}. Если это вакансия — верни СТРОГО JSON без markdown-обёртки, '
        'формы {"title": string, "company": string, "salary_min": number|null, '
        '"salary_max": number|null, "currency": "RUB"|"USD"|"EUR"|null, "location": string|null, '
        '"remote": boolean, "category": string, "stack": [string,...]|null, "apply_via": string, '
        f'"role": одна из {ROLES}, "language": string|null}}. '
        "category — короткий lowercase-слаг технологии/направления (например 'python', 'devops'). "
        "apply_via — где откликаться (домен сайта или 'telegram', если ссылки нет). "
        "language — основной язык программирования, если применимо, иначе null.\n\n"
        "Текст поста:\n" + post["text"]
    )
    result = run_claude(prompt)
    if not result or result.get("skip"):
        return None

    vacancy_id = f"{post['channel']}/{post['post_id']}"
    # required string fields в бэк-модели NOT NULL — Haiku иногда шлёт explicit null
    # вместо того чтобы пропустить ключ, а `.get(key, "")` такое не ловит (ключ есть,
    # значение None) — отсюда `or ""` вместо дефолта в .get().
    return {
        "id": vacancy_id,
        "url": post["url"],
        "source_channel": post["channel"],
        "title": result.get("title") or "",
        "company": result.get("company") or "",
        "salary_min": result.get("salary_min"),
        "salary_max": result.get("salary_max"),
        "currency": result.get("currency"),
        "location": result.get("location"),
        "remote": bool(result.get("remote", False)),
        "category": result.get("category") or "",
        "stack": result.get("stack"),
        "apply_via": result.get("apply_via") or "",
        "role": result.get("role") if result.get("role") in ROLES else "Backend",
        "language": result.get("language"),
        "posted_at": post["date"],
    }


def is_expired(vacancy: dict, cutoff: datetime) -> bool:
    posted_at = vacancy.get("posted_at")
    if not posted_at:
        return False  # ручные записи без даты — не экспайрятся
    try:
        posted = datetime.fromisoformat(posted_at)
    except ValueError:
        return False
    return posted < cutoff


def main() -> None:
    by_id = load_existing()
    print(f"Loaded {len(by_id)} existing vacancies")

    new_count = 0
    skipped_count = 0
    for channel in CHANNELS:
        print(f"Scraping t.me/s/{channel} ...")
        for post in fetch_channel(channel):
            vacancy_id = f"{channel}/{post['post_id']}"
            if vacancy_id in by_id:
                continue
            extracted = extract_vacancy(post)
            if extracted:
                by_id[vacancy_id] = extracted
                new_count += 1
            else:
                skipped_count += 1
    print(f"New vacancies extracted: {new_count}, skipped (not a vacancy / failed): {skipped_count}")

    merged = list(by_id.values())
    remote_only = [v for v in merged if v.get("remote") is True]
    print(f"Remote-only filter: {len(merged)} -> {len(remote_only)}")

    cutoff = datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)
    fresh = [v for v in remote_only if not is_expired(v, cutoff)]
    print(f"Expiry filter (>{MAX_AGE_DAYS}d): {len(remote_only)} -> {len(fresh)}")

    fresh.sort(key=lambda v: v["id"])
    DATA_PATH.write_text(json.dumps(fresh, ensure_ascii=False, indent=2))
    FRONTEND_SAMPLE_PATH.write_text(json.dumps(fresh, ensure_ascii=False, indent=2))
    print(f"Wrote {len(fresh)} vacancies to {DATA_PATH} and {FRONTEND_SAMPLE_PATH}")

    try:
        resp = requests.post(BACKEND_IMPORT_URL, json=fresh, timeout=5)
        resp.raise_for_status()
        print(f"Backend import: {resp.json()}")
    except requests.RequestException as exc:
        print(f"Backend not reachable ({exc}) — skipped import, data/vacancies.json is still updated")


if __name__ == "__main__":
    main()
