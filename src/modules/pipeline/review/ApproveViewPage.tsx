import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { vacancies, formatSalary } from '../../aggregator/vacancy'
import { loadResumes } from '../resumeStore'
import { getTailoredResume, editTailoredResume, type TailoredResume } from '../../../api'
import TailoredDiffView from './TailoredDiffView'
import type { ReviewState } from './ReviewGalleryPage'

function currentPlainText(resume: TailoredResume) {
  const keep = (kind: string) => kind !== 'removed'
  return {
    summary: resume.summary
      .filter((s) => keep(s.kind))
      .map((s) => s.text)
      .join(''),
    experience: resume.experience
      .filter((line) => line.length === 0 || keep(line[0].kind))
      .map((line) => line.map((s) => s.text).join('')),
    skills: resume.skills.filter((s) => keep(s.kind)).map((s) => s.text),
  }
}

export default function ApproveViewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { index } = useParams()
  const state = (location.state as ReviewState | null) ?? null
  const idx = Number(index)

  const [mode, setMode] = useState<'tailored' | 'original'>('tailored')
  const [resume, setResume] = useState<TailoredResume | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ summary: '', experience: '', skills: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const item = state && !Number.isNaN(idx) ? state.items[idx] : null
  const vacancy = useMemo(() => (item ? vacancies.find((v) => v.id === item.vacancyId) ?? null : null), [item])

  const resumeName = useMemo(() => {
    if (!state) return ''
    return loadResumes().find((r) => r.id === state.resumeId)?.name ?? 'Резюме'
  }, [state])

  useEffect(() => {
    if (!item) return
    setResume(null)
    setLoadError(null)
    setEditing(false)
    getTailoredResume(item.applicationId)
      .then(setResume)
      .catch(() => setLoadError('Результат ещё не готов или бэкенд недоступен.'))
  }, [item])

  if (!state || !item || !vacancy) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-neutral-500">Нет данных.</p>
        <Link to="/select" className="mt-3 inline-block text-sm text-neutral-900 underline underline-offset-2">
          вернуться к выбору →
        </Link>
      </div>
    )
  }

  const total = state.items.length
  const goto = (next: number) => navigate(`/pipeline/review/${((next % total) + total) % total}`, { state })

  function startEditing() {
    if (!resume) return
    const plain = currentPlainText(resume)
    setDraft({ summary: plain.summary, experience: plain.experience.join('\n'), skills: plain.skills.join('\n') })
    setSaveError(null)
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await editTailoredResume(item!.applicationId, {
        summary: draft.summary.trim(),
        experience: draft.experience.split('\n').map((s) => s.trim()).filter(Boolean),
        skills: draft.skills.split('\n').map((s) => s.trim()).filter(Boolean),
      })
      setResume(updated)
      setEditing(false)
    } catch {
      setSaveError('Не сохранилось — бэкенд недоступен?')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <Link to="/pipeline/review" state={state} className="text-sm text-neutral-400 hover:text-neutral-900">
          ← галерея · {resumeName}
        </Link>
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

      {!editing && (
        <div className="mt-6 flex items-center justify-center gap-2">
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
          {resume && (
            <button
              onClick={startEditing}
              className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900"
            >
              Редактировать
            </button>
          )}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white/60 p-6">
        {loadError && <p className="text-sm text-red-600">{loadError}</p>}
        {!resume && !loadError && <p className="text-sm text-neutral-400">Загружаю…</p>}

        {resume && !editing && <TailoredDiffView resume={resume} mode={mode} />}

        {resume && editing && (
          <div className="space-y-5 text-left">
            <div>
              <label className="text-xs font-semibold tracking-wide text-neutral-400 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                О себе
              </label>
              <textarea
                value={draft.summary}
                onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-lg border border-neutral-200 p-3 text-sm text-neutral-800 outline-none focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-wide text-neutral-400 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Опыт — по пункту на строку
              </label>
              <textarea
                value={draft.experience}
                onChange={(e) => setDraft((d) => ({ ...d, experience: e.target.value }))}
                rows={6}
                className="mt-2 w-full rounded-lg border border-neutral-200 p-3 text-sm text-neutral-800 outline-none focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-wide text-neutral-400 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Навыки — по одному на строку
              </label>
              <textarea
                value={draft.skills}
                onChange={(e) => setDraft((d) => ({ ...d, skills: e.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-lg border border-neutral-200 p-3 text-sm text-neutral-800 outline-none focus:border-neutral-400"
              />
            </div>

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm text-neutral-500 hover:border-neutral-400"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {saving ? 'Сохраняю…' : 'Сохранить'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
