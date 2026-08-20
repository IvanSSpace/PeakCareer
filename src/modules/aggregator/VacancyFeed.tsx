import { useMemo, useState } from 'react'
import { vacancies, ROLE_ORDER } from './vacancy'
import VacancyRow from './VacancyRow'

export default function VacancyFeed() {
  const roles = useMemo(() => {
    const present = new Set(vacancies.map((v) => v.role))
    return ['все', ...ROLE_ORDER.filter((r) => present.has(r))]
  }, [])
  const [active, setActive] = useState('все')

  const grouped = useMemo(() => {
    const pool = active === 'все' ? vacancies : vacancies.filter((v) => v.role === active)
    const byRole = new Map<string, typeof vacancies>()
    for (const v of pool) {
      if (!byRole.has(v.role)) byRole.set(v.role, [])
      byRole.get(v.role)!.push(v)
    }
    return ROLE_ORDER.filter((r) => byRole.has(r)).map((r) => [r, byRole.get(r)!] as const)
  }, [active])

  return (
    <section className="mt-10 text-left">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-neutral-200 pb-4">
        <h2 className="text-2xl text-neutral-900" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
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
          60 постов · 21 вакансия · 3 канала + Djinni
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setActive(r)}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              active === r
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {grouped.map(([role, items]) => (
        <div key={role} className="mt-8 first:mt-4">
          <h3
            className="text-xs font-semibold tracking-wide text-neutral-400 uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {role} · {items.length}
          </h3>
          <ul className="mt-2 divide-y divide-neutral-200 border-y border-neutral-200">
            {items.map((v, i) => (
              <VacancyRow key={v.id} v={v} i={i} />
            ))}
          </ul>
        </div>
      ))}

      <p className="mt-3 text-xs text-neutral-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        источник: data/vacancies.json — снапшот реального скрапа, обновляется вручную на этой стадии
      </p>
    </section>
  )
}
