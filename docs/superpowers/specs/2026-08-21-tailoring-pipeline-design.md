# Sub-project B: пайплайн реальной генерации тейлоренных резюме

Дата: 2026-08-21
Статус: одобрено, в реализации

## Контекст

Sub-project A (уже сделан) — фронт-моки: галерея карточек по вакансиям + approve-режим с
диффом (зелёным помечено добавленное), на заглушечном тексте резюме. Данные хранились только
в `location.state` React Router, ничего не писалось на бэк.

B заменяет мок реальным пайплайном: PDF/DOCX резюме реально парсится, тейлорится под вакансию
через Claude Code (без внешнего LLM API — только подписка), и фронт из A подключается к
реальным данным вместо `setTimeout`.

## Механика вызова Claude

Бэкенд шлёт headless CLI-сабпроцесс: `claude -p "<prompt>" --model <haiku|sonnet>
--output-format json`. Ответ — JSON-конверт, текст модели лежит в поле `result` (иногда
обёрнут в \`\`\`json fence — снимать перед парсингом). Работает локально на машине, где юзер
залогинен в Claude Code; отдельный API-ключ не нужен. Проверено вживую перед реализацией.

## Роутинг моделей

- **Haiku** — структурирование сырого текста резюме в JSON `{summary, experience[], skills[]}`.
  Чистый parsing-этап, качество некритично, экономим.
- **Sonnet** — сам тейлоринг: дать структурированное резюме + вакансию, получить
  пересмотренную версию той же формы. Тут важно качество и осмысленность добавлений.
- **Дифф** — не модель. Алгоритм (`difflib`) сравнивает original vs tailored, размечает
  слова/пункты/скиллы как `unchanged` / `added` / `removed`.

## Формат Segment (меняется относительно мока A)

```ts
type Segment = { text: string; kind: 'unchanged' | 'added' | 'removed' }
type TailoredResume = { summary: Segment[]; experience: Segment[][]; skills: Segment[] }
```

`added` — зелёный фон. `removed` — красный фон + зачёркивание, показывается только в
tailored-режиме (в original-режиме removed-сегменты рендерятся как обычный текст — это и есть
исходное резюме). В original-режиме added-сегменты не показываются вовсе.

Диф на уровне: summary — по словам; experience — по целым пунктам (список bullet'ов
диффится как список, не по словам внутри); skills — по множеству (added = есть в
tailored и нет в original, и наоборот).

## Бэкенд

**Модель.** `ApplicationStatus` получает новое значение `generating` (между `draft` и
`ready`): `draft` → `generating` (фоновая задача запущена) → `ready` (результат готов) →
`applied`/`rejected`/`offer` (как раньше, ручная отметка).

**`app/tailoring.py`** (новый модуль):
- `extract_text(path) -> str` — `pypdf` для PDF, `python-docx` для DOCX.
- `run_claude(prompt: str, model: str) -> dict` — сабпроцесс, таймаут 120с, парсит `result`
  (снимая fence), возвращает распарсенный JSON.
- `structure_resume(text: str) -> StructuredResume` — Haiku.
- `tailor_resume(structured: StructuredResume, vacancy: Vacancy) -> StructuredResume` — Sonnet.
- `diff_sections(original: StructuredResume, tailored: StructuredResume) -> TailoredResume` —
  difflib, три уровня как описано выше.

**Роуты (`applications.py`, добавляю к существующим):**
- `GET /applications/{id}` — единичный лукап (нужен фронту для поллинга статуса).
- `POST /applications/{id}/tailor` — `BackgroundTasks`: extract → structure → tailor → diff →
  пишет `backend/tailored/{id}.json` (`{original, tailored}`), `tailored_resume_path` =
  имя файла, статус `generating` → `ready`. Ошибка сабпроцесса — статус остаётся
  `generating`, ретрай — повторный POST.
- `GET /applications/{id}/tailored` — отдаёт `{original, tailored}` из файла.
- `PATCH /applications/{id}/tailored` — юзер вручную поправил тейлоренный текст в UI. Тело
  `{summary: string, experience: string[], skills: string[]}` — новая версия tailored
  (plain, без сегментов). Бэк берёт сохранённый `original` (структурированный, из того же
  файла), пересчитывает `diff_sections(original, payload)`, перезаписывает файл, отдаёт
  свежий `{original, tailored}`. Один и тот же diff-движок что для AI-результата, что для
  ручной правки — не дублируем логику.

`requirements.txt` пополняется: `pypdf`, `python-docx`.

## Фронт

**`src/api.ts`** (новый) — `const API_BASE = 'http://localhost:8000'`, тонкие обёртки над
fetch для resumes/applications.

**`ResumeUpload.tsx`** — при аплоаде дублирует файл на бэк (`POST /resumes/`
multipart), пишет `backendId` в `StoredResume` (новое опциональное поле). Бэк недоступен →
ошибка проглатывается (`console.warn`), localStorage-путь как раньше не ломается.

**`/select`** — кнопка "Сгенерировать" активна только если у активного резюме есть
`backendId` (иначе подсказка "резюме не синхронизировано — перезагрузи страницу"). По клику:
на каждую выбранную вакансию — `POST /applications/` (vacancy_id, resume_id=backendId), затем
`POST /applications/{id}/tailor`. Дальше `navigate('/pipeline/review', { state: { items:
[{vacancyId, applicationId}], resumeId } })`.

**Галерея (A, правки)** — вместо `setTimeout`-мока каждые ~1.5с поллит `GET
/applications/{id}` по каждому `applicationId` из state, статус `generating`/`ready`
маппится на существующий бейдж. Останавливает поллинг, когда все `ready`.

**Approve-режим (A, правки)** — вместо `mockTailoring.ts` (удаляется) грузит `GET
/applications/{id}/tailored` при заходе. Новое: кнопка "Редактировать" (доступна только в
tailored-режиме) — переключает секции (summary/experience/skills) на `<textarea>` с текущим
plain-текстом tailored (сегменты `unchanged`+`added`, без `removed` — это то, что реально
сейчас в резюме). "Сохранить" → `PATCH /applications/{id}/tailored`, ответ заменяет
локальный `resume` state, выходим из режима правки обратно на цветной дифф. "Отмена" —
без запроса.

**`TailoredDiffView.tsx`** — рендер трёх kind: `unchanged` обычный, `added` зелёный фон,
`removed` красный фон + line-through (только в tailored-режиме). Плюс режим редактирования
(textarea вместо цветного текста) под тем же компонентом.

## Что не входит в B (сознательно)

- Версионирование тейлоринга (перегенерация — просто overwrite).
- Очередь/лимит параллельных сабпроцессов (до 10 вакансий за раз — ок для личного
  использования, не продакшен-нагрузка).
- PDF-рендер финального резюме — это sub-project C, отдельно.
