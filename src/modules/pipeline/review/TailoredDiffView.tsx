import type { Segment, TailoredResume } from './mockTailoring'

type Props = {
  resume: TailoredResume
  mode: 'tailored' | 'original'
}

export default function TailoredDiffView({ resume, mode }: Props) {
  const visible = (segs: Segment[]) => (mode === 'tailored' ? segs : segs.filter((s) => !s.added))

  return (
    <div className="space-y-6 text-sm leading-relaxed text-neutral-800">
      <section>
        <h3
          className="text-xs font-semibold tracking-wide text-neutral-400 uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          О себе
        </h3>
        <p className="mt-2">
          {visible(resume.summary).map((seg, i) => (
            <span key={i} className={seg.added ? 'rounded bg-emerald-100 px-0.5 text-emerald-900' : undefined}>
              {seg.text}
            </span>
          ))}
        </p>
      </section>

      <section>
        <h3
          className="text-xs font-semibold tracking-wide text-neutral-400 uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Опыт
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {resume.experience.map((line, i) => {
            const segs = visible(line)
            if (segs.length === 0) return null
            return (
              <li key={i}>
                {segs.map((seg, j) => (
                  <span key={j} className={seg.added ? 'rounded bg-emerald-100 px-0.5 text-emerald-900' : undefined}>
                    {seg.text}
                  </span>
                ))}
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h3
          className="text-xs font-semibold tracking-wide text-neutral-400 uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Навыки
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {visible(resume.skills).map((seg, i) => (
            <span
              key={i}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className={`rounded-full border px-3 py-1 text-xs ${
                seg.added ? 'border-emerald-300 bg-emerald-100 text-emerald-900' : 'border-neutral-200 text-neutral-600'
              }`}
            >
              {seg.text}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
