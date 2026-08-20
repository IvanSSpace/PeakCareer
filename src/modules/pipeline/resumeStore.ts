export type StoredResume = {
  id: string
  name: string // editable display name
  fileName: string // original file name
  size: number
  type: string
  uploadedAt: string
  dataUrl: string
}

const KEY = 'peakcareer:resumes'
const LEGACY_KEY = 'peakcareer:resume' // pre-multi-resume single object

function migrateLegacy(): StoredResume[] {
  const raw = localStorage.getItem(LEGACY_KEY)
  if (!raw) return []
  try {
    const old = JSON.parse(raw)
    const migrated: StoredResume[] = [
      {
        id: crypto.randomUUID(),
        name: (old.name as string).replace(/\.[^.]+$/, ''),
        fileName: old.name,
        size: old.size,
        type: old.type,
        uploadedAt: old.uploadedAt,
        dataUrl: old.dataUrl,
      },
    ]
    localStorage.setItem(KEY, JSON.stringify(migrated))
    localStorage.removeItem(LEGACY_KEY)
    return migrated
  } catch {
    localStorage.removeItem(LEGACY_KEY)
    return []
  }
}

export function loadResumes(): StoredResume[] {
  const raw = localStorage.getItem(KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
  return migrateLegacy()
}

export function saveResumes(resumes: StoredResume[]): void {
  localStorage.setItem(KEY, JSON.stringify(resumes))
}
