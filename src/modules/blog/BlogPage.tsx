import { entries } from './entries'

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold text-neutral-900">Блог</h1>
      <p className="mt-3 text-neutral-500">
        Версии и обновления PeakCareer по мере того, как что-то реально выходит.
      </p>

      <ol className="mt-10 space-y-8 border-t border-neutral-200 pt-8 text-left">
        {entries.map((e, i) => (
          <li key={i} className="flex gap-4">
            <div className="w-24 shrink-0 pt-0.5">
              <time className="text-xs text-neutral-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {e.date}
              </time>
              {e.version && (
                <div
                  className="mt-1 inline-block rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {e.version}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-medium text-neutral-900">{e.title}</h2>
              <p className="mt-1 text-sm text-neutral-600">{e.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
