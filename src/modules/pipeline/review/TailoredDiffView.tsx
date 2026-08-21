import type { Segment, TailoredResume } from '../../../api'

type Props = {
  resume: TailoredResume
  mode: 'tailored' | 'original'
}

function visible(segs: Segment[], mode: 'tailored' | 'original'): Segment[] {
  return mode === 'tailored' ? segs : segs.filter((s) => s.kind !== 'added')
}

function segClass(kind: Segment['kind'], mode: 'tailored' | 'original'): string | undefined {
  if (mode === 'original') return undefined // ориг-режим — как выглядело до тейлоринга, без цвета
  if (kind === 'added') return 'rounded bg-emerald-100 px-0.5 text-emerald-900'
  if (kind === 'removed') return 'rounded bg-red-100 px-0.5 text-red-700 line-through decoration-red-400'
  return undefined
}

export default function TailoredDiffView({ resume, mode }: Props) {
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
          {visible(resume.summary, mode).map((seg, i) => (
            <span key={i} className={segClass(seg.kind, mode)}>
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
            const segs = visible(line, mode)
            if (segs.length === 0) return null
            return (
              <li key={i}>
                {segs.map((seg, j) => (
                  <span key={j} className={segClass(seg.kind, mode)}>
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
          {visible(resume.skills, mode).map((seg, i) => {
            const tint =
              mode === 'tailored' && seg.kind === 'added'
                ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
                : mode === 'tailored' && seg.kind === 'removed'
                  ? 'border-red-200 bg-red-100 text-red-700 line-through decoration-red-400'
                  : 'border-neutral-200 text-neutral-600'
            return (
              <span
                key={i}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                className={`rounded-full border px-3 py-1 text-xs ${tint}`}
              >
                {seg.text}
              </span>
            )
          })}
        </div>
      </section>
    </div>
  )
}
