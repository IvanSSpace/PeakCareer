import { Section, LinkItem } from '../../components/DocBlocks'

export default function LearningPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold text-neutral-900">Обучение</h1>
      <p className="mt-3 text-neutral-500">
        Навык самообучения критичен в профессии — особенно сейчас, когда часть кода пишет ИИ.
        Первое направление: front, back, full stack.
      </p>

      <Section title="Формат (видение, не MVP)">
        <p>
          Полноценный аналог Hexlet — урок (теория) + квиз + практическое задание, которое
          выполняется/проверяется на машине проходящего курс. Приоритет сейчас — модуль
          «Агрегатор вакансий», к этому возвращаемся после.
        </p>
        <p className="font-medium text-neutral-900">Открытый вопрос — как запускать практику:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            CLI-тул (как у Hexlet/exercism) — юзер ставит npm/pip пакет, клонирует репо задания,
            пишет код локально, гоняет тесты, CLI шлёт статус на бэкенд.
          </li>
          <li>Голый репо с тестами — юзер сам гоняет `npm test`, без прогресс-трекинга.</li>
          <li>
            In-browser раннер (WebContainer/StackBlitz-подход) — код исполняется в браузере, без
            докер-песочниц на сервере.
          </li>
        </ul>
      </Section>

      <Section title="Трек 1 — Skill-refresh (front/back/fullstack)">
        <ul className="list-disc space-y-1 pl-5">
          <li>Основы, которые не устаревают — system design, дебаг, security-мышление, чтение чужого кода.</li>
          <li>Frontend-рефреш — React Server Components, Server Actions, современный строгий TypeScript.</li>
          <li>Backend/инфра-рефреш — edge runtime, типобезопасные ORM (Prisma), DevOps-минимум.</li>
          <li>AI-tooling в самом стеке — Copilot/Cursor/LLM API как часть работы, не опция.</li>
          <li>Карьерный трек — roadmap.sh как справочный каркас входа/повторения.</li>
        </ul>
        <ul className="list-disc space-y-1 pl-5">
          <LinkItem href="https://roadmap.sh/full-stack" label="roadmap.sh — Full Stack Developer Roadmap" />
          <LinkItem
            href="https://www.theodinproject.com/paths/full-stack-javascript"
            label="The Odin Project — Full Stack JavaScript (фундамент, без TS/RSC/деплоя)"
          />
        </ul>
      </Section>

      <Section title="Трек 2 — разработка в эпоху ИИ">
        <p>
          Выигрышный паттерн: писать код первым, ИИ использовать для объяснения/дебага/сравнения —
          не наоборот. Security pass rate AI-кода — 56% (Veracode 2026), 44% задач AI-генерации
          вносят уязвимость.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <LinkItem
            href="https://github.com/EthicalML/awesome-agentic-engineering-resources"
            label="awesome-agentic-engineering-resources"
          />
          <LinkItem
            href="https://github.com/ai-for-developers/awesome-ai-coding-tools"
            label="awesome-ai-coding-tools"
          />
          <LinkItem href="https://www.veracode.com/blog/2026-genai-code-security-report-ai-risk/" label="Veracode 2026 GenAI Code Security Report" />
        </ul>
      </Section>

      <Section title="Трек 3 — System Design">
        <p>
          Отдельный skill track, не роль целиком: распределённые системы, масштабирование,
          БД/кэши/LB/CDN/очереди, архитектурные trade-offs. Актуален и растёт спрос на роли
          Architect/Staff+ на международном рынке (см. модуль «Агрегатор»).
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <LinkItem href="https://roadmap.sh/system-design" label="roadmap.sh — System Design (дерево навыков)" />
          <LinkItem
            href="https://github.com/donnemartin/system-design-primer"
            label="donnemartin/system-design-primer — 352k★, curriculum + интервью-кейсы + Anki-флешкарты"
          />
        </ul>
      </Section>
    </div>
  )
}
