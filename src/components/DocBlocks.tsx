import { Link } from 'react-router-dom'

export function PlanBanner({ to, kind }: { to: string; kind: 'to-plan' | 'to-real' }) {
  return (
    <Link
      to={to}
      className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900"
    >
      {kind === 'to-plan' ? 'план и архитектура →' : '← к реализованному блоку'}
    </Link>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-neutral-200 pt-8 text-left">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="mt-3 space-y-3 text-neutral-600">{children}</div>
    </section>
  )
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700">
        {n}
      </span>
      <div>
        <p className="font-medium text-neutral-900">{title}</p>
        <p className="text-neutral-600">{children}</p>
      </div>
    </li>
  )
}

export function LinkItem({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
      >
        {label}
      </a>
    </li>
  )
}
