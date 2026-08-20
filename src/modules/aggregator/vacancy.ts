import vacanciesRaw from './vacancies.sample.json'

export type Vacancy = {
  id: string
  url: string
  source_channel: string
  title: string
  company: string
  salary_min: number | null
  salary_max: number | null
  currency: 'RUB' | 'USD' | 'EUR' | null
  location: string | null
  remote: boolean
  category: string
  stack: string[] | null
  apply_via: string
  role: string
  language: string | null
}

export const vacancies = vacanciesRaw as Vacancy[]

export const ROLE_ORDER = ['DevOps', 'Architect', 'Fullstack', 'Frontend', 'Backend', 'Mobile', 'Data', 'QA']

const CURRENCY_SYMBOL: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€' }

export function formatSalary(v: Vacancy): string {
  if (v.salary_min == null && v.salary_max == null) return '— не указана —'
  const sym = v.currency ? CURRENCY_SYMBOL[v.currency] ?? v.currency : ''
  const fmt = (n: number) => n.toLocaleString('ru-RU')
  if (v.salary_min != null && v.salary_max != null) {
    return `${fmt(v.salary_min)}–${fmt(v.salary_max)} ${sym}`
  }
  const only = v.salary_min ?? v.salary_max!
  return `от ${fmt(only)} ${sym}`
}
