import type { TailoredResume } from '../../../api'

export type PlainResume = { summary: string; experience: string[]; skills: string[] }

/** Финальный текст резюме — unchanged+added сегменты, без removed (то, что реально сейчас в резюме). */
export function currentPlainText(resume: TailoredResume): PlainResume {
  const keep = (kind: string) => kind !== 'removed'
  return {
    summary: resume.summary
      .filter((s) => keep(s.kind))
      .map((s) => s.text)
      .join(''),
    experience: resume.experience
      .filter((line) => line.length === 0 || keep(line[0].kind))
      .map((line) => line.map((s) => s.text).join('')),
    skills: resume.skills.filter((s) => keep(s.kind)).map((s) => s.text),
  }
}
