import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'peakcareer:resume'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED = ['.pdf', '.doc', '.docx']

type StoredResume = {
  name: string
  size: number
  type: string
  uploadedAt: string
  dataUrl: string
}

function isAcceptedFile(file: File): boolean {
  const lower = file.name.toLowerCase()
  return ACCEPTED.some((ext) => lower.endsWith(ext))
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} КБ` : `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export default function ResumeUpload() {
  const [resume, setResume] = useState<StoredResume | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setResume(JSON.parse(raw))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

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
      const stored: StoredResume = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString().slice(0, 10),
        dataUrl: reader.result as string,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
      setResume(stored)
    }
    reader.readAsDataURL(file)
  }

  function handleRemove() {
    localStorage.removeItem(STORAGE_KEY)
    setResume(null)
  }

  return (
    <section className="mt-10 text-left">
      <h2 className="text-2xl text-neutral-900" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
        Резюме
      </h2>

      {resume ? (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white/60 p-4">
          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-900">{resume.name}</p>
            <p className="text-sm text-neutral-500">
              {formatSize(resume.size)} · загружено {resume.uploadedAt}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a
              href={resume.dataUrl}
              download={resume.name}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 transition hover:border-neutral-400"
            >
              Скачать
            </a>
            <button
              onClick={handleRemove}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-500 transition hover:border-red-300 hover:text-red-600"
            >
              Удалить
            </button>
          </div>
        </div>
      ) : (
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
          className={`mt-4 cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition ${
            dragOver ? 'border-neutral-400 bg-white/60' : 'border-neutral-300 hover:border-neutral-400'
          }`}
        >
          <p className="text-neutral-600">Перетащи файл сюда или нажми, чтобы выбрать</p>
          <p className="mt-1 text-xs text-neutral-400">PDF или DOCX, до 5 МБ</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <p className="mt-3 text-xs text-neutral-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Хранится локально в браузере (localStorage) — бэкенда ещё нет, парсинг в профиль будет позже.
      </p>
    </section>
  )
}
