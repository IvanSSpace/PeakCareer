import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-neutral-900">
          PeakCareer
        </Link>
        <Link
          to="/pipeline"
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
        >
          Профиль
        </Link>
      </div>
    </header>
  )
}
