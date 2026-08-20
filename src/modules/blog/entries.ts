export type Entry = {
  date: string
  version: string | null
  title: string
  body: string
}

// Newest first — prepend new entries here, never push to the end.
export const entries: Entry[] = [
  {
    date: '2026-08-20',
    version: null,
    title: 'Пайплайн: решили автоотклики и стек',
    body: 'Для связки агрегатор+резюме берём версию A — ручная отметка "откликнулся" в кабинете, без автоматизации отправки. Бэкенд: FastAPI + SQLite, пока без хостинга, гоняем локально.',
  },
  {
    date: '2026-08-20',
    version: null,
    title: 'Реальные Architect-вакансии в фиде',
    body: '6 вакансий с Djinni (Seedium, GlobalLogic, ZentixSoft, Ascendix, Climission, PwC) — подтвердили ресёрчем, что спрос на роль есть, добавили как отдельную категорию. Плюс System Design как трек 3 в обучении.',
  },
  {
    date: '2026-08-19',
    version: 'v0.2',
    title: 'Агрегатор: живой фид с реальными данными',
    body: 'Скрапер вытянул 60 постов с трёх Telegram-каналов, 15 вакансий структурировано и легло на страницу /aggregator — карточки, фильтры по роли (DevOps/Frontend/Backend/...), Fraunces + JetBrains Mono.',
  },
  {
    date: '2026-08-19',
    version: 'v0.1',
    title: 'Первый деплой',
    body: 'Vite + React + TS + Tailwind, 5 модулей-страниц (агрегатор, резюме, обучение, сетап, пайплайн), задеплоено на GitHub Pages.',
  },
]
