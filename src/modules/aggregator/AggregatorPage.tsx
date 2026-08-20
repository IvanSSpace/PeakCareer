import { PlanBanner } from '../../components/DocBlocks'
import VacancyFeed from './VacancyFeed'

export default function AggregatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <PlanBanner to="/aggregator-plan" kind="to-plan" />
      <h1 className="text-3xl font-semibold text-neutral-900">Агрегатор вакансий</h1>
      <p className="mt-3 text-neutral-500">21 реальная вакансия из живого скрапа. Работает уже сейчас.</p>

      <VacancyFeed />
    </div>
  )
}
