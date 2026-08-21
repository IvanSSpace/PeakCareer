"""Resume tailoring pipeline: extract -> structure (Haiku) -> tailor (Sonnet) -> diff.

No external LLM API key — every model call shells out to the local `claude`
CLI, authenticated via the Claude Code subscription already logged in on
this machine.
"""

from __future__ import annotations

import difflib
import json
import re
import subprocess
from pathlib import Path
from typing import Literal, TypedDict

from docx import Document
from pypdf import PdfReader

from .models import Vacancy

CLAUDE_TIMEOUT_SECONDS = 120

_TOKEN_RE = re.compile(r"\S+|\s+")


class ClaudeCallError(RuntimeError):
    pass


class StructuredResume(TypedDict):
    summary: str
    experience: list[str]
    skills: list[str]


class Segment(TypedDict):
    text: str
    kind: Literal["unchanged", "added", "removed"]


class TailoredResume(TypedDict):
    summary: list[Segment]
    experience: list[list[Segment]]
    skills: list[Segment]


def extract_text(path: Path) -> str:
    ext = path.suffix.lower()
    if ext == ".pdf":
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if ext == ".docx":
        doc = Document(str(path))
        return "\n".join(p.text for p in doc.paragraphs)
    raise ValueError(f"Извлечение текста не поддерживается для {ext} (только .pdf/.docx)")


def _strip_json_fence(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        lines = t.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        t = "\n".join(lines).strip()
    return t


def run_claude(prompt: str, model: str) -> dict:
    # --safe-mode (без CLAUDE.md/скиллов/хуков) + --tools "" (без инструментов вообще) +
    # cwd вне репы — иначе headless-вызов подхватывает контекст проекта как агент и
    # отвечает на промпт как на продолжение разработки, а не как на чистый текстовый запрос.
    try:
        proc = subprocess.run(
            [
                "claude", "-p", prompt,
                "--model", model,
                "--output-format", "json",
                "--safe-mode",
                "--tools", "",
                "--no-session-persistence",
            ],
            capture_output=True,
            text=True,
            timeout=CLAUDE_TIMEOUT_SECONDS,
            cwd="/tmp",
        )
    except subprocess.TimeoutExpired as exc:
        raise ClaudeCallError(f"claude CLI не ответил за {CLAUDE_TIMEOUT_SECONDS}с") from exc

    if proc.returncode != 0:
        raise ClaudeCallError(f"claude CLI завершился с кодом {proc.returncode}: {proc.stderr.strip()}")

    try:
        envelope = json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        raise ClaudeCallError(f"claude CLI вернул не-JSON конверт: {proc.stdout[:200]!r}") from exc

    if envelope.get("is_error"):
        raise ClaudeCallError(f"claude CLI сообщил об ошибке: {envelope.get('result')!r}")

    stripped = _strip_json_fence(envelope.get("result", ""))
    try:
        return json.loads(stripped)
    except json.JSONDecodeError as exc:
        raise ClaudeCallError(f"ответ claude не распарсился как JSON: {stripped[:200]!r}") from exc


def structure_resume(text: str) -> StructuredResume:
    prompt = (
        "Ты парсишь текст резюме в структурированный JSON. Верни СТРОГО JSON без markdown-обёртки, "
        'формы {"summary": string, "experience": [string, ...], "skills": [string, ...]}. '
        "summary — 1-2 предложения о специализации и опыте. experience — список пунктов опыта работы, "
        "каждый пункт отдельной строкой. skills — список технических навыков/технологий, каждый "
        "отдельной строкой, без дублей.\n\nТекст резюме:\n" + text
    )
    return run_claude(prompt, model="haiku")  # type: ignore[return-value]


def tailor_resume(structured: StructuredResume, vacancy: Vacancy) -> StructuredResume:
    stack = ", ".join(vacancy.stack or [])
    prompt = (
        "Ты помогаешь адаптировать резюме под конкретную вакансию, не выдумывая опыт, которого не "
        "было. Структурированное резюме кандидата: " + json.dumps(structured, ensure_ascii=False) +
        f"\n\nВакансия: {vacancy.title} в {vacancy.company}. Стек: {stack}. Категория: {vacancy.category}."
        "\n\nПерепиши резюме под эту вакансию: подчеркни релевантный опыт, добавь в skills технологии "
        "из стека вакансии ТОЛЬКО если это правдоподобно расширяет уже описанный опыт (не выдумывай "
        "с нуля), можешь уточнить формулировки summary/experience под вакансию. Верни СТРОГО JSON той "
        'же формы {"summary": string, "experience": [string, ...], "skills": [string, ...]}, без '
        "markdown-обёртки."
    )
    return run_claude(prompt, model="sonnet")  # type: ignore[return-value]


def _tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text)


def _diff_text(original: str, tailored: str) -> list[Segment]:
    a, b = _tokenize(original), _tokenize(tailored)
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    segments: list[Segment] = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            segments.append({"text": "".join(a[i1:i2]), "kind": "unchanged"})
        elif tag == "delete":
            segments.append({"text": "".join(a[i1:i2]), "kind": "removed"})
        elif tag == "insert":
            segments.append({"text": "".join(b[j1:j2]), "kind": "added"})
        elif tag == "replace":
            segments.append({"text": "".join(a[i1:i2]), "kind": "removed"})
            segments.append({"text": "".join(b[j1:j2]), "kind": "added"})
    return segments


def _diff_list(original_items: list[str], tailored_items: list[str]) -> list[list[Segment]]:
    sm = difflib.SequenceMatcher(None, original_items, tailored_items, autojunk=False)
    lines: list[list[Segment]] = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            lines += [[{"text": item, "kind": "unchanged"}] for item in original_items[i1:i2]]
        elif tag == "delete":
            lines += [[{"text": item, "kind": "removed"}] for item in original_items[i1:i2]]
        elif tag == "insert":
            lines += [[{"text": item, "kind": "added"}] for item in tailored_items[j1:j2]]
        elif tag == "replace":
            lines += [[{"text": item, "kind": "removed"}] for item in original_items[i1:i2]]
            lines += [[{"text": item, "kind": "added"}] for item in tailored_items[j1:j2]]
    return lines


def _diff_skills(original_items: list[str], tailored_items: list[str]) -> list[Segment]:
    orig_set, tail_set = set(original_items), set(tailored_items)
    segments: list[Segment] = [{"text": s, "kind": "unchanged"} for s in original_items if s in tail_set]
    segments += [{"text": s, "kind": "removed"} for s in original_items if s not in tail_set]
    segments += [{"text": s, "kind": "added"} for s in tailored_items if s not in orig_set]
    return segments


def diff_sections(original: StructuredResume, tailored: StructuredResume) -> TailoredResume:
    return {
        "summary": _diff_text(original.get("summary", ""), tailored.get("summary", "")),
        "experience": _diff_list(original.get("experience", []), tailored.get("experience", [])),
        "skills": _diff_skills(original.get("skills", []), tailored.get("skills", [])),
    }
