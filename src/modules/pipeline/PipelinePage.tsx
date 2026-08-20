import { Link } from 'react-router-dom'
import { PlanBanner, Step } from '../../components/DocBlocks'
import CabinetBoard from './CabinetBoard'
import ResumeUpload from './ResumeUpload'

export default function PipelinePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <PlanBanner to="/pipeline-plan" kind="to-plan" />
      <h1 className="text-3xl font-semibold text-neutral-900">Кабинет</h1>
      <p className="mt-3 text-neutral-500">
        Резюме, которыми откликаешься, в одном месте. Статус — ставишь сам, без автоотклика.
      </p>

      <ol className="mt-10 space-y-4 border-t border-neutral-200 pt-8 text-left">
        <Step n={1} title="Загрузи резюме">PDF/DOCX ниже — уже работает. Разбор в профиль — позже, с бэкендом.</Step>
        <Step n={2} title="Выбери вакансии">
          До ~10 за раз, чекбоксами — уже работает на странице{' '}
          <Link to="/select" className="underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900">
            «Подбор»
          </Link>
          .
        </Step>
        <Step n={3} title="Получи 10 таргетных резюме">Генерятся батчем под каждую вакансию — попадают сюда.</Step>
        <Step n={4} title="Откликнись сам, отметь тут">Никакой автоотправки — только ручная отметка статуса.</Step>
      </ol>

      <ResumeUpload />

      <CabinetBoard />
    </div>
  )
}
