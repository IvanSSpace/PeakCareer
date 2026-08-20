# Ресёрч: репозитории/инструменты для "тейлоринга" резюме под конкретную вакансию

Дата: 2026-08-20
Контекст: модуль "Редактор резюме" PeakCareer (React+TS фронт, бэкенд не выбран). Задача — найти репозитории/инструменты, специально заточенные под matching/tailoring резюме под JD (job description), которые могли быть упущены в предыдущих ресёрчах. Уже известные до этого захода находки (не переисследовались повторно, кроме уточнения лицензии):

- Claude Code skills, установленные локально: career-profile-builder, resume-tailor-profile, job-description-analyzer, resume-bullet-writer, resume-quantifier, resume-ats-optimizer, resume-formatter, resume-section-builder, resume-version-manager, cover-letter-generator, interview-prep-generator.
- `composiohq/awesome-claude-skills@tailored-resume-generator` — 8.9K установок, прошёл аудиты Agent Trust Hub/Socket/Snyk, опубликован 20.01.2026.
- `srbhr/Resume-Matcher` — 28.1k★ (на момент этого захода — 28.2k★), Next.js+React+TS+Tailwind фронт + FastAPI бэк, мульти-LLM, живой (обновлялся 11.08.2026).

---

## 1. Находки по GitHub-поиску

### 1.1 Полноценные веб-сервисы/приложения (JD-tailoring/matching, не "билдер с нуля")

| Репозиторий | ★ | Стек | Лицензия | Активность | Заметки |
|---|---|---|---|---|---|
| [srbhr/Resume-Matcher](https://github.com/srbhr/resume-matcher) | 28.2k | Next.js+React+TS+Tailwind / FastAPI, мульти-LLM | **Apache-2.0** (подтверждено поиском, см. [источник](https://github.com/srbhr/Resume-Matcher/blob/main/README.md)) | живой, 1456 коммитов, 22 open issues / 46 PR, участник Vercel Open Source Program | Уже известный кандидат — на 2 порядка крупнее любой альтернативы ниже. Лицензия Apache-2.0 — permissive, хорошо подходит для коммерческого реюза (в отличие от AGPL у resume-lm ниже) |
| [olyaiy/resume-lm](https://github.com/olyaiy/resume-lm) | 312 | Next.js 15 + React 19 + TS + Tailwind + Shadcn UI + Supabase(Postgres) + OpenAI/Claude/Gemini/DeepSeek/Groq | **AGPL-3.0** (copyleft) | активен, 904 коммита | Ближайший по масштабу конкурент Resume-Matcher, но это в первую очередь **general AI resume builder** ("Create base resumes and tailored versions") — tailoring есть, но не основной фокус. AGPL-3.0 — риск для закрытого коммерческого продукта |
| [JeevansSP/resume-optimizer](https://github.com/JeevansSP/resume-optimizer) | 35 | FastAPI + SQLAlchemy async + PostgreSQL + Vue 3 + Tailwind + Gemini + LaTeX(pdflatex) | MIT | похоже на активный, точная дата последнего коммита не видна, 173 unit-теста | Специально под JD-tailoring: upload PDF резюме + paste JD → ATS-optimized PDF через LaTeX. Слишком мал (35★) чтобы конкурировать с Resume-Matcher |
| [NullSpace-BitCradle/ats-resume-agent](https://github.com/NullSpace-BitCradle/ats-resume-agent) | 9 | **Claude Code агент** (не веб-сервис) + LaTeX + Python | MIT (+ CC-BY-4.0 на LaTeX-шаблон) | 12 коммитов, v1.1.0, дата последнего коммита не видна | Прямой аналог уже установленных локальных skills — два агента `.claude/agents/ats-resume-writer.md` и `career-doc-builder.md`, политика "zero fabrication" (никогда не придумывает метрики). Полезен как референс промптов/гардрейлов, не как код продукта |
| [AjayLuhach/resume-forge](https://github.com/AjayLuhach/resume-forge) | 5 | Node.js/Express, AWS Bedrock/Gemini (BYO API key), LibreOffice/Puppeteer для PDF, SMTP | MIT | ранняя стадия, 28 коммитов, 0 форков, 0 PR | JD → keyword-matched ATS-scored resume + email/LinkedIn draft. Слишком рано и мало community traction |
| [eristavi/CV-Matcher](https://github.com/eristavi/CV-Matcher) | 3 | Python (план миграции на Next.js/FastAPI/TS), Qdrant для vector similarity | Apache-2.0 | низкая активность, 274 коммита в истории (форк идей Resume-Matcher) | Форк/производная от идей Resume-Matcher, минимальная ценность как отдельный кандидат |

### 1.2 GitHub Topics (`resume-tailoring`, `resume-matching`) — обзор длинного хвоста

Прошёлся по топикам [`resume-tailoring`](https://github.com/topics/resume-tailoring) и [`resume-matching`](https://github.com/topics/resume-matching) целиком — ни один проект не превышает **22★**. Максимумы: `Multi-AI-Agent-Systems-with-crewAI` (167★, но это общий агентный фреймворк, не resume-инструмент), `JobMatchAI` и `JobSentinel` (по 22★, скорее job-search автоматизация, чем resume tailoring), `ai-job-matcher` (20★), `IntelliMatch-AI-ATS` (10★), `MatchMyJD` (4★, "LLM-powered resume ↔ JD matcher using evidence-aware scoring" — концептуально близко, но крошечный). Остальные (Resume-Pilot, resume-tailor-app, resume-tailor, vibe-resume, applymate-jobcopilot и десятки других) — от 1 до 9★. Ни один не приближается к масштабу/зрелости Resume-Matcher.

Источники: [GitHub Topics: resume-tailoring](https://github.com/topics/resume-tailoring), [GitHub Topics: resume-matching](https://github.com/topics/resume-matching).

**Вывод по разделу 1:** новых серьёзных кандидатов на **реюз кода продукта** не найдено. Resume-Matcher по-прежнему на 1-2 порядка впереди по звёздам, зрелости и активности любого альтернативного JD-tailoring репозитория. Единственный проект сопоставимого масштаба (resume-lm, 312★) — это general-purpose builder с AGPL-3.0 лицензией, которая менее удобна для закрытого коммерческого продукта, чем Apache-2.0 у Resume-Matcher.

---

## 2. Находки по skills.sh (реестр Claude Code skills)

### 2.1 `npx skills find "resume"`

```
composiohq/awesome-claude-skills@tailored-resume-generator   8.9K installs
paramchoudhary/resumeskills@resume-ats-optimizer              8.7K installs
paramchoudhary/resumeskills@linkedin-profile-optimizer        7.7K installs
paramchoudhary/resumeskills@resume-bullet-writer              7.3K installs
paramchoudhary/resumeskills@resume-tailor                     6.7K installs
paramchoudhary/resumeskills@tech-resume-optimizer             6.6K installs
paramchoudhary/resumeskills@resume-formatter                  6.4K installs
paramchoudhary/resumeskills@interview-prep-generator          6.4K installs
paramchoudhary/resumeskills@cover-letter-generator            6.4K installs
paramchoudhary/resumeskills@job-description-analyzer          6.4K installs
paramchoudhary/resumeskills@resume-quantifier                 6.2K installs
paramchoudhary/resumeskills@resume-section-builder             6.2K installs
paramchoudhary/resumeskills@portfolio-case-study-writer       6.1K installs
paramchoudhary/resumeskills@academic-cv-builder                6K installs
paramchoudhary/resumeskills@creative-portfolio-resume          6K installs
paramchoudhary/resumeskills@resume-version-manager              6K installs
paramchoudhary/resumeskills@executive-resume-writer            5.9K installs
claude-office-skills/skills@resume-tailor                     4.5K installs
phuryn/pm-skills@review-resume                                 2.2K installs
alirezarezvani/claude-skills@resume                            1.5K installs
```

**Важное наблюдение:** названия всех 17 скиллов пакета `paramchoudhary/resumeskills` **побуквенно совпадают** со списком локально установленных у пользователя skills (career-profile-builder, resume-tailor-profile, job-description-analyzer, resume-bullet-writer, resume-quantifier, resume-ats-optimizer, resume-formatter, resume-section-builder, resume-version-manager, cover-letter-generator, interview-prep-generator и др.). Похоже, что именно репозиторий `paramchoudhary/resumeskills` — исходный источник большей части уже установленного набора skills.

Проверка карточки [`resume-ats-optimizer` на skills.sh](https://skills.sh/paramchoudhary/resumeskills/resume-ats-optimizer):
- Установки на карточке: 6.1K (расхождение с 8.7K из CLI-листинга — вероятно разные срезы/кэш реестра).
- Аудиты: Gen Agent Trust Hub — **Pass**, Socket — **Pass**, Snyk — **Warn** (слабее, чем у composiohq/tailored-resume-generator, который по ранее известным данным прошёл все три, включая Snyk).
- Исходный репозиторий: [github.com/paramchoudhary/resumeskills](https://github.com/paramchoudhary/resumeskills), звёзды самого репо — 1.7K (для сравнения — composiohq/awesome-claude-skills как контейнер-репозиторий имеет 72.8K★, но это общий "awesome"-репозиторий с сотнями скиллов, а не показатель именно tailored-resume-generator).

Источники: [skills.sh — resume-ats-optimizer](https://skills.sh/paramchoudhary/resumeskills/resume-ats-optimizer), CLI-вывод `npx skills find "resume"`.

### 2.2 `npx skills find "ATS"`

Результаты в основном — нерелевантный fuzzy-match на "stats" (`caveman-stats`, `writing-beats`, `bats-testing-patterns`, `kosis-stats`, `ctx-stats`, `cn-stats`, `huawei-cloud-obs-stats`, `quick-stats`, `statsmodels`, `workflow-from-chats`, `mpstats`, `asc-whats-new-writer`, `swift-formatstyle` и т.д.) — ни один не про ATS/резюме.

Единственный релевантный результат — тот же `paramchoudhary/resumeskills@resume-ats-optimizer` (8.7K installs) — уже учтён выше.

**Вывод по разделу 2:** ничего с бОльшим числом установок или лучшей репутацией, чем уже найденный `composiohq/awesome-claude-skills@tailored-resume-generator`, не обнаружено. `composiohq` остаётся лидером по installs (8.9K) и по аудитам (прошёл все три, включая Snyk). `paramchoudhary/resumeskills` — близкий конкурент по installs у отдельных скиллов, но с более слабым Snyk-статусом ("Warn"); главная ценность этой находки — вероятная идентификация источника уже установленного локального набора skills.

---

## 3. Итоговое сравнение и рекомендация

### Для реюза кода продукта (веб-сервис)

**Rекомендация не меняется: `srbhr/Resume-Matcher` остаётся лучшим выбором.**

Обоснование:
- Ближайший конкурент по звёздам — `olyaiy/resume-lm` (312★) — на два порядка меньше (28.2k vs 312), и это general-purpose "AI resume builder", а не специализированный JD-matcher; плюс лицензия AGPL-3.0 накладывает copyleft-обязательства, неудобные для закрытого коммерческого продукта. У Resume-Matcher лицензия **Apache-2.0** — permissive, реюз без раскрытия исходников.
- Все остальные найденные JD-tailoring веб-сервисы (resume-optimizer — 35★, resume-forge — 5★, CV-Matcher — 3★) находятся на ранней стадии, либо являются форками идей самого Resume-Matcher (CV-Matcher прямо использует подход Resume-Matcher + добавляет Qdrant).
- Стек Resume-Matcher (Next.js/React/TS фронт + FastAPI бэк) по-прежнему хорошо ложится на условия PeakCareer (React+TS фронт готов, бэкенд ещё не выбран — FastAPI/Python можно рассмотреть как опцию для бэкенда модуля резюме, раз есть готовый референс).

### Для референса промптов / skill-дизайна (не код продукта)

Три находки стоит держать в поле зрения как источники идей для промптов/гардрейлов, не для реюза кода:

1. **`composiohq/awesome-claude-skills@tailored-resume-generator`** (уже известен) — лидер по installs (8.9K) и по чистоте аудитов среди Claude Code skills.
2. **`NullSpace-BitCradle/ats-resume-agent`** — маленький (9★), но концептуально ценный: реализует "zero fabrication policy" (никогда не придумывает метрики/достижения, которых нет в master career document) и связку "career-doc-builder + JD-tailored LaTeX writer" —两 агента, очень похоже на связку уже установленных `career-profile-builder` + `resume-tailor-profile`. Хороший источник промпт-паттернов anti-hallucination для этих же локальных skills.
3. **`paramchoudhary/resumeskills`** — вероятный первоисточник большинства уже установленных локальных skills; стоит свериться с его текущей версией на GitHub на предмет апдейтов/багфиксов, которые могли не попасть в уже установленные локальные копии.

### Что НЕ стоит использовать

- `eristavi/CV-Matcher` (3★, форк идей Resume-Matcher — проще смотреть в оригинал).
- `AjayLuhach/resume-forge` (5★, ранняя стадия, 0 форков/PR).
- Весь длинный хвост из topics `resume-tailoring`/`resume-matching` (≤22★ у любого проекта) — недостаточно зрелости для реюза кода; отдельные названия (`MatchMyJD`, `IntelliMatch-AI-ATS`) можно держать в уме как нишевые референсы алгоритмов scoring, если понадобится сравнить подходы к JD-matching скорингу.

---

## Источники

- [srbhr/Resume-Matcher](https://github.com/srbhr/resume-matcher)
- [srbhr/Resume-Matcher — README (лицензия)](https://github.com/srbhr/Resume-Matcher/blob/main/README.md)
- [olyaiy/resume-lm](https://github.com/olyaiy/resume-lm)
- [JeevansSP/resume-optimizer](https://github.com/JeevansSP/resume-optimizer)
- [eristavi/CV-Matcher](https://github.com/eristavi/CV-Matcher)
- [NullSpace-BitCradle/ats-resume-agent](https://github.com/NullSpace-BitCradle/ats-resume-agent)
- [AjayLuhach/resume-forge](https://github.com/AjayLuhach/resume-forge)
- [GitHub Topics: resume-tailoring](https://github.com/topics/resume-tailoring)
- [GitHub Topics: resume-matching](https://github.com/topics/resume-matching)
- [skills.sh — paramchoudhary/resumeskills/resume-ats-optimizer](https://skills.sh/paramchoudhary/resumeskills/resume-ats-optimizer)
- [paramchoudhary/resumeskills (GitHub)](https://github.com/paramchoudhary/resumeskills)
- CLI: `npx skills find "resume"`, `npx skills find "ATS"` (пакет `skills` через `npm exec`)
