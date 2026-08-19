import { Link } from 'react-router-dom'

const modules = [
  {
    to: '/aggregator',
    title: 'Агрегатор вакансий',
    description: 'Собирает вакансии из Telegram-каналов по IT-специализациям.',
  },
  {
    to: '/resume',
    title: 'Редактор резюме',
    description: 'Адаптирует резюме под конкретную вакансию.',
  },
  {
    to: '/learning',
    title: 'Обучение',
    description: 'Подборка ссылок: skill-refresh и разработка в эпоху ИИ.',
  },
  {
    to: '/setup',
    title: 'Рабочий сетап',
    description: 'Инструменты, окружение — всё для эффективной разработки.',
  },
  {
    to: '/pipeline',
    title: 'Пайплайн',
    description: 'Как модули соединяются в один сквозной поток.',
  },
]

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-semibold text-neutral-900">PeakCareer</h1>
      <p className="mt-3 text-neutral-500">Платформа для поиска работы разработчиками.</p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="rounded-xl border border-neutral-200 p-6 text-left transition hover:border-neutral-400"
          >
            <span className="inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
              в разработке
            </span>
            <h2 className="mt-3 text-lg font-medium text-neutral-900">{m.title}</h2>
            <p className="mt-1 text-sm text-neutral-500">{m.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
