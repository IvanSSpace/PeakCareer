import { formatSalary, type Vacancy } from './vacancy'

export default function VacancyRow({
  v,
  i,
  selected,
  onToggle,
}: {
  v: Vacancy
  i: number
  selected?: boolean
  onToggle?: (id: string) => void
}) {
  return (
    <li
      onClick={onToggle ? () => onToggle(v.id) : undefined}
      className={`group fade-in-row py-5 ${onToggle ? 'cursor-pointer rounded-lg px-3 -mx-3 transition hover:bg-neutral-50' : ''}`}
      style={{ animationDelay: `${i * 30}ms` }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          {onToggle && (
            <input
              type="checkbox"
              checked={!!selected}
              readOnly
              className="pointer-events-none mt-1.5 h-4 w-4 shrink-0 accent-neutral-900"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-neutral-900">{v.title}</h3>
              {v.remote && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  remote
                </span>
              )}
              {v.language && (
                <span
                  className="rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {v.language}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-neutral-500">
              {v.company}
              {v.location ? ` · ${v.location}` : ''}
            </p>
            {v.stack && v.stack.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-neutral-400 underline decoration-neutral-300 underline-offset-2 opacity-0 transition group-hover:opacity-100 hover:text-neutral-900 hover:decoration-neutral-900"
          >
            {v.source_channel} →
          </a>
        </div>
      </div>
    </li>
  )
}
