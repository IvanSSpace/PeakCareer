import { Section, LinkItem } from '../../components/DocBlocks'
import VacancyFeed from './VacancyFeed'

export default function AggregatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold text-neutral-900">Агрегатор вакансий</h1>
      <p className="mt-3 text-neutral-500">
        Собирает вакансии из разных источников по IT-специализациям. Приоритет №1 в разработке.
      </p>

      <Section title="Статус: первый спайк готов">
        <p>
          Скрапер (<code className="rounded bg-neutral-100 px-1">scraper/fetch_telegram.py</code>)
          реально стянул 60 постов с трёх живых каналов (proglib_jobs, evacuatejobs,
          it_vakansii_jobs). 15 вакансий вручную размечены в структурированный JSON
          (<code className="rounded bg-neutral-100 px-1">data/vacancies.json</code>) — весь путь
          скрапинг → структура подтверждён на реальных данных.
        </p>
        <p>
          Экстракция сейчас — ручная (свой Claude Code, без отдельного API-ключа). Реальный
          LLM-провайдер и автоматизация — решаем при подходе к публикации.
        </p>
        <p className="font-medium text-neutral-900">Что уже видно на реальных данных:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Не каждый пост в канале — вакансия: дайджесты, реклама курсов, вовлекающий контент — нужен фильтр «это вообще вакансия?» до экстракции полей.</li>
          <li>Разные каналы дают разную полноту: proglib_jobs — стек/требования прямо в посте; evacuatejobs — только тайтл+компания+ссылка, стек нужно тянуть по ссылке отдельным запросом.</li>
        </ul>
      </Section>

      <VacancyFeed />

      <Section title="Источник — Telegram">
        <p>
          Чтение через публичный веб-preview <code className="rounded bg-neutral-100 px-1">t.me/s/&lt;channel&gt;</code> —
          HTML со свежими постами без бота, без MTProto, без логина. Проверено вживую на реальном
          IT-канале: 11 последних постов, уже структурированных (зарплата, формат работы,
          локация, хэштеги, требования). Есть пагинация для истории.
        </p>
        <p>
          Bot API не нужен — требует согласия владельца канала на добавление бота, `t.me/s/` этого
          не требует. MTProto/Telethon тоже не нужен, если хватает публичных постов (не нужны
          приватные чаты/личка).
        </p>
        <p className="font-medium text-neutral-900">Пайплайн:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Скрапинг <code className="rounded bg-neutral-100 px-1">t.me/s/</code> — готовые репо как база.</li>
          <li>LLM-экстракция полей (company, stack, salary, location, remote) — structured output вместо regex.</li>
          <li>Дедуп репостов — MinHash + LSH (datasketch), ловит почти идентичный текст дёшево.</li>
        </ol>
        <ul className="list-disc space-y-1 pl-5">
          <LinkItem href="https://github.com/Steelio/Telegram-Post-Scraper" label="Steelio/Telegram-Post-Scraper" />
          <LinkItem href="https://github.com/PythonicCafe/tchan" label="PythonicCafe/tchan" />
          <LinkItem href="https://github.com/567-labs/instructor" label="Instructor — structured LLM output (Pydantic-схема)" />
        </ul>
      </Section>

      <Section title="Другие источники">
        <p className="font-medium text-neutral-900">Подключать сейчас:</p>
        <ul className="list-disc space-y-1 pl-5">
          <LinkItem href="https://himalayas.app/api" label="Himalayas API — бесплатный, без ключа, JSON, remote-вакансии" />
        </ul>
        <p>
          Плюс краудсорсные списки RU-friendly компаний на международном рынке — уже собраны,
          не нужно строить с нуля:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <LinkItem href="https://idagent.pro/companies" label="iDagent — 150 компаний с RU/BY/UA/AM корнями" />
          <LinkItem href="https://habr.com/ru/articles/1021472" label="Habr — сборник 200+ русскоязычных компаний на международке" />
          <LinkItem href="https://career.habr.com" label="career.habr.com — директория компаний с фильтрами" />
        </ul>
        <p className="font-medium text-neutral-900">Не используем принципиально:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>hh.ru — заточен под RU-рынок, не международный, и вообще нет.</li>
        </ul>
        <p className="font-medium text-neutral-900">Справочник для расширения (не прямой источник):</p>
        <ul className="list-disc space-y-1 pl-5">
          <LinkItem href="https://github.com/lukasz-madon/awesome-remote-job" label="awesome-remote-job — каталог других job-board'ов" />
        </ul>
      </Section>
    </div>
  )
}
