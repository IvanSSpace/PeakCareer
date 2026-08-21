import type { Vacancy } from '../../aggregator/vacancy'

export type Segment = { text: string; added: boolean }

export type TailoredResume = {
  summary: Segment[]
  experience: Segment[][]
  skills: Segment[]
}

const BASE_SUMMARY = 'Backend-разработчик с 4 годами опыта: проектирование API, оптимизация БД, CI/CD.'

const BASE_EXPERIENCE = [
  'Спроектировал и внедрил REST API для платёжного сервиса, снизил время ответа на 30%.',
  'Настроил CI/CD пайплайн на GitHub Actions, сократил время деплоя с 40 до 8 минут.',
  'Провёл миграцию монолита на микросервисы, разбил на 6 независимых сервисов.',
]

const BASE_SKILLS = ['Python', 'PostgreSQL', 'Docker', 'Git']

export function getOriginalResume(): TailoredResume {
  return {
    summary: [{ text: BASE_SUMMARY, added: false }],
    experience: BASE_EXPERIENCE.map((line) => [{ text: line, added: false }]),
    skills: BASE_SKILLS.map((s) => ({ text: s, added: false })),
  }
}

export function getMockTailoredResume(vacancy: Vacancy): TailoredResume {
  const stack = (vacancy.stack ?? []).slice(0, 3)
  const newSkills = stack.filter((s) => !BASE_SKILLS.includes(s))

  return {
    summary: [
      { text: BASE_SUMMARY, added: false },
      ...(stack.length
        ? [{ text: ` Есть опыт с ${stack.join(', ')} — под стек вакансии «${vacancy.title}».`, added: true as const }]
        : []),
    ],
    experience: [
      ...BASE_EXPERIENCE.map((line) => [{ text: line, added: false }]),
      ...(stack.length
        ? [[{ text: `Использовал ${stack.join(', ')} в проде — под требования вакансии.`, added: true as const }]]
        : []),
    ],
    skills: [...BASE_SKILLS.map((s) => ({ text: s, added: false })), ...newSkills.map((s) => ({ text: s, added: true as const }))],
  }
}
