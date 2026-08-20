import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-neutral-200 bg-[#F1F1EB]">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
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
