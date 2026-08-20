import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { vacancies, ROLE_ORDER } from '../aggregator/vacancy'
import VacancyRow from '../aggregator/VacancyRow'

const RESUME_KEY = 'peakcareer:resume'
const MAX_SELECTED = 10

type StoredResume = { name: string; size: number; uploadedAt: string }

export default function SelectPage() {
  const [resume, setResume] = useState<StoredResume | null>(null)
  const [roleFilter, setRoleFilter] = useState('все')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    const raw = localStorage.getItem(RESUME_KEY)
    if (raw) {
      try {
        setResume(JSON.parse(raw))
      } catch {
        /* ignore corrupt entry */
      }
    }
  }, [])

  const roles = useMemo(() => {
    const present = new Set(vacancies.map((v) => v.role))
    return ['все', ...ROLE_ORDER.filter((r) => present.has(r))]
  }, [])

  const shown = roleFilter === 'все' ? vacancies : vacancies.filter((v) => v.role === roleFilter)

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < MAX_SELECTED) {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl text-neutral-900" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
          Подбор
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Выбери резюме и до {MAX_SELECTED} вакансий — дальше генерация таргетных резюме (пока не реализована).
        </p>

        {/* Фильтры */}
        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-neutral-200 bg-white/60 p-4">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                roleFilter === r
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Резюме */}
          <aside className="space-y-3">
            <h2
              className="text-xs font-semibold tracking-wide text-neutral-400 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Резюме
            </h2>
            {resume ? (
              <div className="rounded-xl border border-neutral-900 bg-white/60 p-4">
                <p className="truncate text-sm font-medium text-neutral-900">{resume.name}</p>
                <p className="mt-0.5 text-xs text-neutral-500">загружено {resume.uploadedAt}</p>
              </div>
            ) : (
              <Link
                to="/pipeline"
                className="block rounded-xl border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 transition hover:border-neutral-400"
              >
                Резюме не загружено — загрузить в кабинете →
              </Link>
            )}
          </aside>

          {/* Вакансии */}
          <main>
            <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white/60 px-4">
              {shown.map((v, i) => (
                <VacancyRow key={v.id} v={v} i={i} selected={selected.has(v.id)} onToggle={toggle} />
              ))}
            </ul>
          </main>
        </div>
      </div>

      {/* Плашка выбора */}
      <div className="sticky bottom-0 border-t border-neutral-200 bg-[#F1F1EB]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span
            className="text-sm text-neutral-600"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {selected.size}/{MAX_SELECTED} выбрано
          </span>
          <button
            disabled
            className="cursor-not-allowed rounded-full bg-neutral-300 px-5 py-2 text-sm font-medium text-neutral-500"
          >
            Сгенерировать резюме — скоро
          </button>
        </div>
      </div>
    </div>
  )
}
