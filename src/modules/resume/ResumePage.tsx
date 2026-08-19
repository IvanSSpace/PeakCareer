import { Section, LinkItem, Step } from '../../components/DocBlocks'

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold text-neutral-900">Редактор резюме</h1>
      <p className="mt-3 text-neutral-500">Адаптирует резюме под конкретную вакансию.</p>

      <Section title="Путь пользователя">
        <ol className="space-y-4">
          <Step n={1} title="Профиль — один раз">
            Глубокое структурированное интервью → career_profile.md. Не резюме, а честный
            long-form источник правды: весь опыт, метрики, проекты. Делается один раз, дальше
            каждое резюме тянется из него.
          </Step>
          <Step n={2} title="Загрузка текущего резюме (открытый вопрос)">
            Что делать, если у человека уже есть готовое резюме, а не только пустой профиль? Он
            загружает файл (PDF/DOCX) → парсинг → распаковка в career_profile.md, чтобы не
            заполнять интервью с нуля. Resume-Matcher уже решает эту задачу — смотреть их подход к
            парсингу при реализации.
          </Step>
          <Step n={3} title="Вакансия → анализ">
            Вставляешь JD (из агрегатора или вручную) → match score, разрыв между профилем и
            требованиями, стратегия отклика.
          </Step>
          <Step n={4} title="Драфт под вакансию">
            Резюме собирается из профиля, таргетится под конкретный JD — не с нуля, а выборка и
            переформулировка нужных кусков.
          </Step>
          <Step n={5} title="Усиление буллетов">
            Слабые формулировки → достижения с метриками и impact. Если точных цифр нет —
            помогает их оценить честно, не выдумывая.
          </Step>
          <Step n={6} title="ATS-проход">
            Проверка на совпадение ключевых слов с требованиями вакансии — почему резюме может не
            пройти автоматический скрининг, и что поправить.
          </Step>
          <Step n={7} title="Форматирование и рендер">
            Чистый, scannable layout → .docx/.pdf.
          </Step>
          <Step n={8} title="Версии">
            Трекинг: какое резюме под какую вакансию ушло, мастер-версия отдельно от таргетных.
          </Step>
        </ol>
      </Section>

      <Section title="Референс — готовый пайплайн, уже описан как Claude Code skills">
        <p>
          Локально уже есть набор skills, которые реализуют ровно эти шаги — не как часть продукта
          напрямую (это CLI-инструменты Claude Code, не веб-бэкенд), а как проверенная логика/промпты,
          которые можно взять за основу при написании LLM-пайплайна модуля:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li><code className="rounded bg-neutral-100 px-1">career-profile-builder</code> — глубокое интервью → career_profile.md.</li>
          <li><code className="rounded bg-neutral-100 px-1">job-description-analyzer</code> — match score, gaps, стратегия по JD.</li>
          <li><code className="rounded bg-neutral-100 px-1">resume-tailor-profile</code> — оркестрирует весь путь: анализ JD → gap scorecard → драфт → ATS-пасс → рендер в .docx/.pdf.</li>
          <li><code className="rounded bg-neutral-100 px-1">resume-bullet-writer</code> + <code className="rounded bg-neutral-100 px-1">resume-quantifier</code> — усиление формулировок и метрик.</li>
          <li><code className="rounded bg-neutral-100 px-1">resume-ats-optimizer</code> — ATS-совместимость и keyword-match.</li>
          <li><code className="rounded bg-neutral-100 px-1">resume-formatter</code> + <code className="rounded bg-neutral-100 px-1">resume-section-builder</code> — layout и структура секций.</li>
          <li><code className="rounded bg-neutral-100 px-1">resume-version-manager</code> — трекинг версий.</li>
        </ul>
        <p className="font-medium text-neutral-900">Естественное расширение позже:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><code className="rounded bg-neutral-100 px-1">cover-letter-generator</code> — сопроводительное письмо из резюме + JD.</li>
          <li><code className="rounded bg-neutral-100 px-1">interview-prep-generator</code> — STAR-истории и вопросы под вакансию.</li>
        </ul>
      </Section>

      <Section title="Кандидат на реюз кода">
        <p>
          Из внешнего ресёрча — сильный кандидат на форк/реюз вместо билда с нуля, стек почти
          идентичен нашему (React+TS+Tailwind фронт):
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <LinkItem href="https://github.com/srbhr/Resume-Matcher" label="srbhr/Resume-Matcher — 28.1k★, живой, Next.js+React+TS+Tailwind + FastAPI, мульти-LLM" />
        </ul>
      </Section>
    </div>
  )
}
