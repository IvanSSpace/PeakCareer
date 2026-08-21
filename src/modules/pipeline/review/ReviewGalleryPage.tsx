import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { vacancies } from '../../aggregator/vacancy'
import { loadResumes } from '../resumeStore'
import { getApplication, type ApplicationStatus } from '../../../api'

export type ReviewItem = { vacancyId: string; applicationId: string }
export type ReviewState = { resumeId: string; items: ReviewItem[] }

const POLL_INTERVAL_MS = 1500

export default function ReviewGalleryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as ReviewState | null) ?? null

  const [statuses, setStatuses] = useState<Record<string, ApplicationStatus>>({})

  const rows = useMemo(() => {
    if (!state) return []
    return state.items
      .map((item) => ({ item, vacancy: vacancies.find((v) => v.id === item.vacancyId) }))
      .filter((row): row is { item: ReviewItem; vacancy: NonNullable<typeof row.vacancy> } => Boolean(row.vacancy))
  }, [state])

  const resumeName = useMemo(() => {
    if (!state) return ''
    return loadResumes().find((r) => r.id === state.resumeId)?.name ?? 'Резюме'
  }, [state])

  useEffect(() => {
    if (!state || state.items.length === 0) return
    let cancelled = false

    async function poll() {
      const entries = await Promise.all(
        state!.items.map(async (item) => {
          try {
            const app = await getApplication(item.applicationId)
            return [item.applicationId, app.status] as const
          } catch {
            return [item.applicationId, 'generating'] as const
          }
        }),
      )
      if (!cancelled) setStatuses(Object.fromEntries(entries))
    }

    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [state])

  if (!state || rows.length === 0) {
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

      <ul className="mt-6 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white/60 px-4">
        {rows.map(({ item, vacancy }, i) => {
          const status = statuses[item.applicationId]
          const ready = status === 'ready'
          return (
            <li key={item.applicationId} className="fade-in-row py-4" style={{ animationDelay: `${i * 40}ms` }}>
              <button
                disabled={!ready}
                onClick={() => navigate(`/pipeline/review/${i}`, { state })}
                className={`flex w-full items-center justify-between gap-4 text-left ${ready ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-neutral-900">{vacancy.title}</p>
                  <p className="text-sm text-neutral-500">{vacancy.company}</p>
                </div>
                <span
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    ready ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {ready ? 'готово' : status === 'draft' ? 'в очереди…' : 'генерируется…'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
