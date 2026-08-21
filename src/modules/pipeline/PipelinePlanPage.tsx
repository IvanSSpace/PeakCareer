import { Section, LinkItem, Step, PlanBanner } from '../../components/DocBlocks'

export default function PipelinePlanPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <PlanBanner to="/pipeline" kind="to-real" />
      <h1 className="text-3xl font-semibold text-neutral-900">Пайплайн — архитектура</h1>
      <p className="mt-3 text-neutral-500">
        Как модули соединяются в один сквозной поток и архитектура кабинета.
      </p>

      <Section title="Сквозной поток">
        <ol className="space-y-4">
          <Step n={1} title="Вакансия появляется в агрегаторе">
            Из Telegram/Himalayas/Djinni, уже с извлечёнными полями (компания, стек, зарплата,
            локация, remote).
          </Step>
          <Step n={2} title="Юзер отмечает вакансии для автоотклика">
            Мультиселект — можно отметить сразу несколько вакансий за один проход по ленте.
          </Step>
          <Step n={3} title="CV + сопроводительное — на каждую отмеченную">
            Для каждой вакансии в очереди: резюме тянется из career_profile.md и таргетится под
            эту вакансию, плюс генерируется сопроводительное письмо.
          </Step>
          <Step n={4} title="Этап откликов">
            Готовые пары «резюме + сопроводительное» уходят в отклик.
          </Step>
          <Step n={5} title="Точечное обучение по стеку вакансии">
            По тегам технологий из вакансии (то, что заметил при отклике) — модуль обучения
            подсвечивает именно те материалы, которые нужны, чтобы быстро освежить знания перед
            собеседованием.
          </Step>
        </ol>
      </Section>

      <Section title="Данные, которые нужно связать">
        <ul className="list-disc space-y-1 pl-5">
          <li><span className="font-medium text-neutral-900">Вакансия</span> — общая схема из агрегатора: id, источник, компания, стек[], зарплата, локация, remote, url.</li>
          <li><span className="font-medium text-neutral-900">Очередь/отклик</span> — связка юзер ↔ вакансия ↔ статус (отмечена → CV готов → отклик отправлен) ↔ артефакты (id резюме-драфта, id сопроводительного).</li>
          <li><span className="font-medium text-neutral-900">Профиль</span> — career_profile.md, источник правды для генерации CV.</li>
          <li><span className="font-medium text-neutral-900">Теги обучения</span> — контент модуля 3 размечен по технологиям, чтобы матчиться со стеком[] вакансии.</li>
        </ul>
      </Section>

      <Section title="Что это меняет архитектурно">
        <p>
          До этого пайплайна каждый модуль мог быть статичной страницей без бэкенда. Этот поток —
          первая точка, где бэкенд обязателен, не опционален:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Нужен аккаунт/сессия — очередь и статусы откликов принадлежат конкретному юзеру, не эфемерны.</li>
          <li>Нужна БД — артефакты (резюме-драфты, сопроводительные) должны сохраняться, не генерироваться заново при каждом заходе.</li>
          <li>Нужна общая схема вакансии — агрегатор, резюме-модуль и обучение должны говорить на одном формате данных, иначе теги/стек не сматчатся.</li>
        </ul>
        <p className="font-medium text-neutral-900">
          Построено: FastAPI (Python) + SQLite, без хостинга пока — гоняем локально
          (<code className="rounded bg-neutral-100 px-1">backend/</code>). Модели Vacancy/Resume/Application,
          CRUD-роуты, аплоад файлов, 17 тестов зелёные. Фронт подключён: загрузка резюме дублируется
          на бэк, /select создаёт реальные отклики и запускает тейлоринг. Тейлоринг — реальный:
          парсинг PDF/DOCX → структурирование (Haiku) → адаптация под вакансию (Sonnet) → дифф
          (добавленное зелёным, убранное красным) — через headless-вызов <code className="rounded bg-neutral-100 px-1">claude</code> CLI,
          без внешнего LLM API (только подписка Claude Code). Результат можно вручную поправить
          в approve-режиме. PDF-рендер финального резюме — готов (sub-project C): кнопка
          "Скачать PDF" в approve-режиме собирает файл прямо в браузере через{' '}
          <code className="rounded bg-neutral-100 px-1">@react-pdf/renderer</code>, без бэкенда.
        </p>
      </Section>

      <Section title="Отклики — решено: версия A (ручная отметка)">
        <p>
          Три уровня автоматизации обсудили, для старта берём самый простой и безопасный:
          резюме+сопроводительное готовы → откликаешься сам на сайте компании → в кабинете
          вручную ставишь статус «откликнулся».
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li><span className="font-medium text-neutral-900">A — ручная отметка (делаем).</span> Ноль риска, ноль зависимости от формата формы каждого сайта, работает уже в v1.</li>
          <li><span className="font-medium text-neutral-900">B — ассист-драфт (позже).</span> Черновик отклика готовится автоматически (pre-filled email/форма через Playwright), отправляешь сам.</li>
          <li><span className="font-medium text-neutral-900">C — полный автоотклик без человека (никогда).</span> Слишком рискованно: твоё имя и репутация, галлюцинация в LLM-резюме уходит рекрутеру без контроля, плюс большинство джоб-бордов такое банит технически.</li>
        </ul>
      </Section>

      <Section title="Референс">
        <ul className="list-disc space-y-1 pl-5">
          <LinkItem href="https://github.com/srbhr/Resume-Matcher" label="Resume-Matcher — похожий связанный пайплайн (JD → match → tailor → cover letter)" />
        </ul>
      </Section>
    </div>
  )
}
