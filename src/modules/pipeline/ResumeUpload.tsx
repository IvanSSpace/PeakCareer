import { useEffect, useRef, useState } from 'react'
import { loadResumes, saveResumes, type StoredResume } from './resumeStore'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED = ['.pdf', '.doc', '.docx']

function isAcceptedFile(file: File): boolean {
  const lower = file.name.toLowerCase()
  return ACCEPTED.some((ext) => lower.endsWith(ext))
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} КБ` : `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

function ResumeRow({
  r,
  onRename,
  onRemove,
}: {
  r: StoredResume
  onRename: (id: string, name: string) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(r.name)

  function commit() {
    const trimmed = draft.trim()
    onRename(r.id, trimmed || r.name)
    setEditing(false)
  }

  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white/60 p-4">
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(r.name)
                setEditing(false)
              }
            }}
            className="w-full rounded border border-neutral-300 bg-white px-2 py-0.5 text-sm font-medium text-neutral-900 outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setDraft(r.name)
              setEditing(true)
            }}
            title="Нажми, чтобы переименовать"
            className="truncate text-left text-sm font-medium text-neutral-900 decoration-dotted decoration-neutral-400 underline-offset-2 hover:underline"
          >
            {r.name}
          </button>
        )}
        <p className="mt-0.5 text-xs text-neutral-500">
          {r.fileName} · {formatSize(r.size)} · загружено {r.uploadedAt}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <a
          href={r.dataUrl}
          download={r.fileName}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition hover:border-neutral-400"
        >
          Скачать
        </a>
        <button
          onClick={() => onRemove(r.id)}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-500 transition hover:border-red-300 hover:text-red-600"
        >
          Удалить
        </button>
      </div>
    </li>
  )
}

export default function ResumeUpload() {
  const [resumes, setResumes] = useState<StoredResume[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setResumes(loadResumes())
  }, [])

  function commit(next: StoredResume[]) {
    saveResumes(next)
    setResumes(next)
  }

  function handleFile(file: File) {
    setError(null)
    if (!isAcceptedFile(file)) {
      setError('Только PDF или DOCX.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Файл больше 5 МБ — слишком большой для локального хранения браузера.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const entry: StoredResume = {
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^.]+$/, ''),
        fileName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString().slice(0, 10),
        dataUrl: reader.result as string,
      }
      commit([entry, ...resumes])
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="mt-10 text-left">
      <h2 className="text-2xl text-neutral-900" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
        Резюме
      </h2>

      {resumes.length > 0 && (
        <ul className="mt-4 space-y-3">
          {resumes.map((r) => (
            <ResumeRow
              key={r.id}
              r={r}
              onRename={(id, name) => commit(resumes.map((x) => (x.id === id ? { ...x, name } : x)))}
              onRemove={(id) => commit(resumes.filter((x) => x.id !== id))}
            />
          ))}
        </ul>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-4 cursor-pointer rounded-xl border-2 border-dashed text-center transition ${
          resumes.length > 0 ? 'p-5' : 'p-10'
        } ${dragOver ? 'border-neutral-400 bg-white/60' : 'border-neutral-300 hover:border-neutral-400'}`}
      >
        <p className="text-neutral-600">
          {resumes.length > 0 ? 'Добавить ещё резюме' : 'Перетащи файл сюда или нажми, чтобы выбрать'}
        </p>
        <p className="mt-1 text-xs text-neutral-400">PDF или DOCX, до 5 МБ</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <p className="mt-3 text-xs text-neutral-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Хранится локально в браузере (localStorage) — бэкенда ещё нет, парсинг в профиль будет позже.
      </p>
    </section>
  )
}
