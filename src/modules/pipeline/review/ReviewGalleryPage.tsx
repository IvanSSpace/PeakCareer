import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { vacancies } from '../../aggregator/vacancy'
import { loadResumes } from '../resumeStore'

export type ReviewState = { resumeId: string; vacancyIds: string[] }

type ItemStatus = 'generating' | 'ready'

export default function ReviewGalleryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as ReviewState | null) ?? null

  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({})

  const items = useMemo(() => {
    if (!state) return []
    return state.vacancyIds.map((id) => vacancies.find((v) => v.id === id)).filter((v): v is NonNullable<typeof v> => Boolean(v))
  }, [state])

  const resumeName = useMemo(() => {
    if (!state) return ''
    return loadResumes().find((r) => r.id === state.resumeId)?.name ?? 'Резюме'
  }, [state])

  useEffect(() => {
    if (!state) return
    setStatuses(Object.fromEntries(state.vacancyIds.map((id) => [id, 'generating'])))
    const timers = state.vacancyIds.map((id, i) =>
      setTimeout(() => setStatuses((prev) => ({ ...prev, [id]: 'ready' })), 300 + i * 350),
    )
    return () => timers.forEach(clearTimeout)
  }, [state])

  if (!state || items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-neutral-500">Нет данных для генерации.</p>
        <Link to="/select" className="mt-3 inline-block text-sm text-neutral-900 underline underline-offset-2">
          вернуться к выбору →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs font-semibold tracking-wide text-neutral-400 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {resumeName}
      </p>
      <h1 className="mt-1 text-3xl text-neutral-900" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
        Резюме под вакансии
      </h1>
      <span
        className="mt-3 inline-block rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        мок — реальной генерации ещё нет
      </span>

      <ul className="mt-6 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white/60 px-4">
        {items.map((v, i) => {
          const status = statuses[v.id] ?? 'generating'
          const ready = status === 'ready'
          return (
            <li key={v.id} className="fade-in-row py-4" style={{ animationDelay: `${i * 40}ms` }}>
              <button
                disabled={!ready}
                onClick={() => navigate(`/pipeline/review/${i}`, { state })}
                className={`flex w-full items-center justify-between gap-4 text-left ${ready ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-neutral-900">{v.title}</p>
                  <p className="text-sm text-neutral-500">{v.company}</p>
                </div>
                <span
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    ready ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {ready ? 'готово' : 'генерируется…'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
