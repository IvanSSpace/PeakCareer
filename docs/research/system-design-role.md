# Architect / System Design: рынок вакансий и обучение

Дата ресёрча: 2026-08-19/20.
Метод: прямые WebFetch-запросы к источникам, которые PeakCareer уже использует для агрегации вакансий (Telegram-канал, Himalayas API, Djinni), плюс WebFetch/WebSearch по обучающим roadmap'ам.

---

## 1. Рынок вакансий

### 1.1 Telegram-канал proglib_jobs

Источник: [t.me/s/proglib_jobs](https://t.me/s/proglib_jobs) (публичный веб-просмотр канала).

- На проверенной ленте (последние посты канала, ~17 постов, из них 14 — реальные вакансии, 3 — образовательный/инфоконтент) **вакансий с ролью Architect / Staff / Principal не найдено вообще** — 0 из 14 (0%).
- Представленные роли: Android (C/C++, WebRTC), JS/TS, Python, Data Scientist, Java, Go, PHP Full-stack, QA.
- Вывод: proglib_jobs — канал преимущественно про мидл/сеньор IC-роли (в т.ч. узкоспециализированные стеки), архитектурные/staff+ позиции в выборке не встретились. Возможно, это связано с малым размером выборки (один снимок ленты) и тем, что архитектурные роли реже публикуются через такие каналы (обычно закрываются через рекрутеров/LinkedIn/внутренние реферальные сети), а не через паблики с вакансиями "для разработчиков".

### 1.2 Himalayas API

Источник: [himalayas.app/api](https://himalayas.app/api) (документация), плюс проверка живых листингов через [himalayas.app/jobs/software-architect](https://himalayas.app/jobs/software-architect) и [himalayas.app/jobs/software-architecture](https://himalayas.app/jobs/software-architecture).

- API даёт два эндпоинта: `Browse` (`/jobs/api`) и `Search` (`/jobs/api/search`), с параметрами `q` (текстовый поиск), `seniority` (Entry/Mid/Senior/Manager/Director/Executive), `employment_type`, `country`, `timezone`, `company`.
- **Отдельного структурированного фильтра/категории "Architecture" или "Software Architect" в документации API нет** — поле `category` существует в ответе, но список допустимых значений не задокументирован явно.
- При этом **реальные вакансии под запрос "software architect" на сайте есть и активно публикуются**: подтверждённые живые лендинги — Holocene, Leidos (AWS GovCloud, tech lead модернизации), Caretria (healthcare platform), TekSynap, Monterey Technologies, Versapay — все remote/международные позиции.
- Вывод: спрос реальный и заметный (десятки активных remote-вакансий уровня architect на площадке), но доступен только через свободный текстовый поиск (`q=software architect`), а не через выделенную категорию — то есть агрегатору PeakCareer для показа таких вакансий из Himalayas нужен keyword-based запрос, а не category-фильтр.

### 1.3 Djinni

Источник: [djinni.co](https://djinni.co), список вакансий [djinni.co/jobs](https://djinni.co/jobs/), и прямой keyword-поиск [djinni.co/jobs/keyword-architect](https://djinni.co/jobs/keyword-architect/).

- На главной/в листинге вакансий Djinni **нет выделенной категории-фильтра "Architect"** в основном наборе фильтров (Category, Salary, Work experience, Employment, Company type, English, Domain, Region/City/Country) — судя по всему, architect входит в укрупнённую категорию вроде "Lead/Architect/CTO" (упоминается в результатах поиска), а не выделен отдельно в основном UI.
- **Keyword-поиск `keyword-architect` возвращает 40 активных вакансий** на момент проверки: примеры — "Solution Architect" (Seedium), "ServiceNow Principal / Lead Architect" (Langate), "Software Architect (.NET)" (GlobalLogic), "Technical Architect – WMS" (Hanna Robulets Company), "Systems Architect and Automation Engineer" (Smarten Transport), "Solution Architect (Java+React)" (ZentixSoft), "AI Architect" (Ascendix Technologies).
- Это преимущественно **локальные/региональные (украинский рынок, аутсорс/аутстафф компании: GlobalLogic и т.п.) сеньорные позиции**, а не международный remote-only сегмент, в отличие от Himalayas.
- Вывод: спрос есть и заметный (40 живых вакансий по keyword на момент проверки — сопоставимо по объёму с популярными языковыми категориями), но технически реализуется как keyword-поиск, а не отдельная категория в навигации.

### 1.4 Итог по разделу 1

| Источник | Формальная категория "Architect"? | Реальные вакансии есть? | Объём | Remote/международные vs локальные |
|---|---|---|---|---|
| proglib_jobs (Telegram) | Нет | Не встретились в выборке (0/14) | Низкий/не подтверждён | Локальные/СНГ (по характеру канала) |
| Himalayas API | Нет (только `q` free-text) | Да, живые | Средний-высокий (десятки листингов) | Remote / международные |
| Djinni | Нет как отдельный фильтр в UI, но есть в укрупнённой категории Lead/Architect/CTO; keyword-поиск работает | Да, живые | Средний-высокий (40 по keyword) | Локальные/региональные (UA/аутсорс), сеньорные |

Спрос на архитектурные роли **реален и не маргинален** на двух из трёх источников (Himalayas, Djinni), но ни один источник не выдаёт их через готовую категорию — везде нужен keyword/free-text поиск (`architect`, `staff engineer`, `principal engineer`). В Telegram-канале proglib_jobs такие вакансии в разовой выборке не встретились, что не исключает их периодического появления, но говорит о низкой частоте по сравнению с mid/senior IC-ролями.

---

## 2. Обучение — System Design roadmap

### 2.1 roadmap.sh/system-design

Источник: [roadmap.sh/system-design](https://roadmap.sh/system-design).

- Ресурс существует как отдельный roadmap (skill track), не привязанный к конкретной вакансии/роли — что соответствует запросу "System Design как отдельный навык".
- Из FAQ/вводной части страницы подтверждённый список тем: **выбор языка программирования, базы данных, CDN, балансировщики нагрузки (load balancers), кэши, прокси, очереди (queues), веб-серверы, серверы приложений, поисковые системы, системы логирования и мониторинга, масштабирование (scaling/scalability), архитектурные паттерны, меры безопасности**.
- Полное дерево узлов (интерактивная roadmap-схема с деталями по CAP theorem, sharding, replication, consistent hashing и т.д.) не удалось вытащить целиком через текстовый fetch — сайт использует интерактивный граф, который частично не разворачивается в текстовом виде при обычном скрейпинге. Но по составу видимых тем это классический system-design curriculum, тематически совпадающий с общепринятым содержанием курса (масштабирование, распределённые системы, trade-offs).
- roadmap.sh в целом — активно поддерживаемый и часто обновляемый проект (используется как стандартная точка входа в индустрии для roadmaps по ролям и навыкам); в рамках этого фетча точная дата последнего обновления страницы в контенте не проставлена явно, но текст ссылается на актуальный год ("в 2026"), что указывает на живое обслуживание контента.

### 2.2 donnemartin/system-design-primer (GitHub)

Источник: WebSearch, включая [GitHub-репозиторий](https://github.com/donnemartin/system-design-primer), [Gitstar Ranking](https://gitstar-ranking.com/donnemartin/system-design-primer), [Commits](https://github.com/donnemartin/system-design-primer/commits).

- **~352 596 звёзд** по состоянию на 2026-06 — один из самых популярных обучающих репозиториев на GitHub в принципе, не только в нише system design.
- **Последний push — 2026-03-20**, то есть репозиторий поддерживается и обновляется, не заброшен.
- Контент: концепции system design, ссылки на углублённые материалы, интервью-задачи с примерами решений, object-oriented design упражнения, Anki flashcard-колоды для spaced repetition.
- Вывод: качественный, авторитетный и живой источник именно по треку "System Design" как отдельному навыку (а не под конкретную роль), с огромным социальным подтверждением (звёзды) и недавней активностью.

### 2.3 Итог по разделу 2

Оба проверенных источника (roadmap.sh/system-design и donnemartin/system-design-primer) подтверждают: **качественный, актуальный и достаточно детализированный контент под System Design как отдельный skill track существует и активно поддерживается**. roadmap.sh даёт структурированный "дерево навыков" формат, primer — более классический curriculum + практика (Anki, кейсы). Это два взаимодополняющих формата, оба high-trust/high-adoption в индустрии.

---

## Источники

- [t.me/s/proglib_jobs](https://t.me/s/proglib_jobs)
- [himalayas.app/api](https://himalayas.app/api)
- [himalayas.app/jobs/software-architect](https://himalayas.app/jobs/software-architect)
- [himalayas.app/jobs/software-architecture](https://himalayas.app/jobs/software-architecture)
- [djinni.co](https://djinni.co)
- [djinni.co/jobs](https://djinni.co/jobs/)
- [djinni.co/jobs/keyword-architect](https://djinni.co/jobs/keyword-architect/)
- [roadmap.sh/system-design](https://roadmap.sh/system-design)
- [github.com/donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer)
- [gitstar-ranking.com/donnemartin/system-design-primer](https://gitstar-ranking.com/donnemartin/system-design-primer)
- [github.com/donnemartin/system-design-primer/commits](https://github.com/donnemartin/system-design-primer/commits)
