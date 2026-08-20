import { PlanBanner } from '../../components/DocBlocks'

export default function LearningPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <PlanBanner to="/learning-plan" kind="to-plan" />
      <h1 className="text-3xl font-semibold text-neutral-900">Обучение</h1>
      <p className="mt-3 text-neutral-500">Пока ничего не реализовано — только подборка ссылок в плане.</p>
    </div>
  )
}
