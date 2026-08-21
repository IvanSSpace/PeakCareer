import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { vacancies, formatSalary } from '../../aggregator/vacancy'
import { loadResumes } from '../resumeStore'
import { getMockTailoredResume, getOriginalResume } from './mockTailoring'
import TailoredDiffView from './TailoredDiffView'
import type { ReviewState } from './ReviewGalleryPage'

export default function ApproveViewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { index } = useParams()
  const state = (location.state as ReviewState | null) ?? null
  const idx = Number(index)

  const [mode, setMode] = useState<'tailored' | 'original'>('tailored')

  const vacancy = useMemo(() => {
    if (!state || Number.isNaN(idx)) return null
    return vacancies.find((v) => v.id === state.vacancyIds[idx]) ?? null
  }, [state, idx])

  const resumeName = useMemo(() => {
    if (!state) return ''
    return loadResumes().find((r) => r.id === state.resumeId)?.name ?? 'Резюме'
  }, [state])

  if (!state || !vacancy) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-neutral-500">Нет данных.</p>
        <Link to="/select" className="mt-3 inline-block text-sm text-neutral-900 underline underline-offset-2">
          вернуться к выбору →
        </Link>
      </div>
    )
  }

  const resume = mode === 'tailored' ? getMockTailoredResume(vacancy) : getOriginalResume()
  const total = state.vacancyIds.length
  const goto = (next: number) => navigate(`/pipeline/review/${((next % total) + total) % total}`, { state })

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <Link to="/pipeline/review" state={state} className="text-sm text-neutral-400 hover:text-neutral-900">
          ← галерея · {resumeName}
        </Link>
        <span
          className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          мок — реальной генерации ещё нет
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          onClick={() => goto(idx - 1)}
          aria-label="предыдущее"
          className="rounded-full border border-neutral-200 px-3 py-2 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900"
        >
          ←
        </button>
        <div className="text-center">
          <p className="text-xs text-neutral-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {idx + 1} / {total}
          </p>
          <h1 className="text-xl font-medium text-neutral-900">{vacancy.title}</h1>
          <p className="text-sm text-neutral-500">
            {vacancy.company} · {formatSalary(vacancy)}
          </p>
        </div>
        <button
          onClick={() => goto(idx + 1)}
          aria-label="следующее"
          className="rounded-full border border-neutral-200 px-3 py-2 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900"
        >
          →
        </button>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => setMode('tailored')}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            mode === 'tailored' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
          }`}
        >
          тейлоренное
        </button>
        <button
          onClick={() => setMode('original')}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            mode === 'original' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
          }`}
        >
          оригинал
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white/60 p-6">
        <TailoredDiffView resume={resume} mode={mode} />
      </div>
    </div>
  )
}
