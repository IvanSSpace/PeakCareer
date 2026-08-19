import { useMemo, useState } from 'react'
import vacanciesRaw from './vacancies.sample.json'

type Vacancy = {
  id: string
  url: string
  source_channel: string
  title: string
  company: string
  salary_min: number | null
  salary_max: number | null
  currency: 'RUB' | 'USD' | 'EUR' | null
  location: string | null
  remote: boolean
  category: string
  stack: string[] | null
  apply_via: string
}

const vacancies = vacanciesRaw as Vacancy[]

const CURRENCY_SYMBOL: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€' }

function formatSalary(v: Vacancy): string {
  if (v.salary_min == null && v.salary_max == null) return '— не указана —'
  const sym = v.currency ? CURRENCY_SYMBOL[v.currency] ?? v.currency : ''
  const fmt = (n: number) => n.toLocaleString('ru-RU')
  if (v.salary_min != null && v.salary_max != null) {
    return `${fmt(v.salary_min)}–${fmt(v.salary_max)} ${sym}`
  }
  const only = v.salary_min ?? v.salary_max!
  return `от ${fmt(only)} ${sym}`
}

export default function VacancyFeed() {
  const categories = useMemo(
    () => ['все', ...Array.from(new Set(vacancies.map((v) => v.category)))],
    [],
  )
  const [active, setActive] = useState('все')

  const shown = active === 'все' ? vacancies : vacancies.filter((v) => v.category === active)

  return (
    <section className="mt-10 text-left">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-neutral-200 pb-4">
        <h2
          className="text-2xl text-neutral-900"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Живой фид
        </h2>
        <div
          className="flex items-center gap-2 text-xs text-neutral-500"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          60 постов · 15 вакансий · 3 канала
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              active === c
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
        {shown.map((v, i) => (
          <li
            key={v.id}
            className="group fade-in-row py-5"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-neutral-900">{v.title}</h3>
                  {v.remote && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      remote
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {v.company}
                  {v.location ? ` · ${v.location}` : ''}
                </p>
                {v.stack && v.stack.length > 0 && (
                  <div
                    className="mt-2 flex flex-wrap gap-1.5"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {v.stack.map((s) => (
                      <span
                        key={s}
                        className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[11px] text-neutral-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                <span
                  className="text-sm font-medium text-neutral-900"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {formatSalary(v)}
                </span>
                <a
                  href={v.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-neutral-400 underline decoration-neutral-300 underline-offset-2 opacity-0 transition group-hover:opacity-100 hover:text-neutral-900 hover:decoration-neutral-900"
                >
                  {v.source_channel} →
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-neutral-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        источник: data/vacancies.json — снапшот реального скрапа, обновляется вручную на этой стадии
      </p>
    </section>
  )
}
