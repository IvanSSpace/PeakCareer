import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { vacancies, ROLE_ORDER } from '../aggregator/vacancy'
import VacancyRow from '../aggregator/VacancyRow'
import { loadResumes, type StoredResume } from '../pipeline/resumeStore'

const MAX_SELECTED = 10

export default function SelectPage() {
  const [resumes, setResumes] = useState<StoredResume[]>([])
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState('все')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loaded = loadResumes()
    setResumes(loaded)
    setActiveResumeId(loaded[0]?.id ?? null)
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
      {/* Фильтры — липкие, сразу под шапкой */}
      <div className="sticky top-16 z-20 border-b border-neutral-200 bg-[#F1F1EB]">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 py-3">
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
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-6 pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Резюме */}
          <aside className="sticky top-[116px] h-fit space-y-3">
            <h2
              className="text-xs font-semibold tracking-wide text-neutral-400 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Резюме
            </h2>
            {resumes.length > 0 ? (
              <>
                {resumes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveResumeId(r.id)}
                    className={`block w-full rounded-xl border p-4 text-left transition ${
                      activeResumeId === r.id
                        ? 'border-neutral-900 bg-white/60'
                        : 'border-neutral-200 bg-white/30 hover:border-neutral-400'
                    }`}
                  >
                    <p className="truncate text-sm font-medium text-neutral-900">{r.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">загружено {r.uploadedAt}</p>
                  </button>
                ))}
                <Link
                  to="/pipeline"
                  className="block text-center text-xs text-neutral-400 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900 hover:decoration-neutral-900"
                >
                  управлять резюме →
                </Link>
              </>
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

      {/* Прогресс выбора */}
      <div className="sticky bottom-0 z-20 border-t border-neutral-200 bg-[#F1F1EB]">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <div className="w-48 shrink-0">
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all"
                style={{ width: `${(selected.size / MAX_SELECTED) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {selected.size} из {MAX_SELECTED}
            </p>
          </div>
          <div className="flex-1" />
          <button
            disabled
            className="shrink-0 cursor-not-allowed rounded-full bg-neutral-300 px-5 py-2 text-sm font-medium text-neutral-500"
          >
            Сгенерировать резюме — скоро
          </button>
        </div>
      </div>
    </div>
  )
}
