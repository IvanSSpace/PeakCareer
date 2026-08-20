import applicationsRaw from './applications.sample.json'

type Status = 'draft' | 'ready' | 'applied' | 'rejected' | 'offer'

type Application = {
  id: string
  vacancy_title: string
  company: string
  status: Status
  created_at: string
}

const applications = applicationsRaw as Application[]

const STATUS_LABEL: Record<Status, string> = {
  draft: 'Черновик',
  ready: 'Готово',
  applied: 'Откликнулся',
  rejected: 'Отказ',
  offer: 'Оффер',
}

const STATUS_ORDER: Status[] = ['draft', 'ready', 'applied', 'rejected', 'offer']

const STATUS_DOT: Record<Status, string> = {
  draft: 'bg-neutral-300',
  ready: 'bg-amber-400',
  applied: 'bg-blue-400',
  rejected: 'bg-neutral-300',
  offer: 'bg-emerald-500',
}

export default function CabinetBoard() {
  const byStatus = STATUS_ORDER.map((s) => [s, applications.filter((a) => a.status === s)] as const).filter(
    ([, items]) => items.length > 0,
  )

  return (
    <section className="mt-10 text-left">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-neutral-200 pb-4">
        <h2 className="text-2xl text-neutral-900" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
          Доска
        </h2>
        <span
          className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          мок — бэкенда ещё нет
        </span>
      </div>

      {byStatus.map(([status, items]) => (
        <div key={status} className="mt-8 first:mt-4">
          <h3
            className="text-xs font-semibold tracking-wide text-neutral-400 uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {STATUS_LABEL[status]} · {items.length}
          </h3>
          <ul className="mt-2 divide-y divide-neutral-200 border-y border-neutral-200">
            {items.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[a.status]}`} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900">{a.vacancy_title}</p>
                    <p className="text-sm text-neutral-500">{a.company}</p>
                  </div>
                </div>
                <time
                  className="shrink-0 text-xs text-neutral-400"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {a.created_at}
                </time>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="mt-3 text-xs text-neutral-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        источник: applications.sample.json — мок-данные, показывают архитектуру. Реальное
        сохранение статусов — после бэкенда (FastAPI + SQLite).
      </p>
    </section>
  )
}
