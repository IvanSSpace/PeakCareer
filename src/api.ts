export const API_BASE = 'http://localhost:8000'

export type SegmentKind = 'unchanged' | 'added' | 'removed'
export type Segment = { text: string; kind: SegmentKind }
export type TailoredResume = { summary: Segment[]; experience: Segment[][]; skills: Segment[] }

export type ApplicationStatus = 'draft' | 'generating' | 'ready' | 'applied' | 'rejected' | 'offer'

export type BackendApplication = {
  id: string
  vacancy_id: string
  resume_id: string
  status: ApplicationStatus
  tailored_resume_path: string | null
  cover_letter_path: string | null
  created_at: string
  updated_at: string
}

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export async function uploadResumeToBackend(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const data = await unwrap<{ id: string }>(await fetch(`${API_BASE}/resumes/`, { method: 'POST', body: form }))
  return data.id
}

export async function createApplication(vacancyId: string, resumeId: string): Promise<BackendApplication> {
  return unwrap(
    await fetch(`${API_BASE}/applications/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vacancy_id: vacancyId, resume_id: resumeId }),
    }),
  )
}

export async function triggerTailoring(applicationId: string): Promise<BackendApplication> {
  return unwrap(await fetch(`${API_BASE}/applications/${applicationId}/tailor`, { method: 'POST' }))
}

export async function getApplication(applicationId: string): Promise<BackendApplication> {
  return unwrap(await fetch(`${API_BASE}/applications/${applicationId}`))
}

export async function getTailoredResume(applicationId: string): Promise<TailoredResume> {
  return unwrap(await fetch(`${API_BASE}/applications/${applicationId}/tailored`))
}

export async function editTailoredResume(
  applicationId: string,
  payload: { summary: string; experience: string[]; skills: string[] },
): Promise<TailoredResume> {
  return unwrap(
    await fetch(`${API_BASE}/applications/${applicationId}/tailored`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  )
}
