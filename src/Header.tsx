import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-neutral-900">
          PeakCareer
        </Link>
      </div>
    </header>
  )
}
