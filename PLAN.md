# План развития `docs-skills` v2 — каталог Docsbook automation skills

> Этот документ заменяет все предыдущие версии плана.
>
> **Контекст:** `docs-skills` — это уже опубликованный npm-пакет (v1.1.2) с 19 SKILL.md, репо `Docsbook-io/docs-skills`. Он покрывает анализ и создание документации. План v2 — расширить его в **automation-каталог Docsbook**: добавить skills для типичных сценариев настройки и автоматизации, обновить интеграцию с Docsbook MCP (55 tools + webhook events), починить F1 (`dispatchEvent`) в Docsbook backend.
>
> Концепция: каталог опенсорс SKILL.md + Docsbook MCP. Никакого собственного runtime/daemon — агент юзера (Claude Code / Cursor / Codex / Gemini CLI) читает SKILL.md и выполняет инструкции через MCP-tools Docsbook и свои локальные `Write`/`Edit`/`Bash`.

---

## Содержание

- [Что есть сегодня](#что-есть-сегодня)
- [Что меняем и почему](#что-меняем-и-почему)
- [Архитектура двух режимов потребления](#архитектура-двух-режимов-потребления)
- [Часть A — Категоризация и таксономия skills](#часть-a--категоризация-и-таксономия-skills)
- [Часть B — Новые automation skills (V2)](#часть-b--новые-automation-skills-v2)
- [Часть C — Обновление существующих skills](#часть-c--обновление-существующих-skills)
- [Часть D — Discovery через Docsbook MCP](#часть-d--discovery-через-docsbook-mcp)
- [Часть E — `dispatchEvent` в Docsbook backend (блокер для webhook skills)](#часть-e--dispatchevent-в-docsbook-backend)
- [Часть F — Дистрибуция и discovery](#часть-f--дистрибуция-и-discovery)
- [Что НЕ входит в план](#что-не-входит-в-план)
- [Roadmap по фазам](#roadmap-по-фазам)

---

## Что есть сегодня

### Пакет `docs-skills` v1.1.2

- **Опубликован на npm** под именем `docs-skills`, репо `https://github.com/Docsbook-io/docs-skills`.
- **19 SKILL.md** в стандартном формате (YAML frontmatter `name`/`description` + markdown).
- **CLI `docs-skills`** (`bin/docs-skills.js`): команды `install`, `list`, `info`.
- **Installer (`install.js`)** автодетектит Claude Code / Cursor / Copilot / Codex и копирует skills в правильное место.
- **AGENTS.md** в корне репо — описывает все skills как catalog для агентов.
- **`scripts/`** — вспомогательные скрипты для парсинга docs (crawl-site, mdx-to-md, strip-gitbook, strip-mintlify, detect-platform).

### Существующие 19 skills (по группам)

**Analysis (orchestrator + 10 sub-skills):**
- `docs-analyze` — orchestrator, запускает 10 sub-skills, выдаёт unified report
- `docs-accessibility`, `docs-audience`, `docs-content-types`, `docs-i18n`, `docs-maintenance`, `docs-media`, `docs-navigation-linking`, `docs-seo`, `docs-structure-templates`, `docs-style-tone`

**Creation / sourcing:**
- `docs-create`, `docs-create-interactive` — создание новой документации
- `docs-from-code`, `docs-from-docs`, `docs-from-site` — генерация доки из разных источников
- `docs-detect-source` — детект исходного типа доки

**Publishing:**
- `docs-publish` — публикация в Docsbook
- `docs-setup-workspace` — настройка воркспейса через Docsbook MCP

### Что в Docsbook backend уже готово

55 MCP-tools, webhook infrastructure (dispatcher + worker + cron + HMAC + retry), llms.txt / llms-full.txt для платформы и воркспейсов. Подробно — см. `Docsbook/README.md`.

### ⚠️ Главный пробел в backend

**`dispatchEvent(...)` нигде не вызывается.** Webhook-инфра построена, но events не диспатчатся из существующего кода. Без этого ни один webhook-skill не работает end-to-end. Это **блокер для Части B-webhook**.

---

## Что меняем и почему

`docs-skills` сегодня — **«аналитический инструмент для аудита чужой документации»**. План v2 — расширить его до **«automation-каталог для управления своим Docsbook-воркспейсом»**.

Новые сценарии (юзер → его агент → docs-skill):

```
@docs-skills setup AGENTS.md for this repo
@docs-skills enable auto-translation to ru/es
@docs-skills create PR docs check workflow
@docs-skills setup stale docs watcher
@docs-skills announce releases to slack
@docs-skills tune AI chat from negative feedback
```

Каждый сценарий = новый SKILL.md в `skills/`. Каждый использует:
- MCP-tools Docsbook (`update_languages`, `register_webhook_*`, `get_failed_searches`, ...)
- Локальные tools агента юзера (`Write` AGENTS.md / GH workflow, `Bash` git commit)

Это естественное расширение существующего пакета — не новый продукт.

---

## Архитектура двух режимов потребления

`docs-skills` распространяется и потребляется **двумя способами**:

### Режим 1 — локальная установка (текущий, основной)

```bash
npx docs-skills install
```

Копирует все SKILL.md в `.claude/skills/` (Claude Code) или `.cursor/rules/` (Cursor) или в `AGENTS.md`/`copilot-instructions.md` для Codex/Copilot. Юзер вызывает skill в своём агенте через slash-command (`/docs-analyze`) или mention (`@docs-analyze`).

**Плюсы:** работает офлайн с уже скачанными skills, не зависит от Docsbook backend для discovery.

### Режим 2 — динамический discovery через Docsbook MCP (V2, новое)

В Docsbook MCP добавляется один tool: **`find_skill(query)`**, который:
1. Тянет `index.json` из `raw.githubusercontent.com/Docsbook-io/docs-skills/main/index.json` (Redis-кеш 5 мин, etag revalidation).
2. Делает keyword match по `name + description + keywords`.
3. Возвращает агенту: `{ name, description, github_url, raw_url }`.

Агент юзера читает SKILL.md по `raw_url` (через WebFetch или MCP-tool `read_skill`) и применяет.

**Плюсы:** юзер не должен заранее устанавливать пакет — достаточно подключённого Docsbook MCP. Discovery автоматический.

**Оба режима используют один и тот же исходный код SKILL.md** — никакого дублирования.

---

# Часть A — Категоризация и таксономия skills

Сейчас 19 skills плоским списком. Нужно ввести **категории** для discovery (и человеческого, и MCP-поиска).

## A1. Категории

Добавить в YAML frontmatter каждого SKILL.md поле `category`:

| category | Что делает | Текущие skills | Новые в V2 |
|---|---|---|---|
| `analysis` | Аудит, проверка качества | `docs-analyze`, `docs-accessibility`, `docs-audience`, `docs-content-types`, `docs-i18n`, `docs-maintenance`, `docs-media`, `docs-navigation-linking`, `docs-seo`, `docs-structure-templates`, `docs-style-tone` | — |
| `creation` | Генерация/импорт доки | `docs-create`, `docs-create-interactive`, `docs-from-code`, `docs-from-docs`, `docs-from-site`, `docs-detect-source` | — |
| `publishing` | Публикация и онбординг | `docs-publish`, `docs-setup-workspace` | `docs-generate-agents-md` |
| `automation` | Настройка автоматизаций через MCP | — | `docs-enable-translation`, `docs-pr-check`, `docs-stale-watcher`, `docs-release-announce`, `docs-tune-ai-chat`, `docs-translate-webhook` |
| `observability` | Анализ analytics, gap-finding | — | `docs-gap-finder`, `docs-failed-searches-to-content` |

## A2. Дополнительные frontmatter-поля для V2

К существующему `name`/`description`/`metadata.version` добавить:

```yaml
---
name: docs-enable-translation
description: Enable AI auto-translation for Docsbook workspace with optional Slack notifications on completion.
metadata:
  version: 1.0.0
  category: automation
  requires_docsbook_mcp: true
  requires_plan: pro              # free | pro | pro_plus
  uses_mcp_tools:
    - update_languages
    - set_translation_mode
    - register_webhook_translation_completed
  produces_files:
    - AGENTS.md       # append-section
  keywords: [translate, i18n, multilang, локализация]
---
```

Эти поля используются:
- `find_skill` (Часть D) для фильтрации по плану и поиска
- CI-валидатором для проверки что упомянутые `uses_mcp_tools` существуют в Docsbook
- Маркетинг-страницей `docsbook.io/skills`

## A3. JSON-схема + CI-валидация

В корне репо добавить `schema/skill.schema.json`. CI-workflow `.github/workflows/validate-skills.yml` на каждый PR:
1. Парсит все `skills/*/SKILL.md`.
2. Валидирует frontmatter против схемы.
3. Проверяет `uses_mcp_tools` против каталога Docsbook MCP (читает с `docsbook.io/api/mcp/server/tools.json` или из репо Docsbook).
4. Проверяет уникальность `name`.

## A4. `index.json` — generated catalog

Workflow `.github/workflows/build-index.yml` на merge в `main`:
1. Парсит все `SKILL.md`.
2. Собирает `index.json` в корень репо:
   ```json
   {
     "schema_version": 1,
     "generated_at": "2026-05-23T10:00:00Z",
     "skills": [
       {
         "name": "docs-enable-translation",
         "description": "...",
         "category": "automation",
         "requires_plan": "pro",
         "keywords": [...],
         "raw_url": "https://raw.githubusercontent.com/Docsbook-io/docs-skills/main/skills/docs-enable-translation/SKILL.md",
         "github_url": "https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-enable-translation/SKILL.md"
       }
     ]
   }
   ```
3. Коммитит `index.json`.
4. Тегает релиз `skills-vN` (по дате или по semver пакета).

---

# Часть B — Новые automation skills (V2)

Каждый skill — это отдельная папка в `skills/<name>/` с `SKILL.md`. Опционально — `references/`, `assets/` (templates), `scripts/`.

## B1. `docs-generate-agents-md` (Free)

**Цель:** создать `/AGENTS.md` в корне репо юзера на основе данных его Docsbook-воркспейса. Это **другой артефакт чем сам skill** — `AGENTS.md` становится статическим системным промптом, который агент юзера будет читать при каждой сессии.

**Inputs:** owner/repo (или workspace_id).

**Что делает skill:**
1. Через `get_workspace` читает настройки воркспейса (домен, языки, AI-чат, system_prompt).
2. Через `get_doc_graph` читает структуру доки (папки, типы контента).
3. Рендерит шаблон `assets/AGENTS.md.hbs` с подставленными данными.
4. Инструктирует агента юзера записать `AGENTS.md` в корень репо через `Write`.

**Шаблон `AGENTS.md` содержит:**
- URL Docsbook-сайта
- Расположение доки (`/docs`, `README.md`)
- Языковые настройки (если переводы включены — список языков, не трогать переведённые файлы)
- AI-чат настройки (стиль H2 для citation, если включён)
- Команда `mcp add --transport http https://docsbook.io/api/mcp/server`
- 5 типичных команд `@docs-skills ...`

## B2. `docs-enable-translation` (PRO)

**Inputs:** `languages: string[]`, `notify_slack?: { webhook_url: string }`.

**Шаги в SKILL.md:**
1. Validate inputs (languages из supported 15).
2. Check workspace plan через `get_workspace` — если не PRO/PRO+, остановиться и подсказать upgrade.
3. Call `update_languages(workspace_id, languages)`.
4. Call `set_translation_mode(workspace_id, mode: "auto")`.
5. Если `notify_slack` — `register_webhook_translation_completed(workspace_id, url, secret)`.
6. Записать секцию в `AGENTS.md` (append-section с маркером `## Docsbook Translation`).
7. Сообщить юзеру next steps.

## B3. `docs-pr-check` (Free)

**Цель:** генерирует `.github/workflows/docsbook-docs-check.yml` для проверки в PR: появились ли изменения в коде без обновления доки, валиден ли frontmatter, не сломаны ли внутренние ссылки.

**Inputs:** `block_on_broken_links?: boolean`.

**Шаги:**
1. Прочитать шаблон из `assets/workflow.yml.hbs`.
2. Подставить настройки.
3. Записать в `.github/workflows/docsbook-docs-check.yml`.
4. Workflow внутри использует `npx docs-skills run check-pr-docs` (новая subcommand в CLI — см. C2).

## B4. `docs-stale-watcher` (PRO+)

**Цель:** при событии `content.outdated` из Docsbook → создаётся Issue в GitHub-репо юзера.

**Шаги:**
1. Сгенерировать `.github/workflows/docsbook-stale-handler.yml` — workflow с триггером `repository_dispatch: docsbook.content.outdated`.
2. Через MCP вызвать `register_webhook_content_outdated(workspace_id, url, secret)`, где `url` — `https://api.github.com/repos/{owner}/{repo}/dispatches` с правильным payload mapping (или прокси-endpoint в Docsbook, который форвардит как `repository_dispatch`).
3. Записать секцию в `AGENTS.md`.

> **Блокер:** без Части E (`dispatchEvent`) — webhook никогда не выстреливает.

## B5. `docs-release-announce` (PRO)

**Цель:** при новом релизе на GitHub (или событии `plan.upgraded`) — пост в Slack/email.

**Inputs:** `channels: ("slack" | "email")[]`, `slack_webhook_url?`, `email?`.

**Шаги:**
1. `register_webhook_release_published` (если такое событие есть; иначе — слушать GitHub release напрямую).
2. Сгенерировать handler в виде GH Action или Vercel function template.

## B6. `docs-tune-ai-chat` (PRO)

**Цель:** проанализировать negative feedback + failed AI questions за последний месяц и предложить улучшения system_prompt.

**Шаги:**
1. `get_negative_feedback(workspace_id, days: 30)`.
2. `get_ai_unanswered(workspace_id, days: 30)`.
3. Сгруппировать по темам (через LLM или keyword clustering).
4. Сгенерировать предложение нового `system_prompt`.
5. Показать юзеру diff текущего vs нового.
6. По подтверждению — `set_chat_system_prompt(workspace_id, new_prompt)`.

## B7. `docs-gap-finder` (PRO+)

**Цель:** найти страницы которые надо создать, исходя из failed searches + AI unanswered + top external referrers.

**Шаги:**
1. `get_failed_searches`, `get_ai_unanswered`, `get_popular_searches`.
2. Кросс-референс с `get_doc_graph` — отфильтровать темы которые уже покрыты.
3. Вернуть юзеру отчёт: «вот 7 страниц которые стоит создать, в порядке приоритета».
4. Опционально — открыть GitHub Issues с draft outline для каждой.

## B8. `docs-translate-webhook` (PRO+)

**Цель:** скастомизировать перевод через external webhook (вместо встроенного AI). Полезно для команд с собственным переводческим pipeline.

**Шаги:**
1. `set_translation_mode(workspace_id, mode: "external")`.
2. Зарегистрировать webhook на `translation.requested`.
3. Сгенерировать handler-шаблон (Vercel function / Express) который агент юзера деплоит.

---

# Часть C — Обновление существующих skills

## C1. Добавить metadata-поля во все 19 SKILL.md

Прогнать через все `skills/*/SKILL.md`, добавить:
- `category`
- `keywords`
- `requires_docsbook_mcp` (true для skills которые зовут MCP)
- `requires_plan` (где применимо)
- `uses_mcp_tools` (где применимо)

Это нужно для CI-валидации и для `find_skill`.

## C2. Расширить CLI `docs-skills`

Сейчас: `install`, `list`, `info`.

Добавить:
- `docs-skills run <skill> [args]` — запустить skill в headless-режиме (для CI). Например, `npx docs-skills run check-pr-docs --pr=123`.
- `docs-skills update` — обновить уже установленные skills до последней версии (pull новые SKILL.md).
- `docs-skills doctor` — проверить подключение к Docsbook MCP, доступ к Docsbook API token, наличие нужных скриптов.

## C3. Обновить `docs-setup-workspace`

Текущий skill настраивает базовые поля. Расширить:
- Вызывать `docs-generate-agents-md` как подшаг (если AGENTS.md ещё не создан).
- Предложить юзеру включить automation-skills (`docs-pr-check`, `docs-enable-translation`).

## C4. Обновить `docs-analyze` orchestrator

Добавить опциональный шаг в конец: «найдены такие-то проблемы — вот доступные automation skills которые их решают». Например, если найдены stale docs → предложить `docs-stale-watcher`.

---

# Часть D — Discovery через Docsbook MCP

## D1. Один новый MCP-tool в Docsbook: `find_skill`

**Input:**
```typescript
{
  query: string,
  filters?: {
    category?: "analysis" | "creation" | "publishing" | "automation" | "observability",
    requires_plan?: "free" | "pro" | "pro_plus",
    max_results?: number
  }
}
```

**Output:**
```typescript
{
  matches: Array<{
    name: string,
    description: string,
    category: string,
    requires_plan: string,
    score: number,
    raw_url: string,         // raw.githubusercontent.com/.../SKILL.md
    github_url: string,
    keywords: string[],
    uses_mcp_tools: string[]
  }>,
  index_version: string,
  index_fetched_at: string
}
```

**Реализация в Docsbook:**
- Файл: `src/lib/skills/find.ts`
- Тянет `index.json` из `raw.githubusercontent.com/Docsbook-io/docs-skills/main/index.json` (Redis cache 300s + etag).
- V1: keyword match с весами (name×3, description×2, keywords×2).
- V2: embedding search.

**Что НЕ нужно в Docsbook MCP:**
- ❌ `apply_skill` — не нужен. Агент юзера сам читает SKILL.md по `raw_url` (через WebFetch / Read) и выполняет шаги. Это в духе SKILL.md экосистемы (Claude/Codex skills работают так же).
- ❌ Таблица `skill_applications` в БД — состояние видно по факту (зарегистрированные webhooks, настройки воркспейса).

## D2. Обновить AGENTS.md в Docsbook-репо

В `Docsbook/AGENTS.md` добавить секцию:

```md
## Docs automation skills

For documentation tasks, search the Docsbook skills catalog:
- Call MCP tool `find_skill(query)` with the user's request.
- Read the returned SKILL.md from `raw_url`.
- Follow the steps inside.

Or install skills locally: `npx docs-skills install`.
```

Это позволяет любому агенту, работающему в Docsbook-репо, использовать каталог.

---

# Часть E — `dispatchEvent` в Docsbook backend

**Блокер для всех webhook-skills (B4, B5, B7, B8).** Без событий — webhook'и зарегистрированы, но никогда не вызываются.

## E1. Аудит источников событий

Пройти по коду Docsbook и зафиксировать точки врезки:

| Файл | Event | Payload |
|---|---|---|
| `src/lib/source-of-truth.ts` (после индексации) | `content.indexed` | `{pages_added, pages_removed, pages_modified, commit_sha}` |
| Новый cron `/api/cron/stale-check` | `content.outdated` | `{page_paths[], last_modified_days}` |
| `src/utils/translation/*` (после auto-перевода) | `translation.completed` | `{path, language, origin}` |
| `src/utils/translation/*` (детект устарел) | `translation.outdated` | `{path, language, source_hash_old, source_hash_new}` |
| `src/app/api/ai-chat/route.ts` (после LLM-ответа) | `chat.question_asked`, `chat.no_answer` | `{session_id, question, language, country, has_answer}` |
| `src/app/api/feedback/route.ts` | `chat.negative_feedback`, `feedback.received` | `{session_id, page_path, type, comment}` |
| `src/app/api/search/route.ts` | `search.no_results` | `{query, language}` |
| Новый Axiom-cron | `traffic.spike`, `traffic.drop` | `{page_path, multiplier, baseline}` |
| `src/app/api/paddle/route.ts` | `plan.upgraded`, `plan.downgraded`, `usage.limit_approaching` | `{workspace_id, old_plan, new_plan}` |

## E2. Реализация

1. Создать `src/lib/dispatch-event.ts` — типобезопасный wrapper над `webhook-dispatcher.ts`.
2. Врезать `void dispatchEvent(workspaceId, eventType, payload).catch(logError)` (fire-and-forget — не блокировать основной флоу).
3. Тесты с моком dispatcher'а.

## E3. Финализация каталога

`Docsbook/docs/webhooks.md` сейчас черновик. Доделать:
- Полные payload-схемы (Zod) для каждого event.
- Примеры payload в JSON.
- `schema_version: 1`.

---

# Часть F — Дистрибуция и discovery

## F1. Маркетинг-страница `docsbook.io/skills`

Страница в Next.js (внутри Docsbook):
- Тянет `index.json` из репо `docs-skills`.
- Рендерит карточки с фильтрами по category / plan / keywords.
- Каждая карточка → детальная страница `docsbook.io/skills/[name]` с рендерингом SKILL.md.
- На детальной: «Copy install command» (`npx docs-skills install`), «Try in MCP» (`@docsbook find_skill "<name>"`).

## F2. SEO для discovery в AI-поиске

- Каждая страница skill — отдельный URL с meta-тегами.
- Включить в `docsbook.io/llms.txt` ссылку на каталог `/skills`.
- README `docs-skills` обновить с актуальным числом skills и категориями.

## F3. README + AGENTS.md в `docs-skills`

- Обновить `README.md`: добавить категории, новые automation skills, описать оба режима потребления (local install + MCP discovery).
- Обновить `AGENTS.md` в корне `docs-skills`: добавить категории, новые skills.

## F4. Опубликовать v2.0.0 на npm

После Части B + C:
```bash
npm version major
npm publish
```

---

## Что НЕ входит в план

Намеренно отложено:

- **Hosted autonomous daemons** на стороне Docsbook (Docs Watchdog, Question Solver, и т.д.) — отдельный проект следующего уровня. Появится skill `docs-enable-autopilot` который их включает, но сами daemon'ы — V3.
- **Custom skills repository** (юзер указывает свой репо со skills) — V3, с whitelist.
- **Embedding-based search** в `find_skill` — V2, если keyword match даёт плохие результаты.
- **UI для skills в Docsbook FloatWidget** — V2 (V1 — только маркетинг-страница).
- **A2A protocol** — не наш слой.
- **OpenAI Apps SDK widget** — позже, по сигналу траффика.
- **Локальный MCP-сервер** (`docsbook-agents-mcp`) — не нужен. У агента юзера уже есть `Write`/`Edit`/`Bash`.

---

## Roadmap по фазам

### Фаза 1 — Таксономия и инфра каталога (3-5 дней)

**Цель:** подготовить структуру для V2 без новых skills.

- [ ] A1: добавить `category` во все 19 существующих SKILL.md (+ остальные frontmatter-поля A2).
- [ ] A3: `schema/skill.schema.json` + CI-валидатор.
- [ ] A4: `scripts/build-index.ts` + `index.json` + workflow `build-index.yml`.
- [ ] C2: расширить CLI (`run`, `update`, `doctor`).
- [ ] F3: обновить README и AGENTS.md под новую таксономию.

### Фаза 2 — Первые automation skills без webhook'ов (1 неделя)

**Цель:** доказать ценность на скиллах которые НЕ требуют `dispatchEvent`.

- [ ] B1: `docs-generate-agents-md` — самый простой, чисто файловый.
- [ ] B2: `docs-enable-translation` — backend-вызовы Docsbook MCP.
- [ ] B3: `docs-pr-check` — GH Action template.
- [ ] B6: `docs-tune-ai-chat` — чтение analytics + запись system_prompt.
- [ ] C1: обновить existing skills metadata.
- [ ] C3: расширить `docs-setup-workspace`.
- [ ] Релиз `docs-skills@2.0.0` на npm.

### Фаза 3 — `dispatchEvent` + webhook-skills (1.5 недели)

**Параллельно** с Фазой 2 (по возможности), **блокирует** webhook-skills.

- [ ] E1: аудит источников событий в Docsbook.
- [ ] E2: `src/lib/dispatch-event.ts` + врезки.
- [ ] E3: финализация `Docsbook/docs/webhooks.md` с Zod-схемами.
- [ ] B4: `docs-stale-watcher`.
- [ ] B5: `docs-release-announce`.
- [ ] B7: `docs-gap-finder`.
- [ ] B8: `docs-translate-webhook`.

### Фаза 4 — Discovery через MCP + Marketing (1 неделя)

- [ ] D1: `find_skill` MCP-tool в Docsbook (`src/lib/skills/find.ts`).
- [ ] D2: обновить `Docsbook/AGENTS.md` с упоминанием каталога.
- [ ] F1: маркетинг-страница `docsbook.io/skills`.
- [ ] F2: SEO + llms.txt update.
- [ ] Метрики в Axiom: `skill.found`, `skill.downloaded`, `find_skill.called`.

### Фаза 5 — Launch & promotion (3-5 дней)

- [ ] Блог-пост: «`docs-skills` v2 — automation catalog for Docsbook».
- [ ] Show HN / r/programming / Twitter.
- [ ] Добавить в `awesome-claude-skills`, `awesome-agent-skills` каталоги.
- [ ] Видео-демо 2-3 минуты.

---

# Резюме для исполнителя

**Что строим:**
1. ✅ Базовый каталог `docs-skills` v1.1.2 на npm с 19 skills — **уже есть**.
2. ⚙️ Категоризация + frontmatter-расширение + CI-валидация + `index.json` (Фаза 1).
3. ⚙️ 4 новых automation skills без webhook'ов: `docs-generate-agents-md`, `docs-enable-translation`, `docs-pr-check`, `docs-tune-ai-chat` (Фаза 2).
4. ⚙️ `dispatchEvent` в Docsbook backend (Фаза 3) — **блокер для webhook-skills**.
5. ⚙️ 4 webhook-skills: `docs-stale-watcher`, `docs-release-announce`, `docs-gap-finder`, `docs-translate-webhook` (Фаза 3).
6. ⚙️ `find_skill` MCP-tool в Docsbook + маркетинг-страница (Фаза 4).
7. ⚙️ Релиз `docs-skills@2.0.0` + анонс (Фаза 5).

**Стартовая точка:**
- Начать с Фазы 1 в `/Users/dan/Documents/startupin24h/docs-skills/`.
- Параллельно начать аудит E1 в `/Users/dan/Documents/startupin24h/Docsbook/`.

**Что прочитать перед стартом:**
- `Docsbook/README.md` — архитектура.
- `Docsbook/docs/webhooks.md` — каталог events (черновик).
- `Docsbook/src/app/api/mcp/server/route.ts` — все 55 MCP tools.
- `Docsbook/src/lib/plan-capabilities.ts` — plan gating.
- `Docsbook/src/lib/webhook-dispatcher.ts` — готовая инфра для E2.
- `docs-skills/skills/docs-setup-workspace/SKILL.md` — пример существующего MCP-skill (на него ориентироваться при написании новых).
