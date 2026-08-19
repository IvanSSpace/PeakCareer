import { Section } from '../../components/DocBlocks'

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold text-neutral-900">Рабочий сетап</h1>
      <p className="mt-3 text-neutral-500">
        Не только инструменты — как именно я разрабатываю. Личный воркфлоу, чтобы будущие
        смотрящие курс могли перенять опыт.
      </p>

      <Section title="Окружение">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-neutral-900">Отдельный Space Work на проект</span> —
            изолированное пространство под каждый проект. Позволяет менеджерить много проектов
            параллельно и удобно управлять подписками.
          </li>
          <li>
            <span className="font-medium text-neutral-900">ARC / Dia — отдельный space на каждую работу</span> —
            изолирует проекты друг от друга внутри браузера, быстрое переключение, особенно когда
            проектов несколько одновременно.
          </li>
          <li>
            <span className="font-medium text-neutral-900">Утилита выбора браузера для ссылки</span> —
            при открытии ссылки — выбор, в каком именно браузере её открыть.
          </li>
        </ul>
      </Section>

      <Section title="Методы работы с Claude Code / LLM">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-neutral-900">Менеджмент контекста</span> — вовремя
            сжимать/чистить контекст сессии, чтобы длинная работа не теряла фокус.
          </li>
          <li>
            <span className="font-medium text-neutral-900"><code className="rounded bg-neutral-100 px-1">/goal</code></span> —
            когда задачу нужно докрутить автономно до конкретного условия, без постоянного участия.
          </li>
          <li>
            <span className="font-medium text-neutral-900">Переключение режимов Claude</span> —
            например режим без постоянных подтверждений на каждое действие — под задачу, где это
            уместно.
          </li>
        </ul>
      </Section>
    </div>
  )
}
