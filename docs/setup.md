# Local Setup

## 1. Что понадобится заранее

- Telegram bot token от `@BotFather`
- username бота
- `ngrok` auth token
- `Supabase URL` и `service role key`
- ключ `OpenRouter`

Если хочешь тестировать только UI, достаточно сайта. Если хочешь пройти путь до бота, webhook и mini app, нужны все переменные.

## 2. Подготовь `.env`

Скопируй шаблон:

```bash
cp .env.example .env
```

Минимально заполни:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
- `TELEGRAM_BOT_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `NGROK_AUTHTOKEN`
- `N8N_ENCRYPTION_KEY`
- `N8N_WEBHOOK_SECRET`

Важное правило:

- `NEXT_PUBLIC_SITE_URL` — это публичный URL сайта или mini app
- `N8N_WEBHOOK_URL` — это публичный URL именно для `n8n`

Если у тебя один `ngrok` URL, он может указывать только на один локальный сервис. Для сайта и `n8n` обычно нужны два отдельных туннеля.

## 3. Подними локальный стек

```bash
docker compose up -d postgres n8n site ngrok-n8n ngrok-site
```

После запуска будут доступны:

- сайт: `http://localhost:3000`
- n8n: `http://localhost:5678`
- ngrok инспектор для webhook: `http://localhost:4040`
- ngrok инспектор для сайта: `http://localhost:4041`

Если удобнее работать над фронтом локально без Docker:

```bash
npm install
npm run dev
```

Тогда сайт будет на `http://localhost:3000` или ближайшем свободном порту.

## 4. Настрой базу

В проекте лежит миграция:

- [20260317_init_atlas_mvp.sql](/Users/antonzaratustra/Projects/Cognitive biaces/supabase/migrations/20260317_init_atlas_mvp.sql)

Применить можно через Supabase SQL editor или `psql`.

Практически сейчас лучше использовать облачный Supabase, а не локальный self-host:

- он уже дает `SUPABASE_URL`
- `anon key`
- `service role key`
- не требует поднимать отдельный Supabase stack

Текущий `docker-compose` поднимает `postgres` для локального окружения и `n8n`, но это не полный self-hosted Supabase.

## 5. Подключи Telegram webhook

1. Открой `http://localhost:4040`
2. Возьми публичный HTTPS URL для `ngrok-n8n`
3. Запиши его в `.env` как `N8N_WEBHOOK_URL`, например:

```bash
N8N_WEBHOOK_URL=https://your-subdomain.ngrok-free.app/
```

4. Перезапусти `n8n`

```bash
docker compose up -d n8n
```

5. В `n8n` импортируй реальный workflow:

- [cognitive-biases-atlas.workflow.json](/Users/antonzaratustra/Projects/Cognitive biaces/n8n/cognitive-biases-atlas.workflow.json)

Blueprint тоже оставлен в проекте как contract-файл:

- [atlas-first-course.blueprint.json](/Users/antonzaratustra/Projects/Cognitive biaces/n8n/atlas-first-course.blueprint.json)

6. Установи webhook у бота на URL Telegram Trigger из `n8n`

Если у тебя уже есть рабочий контейнер `n8n` на `5678`, проще использовать его, а не поднимать второй.

## 6. Настрой mini app регистрацию

Для mini app нужен публичный URL сайта.

В локальном контуре:

1. Открой `http://localhost:4041`
2. Возьми публичный HTTPS URL для `ngrok-site`
3. Используй его как:
   - `NEXT_PUBLIC_SITE_URL`
   - web app URL в `@BotFather`
   - URL для регистрации `https://.../miniapp/register`

Что уже готово в проекте:

- страница регистрации mini app: [app/miniapp/register/page.tsx](/Users/antonzaratustra/Projects/Cognitive biaces/app/miniapp/register/page.tsx)
- API для регистрации: [app/api/miniapp/register/route.ts](/Users/antonzaratustra/Projects/Cognitive biaces/app/api/miniapp/register/route.ts)
- Telegram auth для сайта: [app/api/telegram/auth/route.ts](/Users/antonzaratustra/Projects/Cognitive biaces/app/api/telegram/auth/route.ts)

Важно:

- после успешной регистрации route сам отправляет webhook в `n8n` на path `cb-miniapp-register`
- `N8N_WEBHOOK_URL` должен смотреть на публичный адрес твоего `n8n`
- если задан `N8N_WEBHOOK_SECRET`, сайт и `n8n` должны использовать одно и то же значение

## 7. Что импортировать в `n8n`

Готовый импортируемый workflow:

- [cognitive-biases-atlas.workflow.json](/Users/antonzaratustra/Projects/Cognitive biaces/n8n/cognitive-biases-atlas.workflow.json)

Что он уже умеет:

- `/start` и регистрационный gate по логике старого рабочего курса
- последовательная выдача уроков из `cb_user_lessons`
- двухшаговую доставку урока: `photo + text`, если у урока есть `image_url`
- 4 кнопки под уроком: `Следующий`, `Атлас`, `Сохранить`, `Спросить AI`
- callback routing: `lesson:next`, `lesson:save`, `lesson:ai`, `ai:suggest:*`
- AI-ответы через OpenRouter в контексте текущего урока
- text + voice + готовые AI-подсказки по аналогии со старым курсом
- webhook `cb-miniapp-register` для автозапуска курса после mini app регистрации

После импорта тебе нужно:

1. назначить credentials на Telegram Trigger / Telegram / Postgres / Transcribe Voice
2. проверить node `Attach Config (Telegram)` и `Attach Config (Webhook)`
3. убедиться, что в контейнер `n8n` передан `OPENROUTER_API_KEY`, если используешь code node `Call OpenRouter`
4. убедиться, что в контейнер `n8n` передан `N8N_WEBHOOK_SECRET`, если хочешь автозапуск курса после регистрации

## 8. Что такое blueprint / contract в `n8n`

Файл [atlas-first-course.blueprint.json](/Users/antonzaratustra/Projects/Cognitive biaces/n8n/atlas-first-course.blueprint.json) сейчас не является готовым импортируемым workflow.

Это contract-файл:

- какие entrypoint'ы будут у бота
- как называются callback'и
- какие таблицы используются
- какие блоки должны быть в workflow
- какой payload идет в OpenRouter

Это спецификация и naming contract. Он нужен как ориентир для следующих итераций workflow, но импортировать его в `n8n` вместо рабочего JSON не нужно.

## 9. OpenRouter и AI в боте

Для AI-ветки в `n8n` используй:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`

На старте можно использовать бесплатную модель, например:

```bash
OPENROUTER_MODEL=google/gemma-3-27b-it:free
```

Детали по интеграции описаны здесь:

- [docs/n8n-openrouter.md](/Users/antonzaratustra/Projects/Cognitive biaces/docs/n8n-openrouter.md)

## 10. Какие credentials создать в `n8n`

- `Telegram API` credential для trigger и send nodes
- `Postgres` credential к Supabase Postgres
- `OpenAI` credential для node `Transcribe Voice`, если хочешь рабочую голосовую ветку

Подробный чеклист:

- [docs/n8n-credentials.md](/Users/antonzaratustra/Projects/Cognitive biaces/docs/n8n-credentials.md)

Если не хочешь подключать голос сразу, workflow все равно можно импортировать и тестировать текстовый AI и уроки.

## 11. Что проверить руками после запуска

1. Лендинг открывается и атлас встроен прямо в главную
2. Карточка искажения открывается по клику на ветвь карты
3. `/miniapp/register` открывается по публичному URL
4. `/quizzes/judgment-lab` показывает preview без доступа и полный режим после entitlement
5. Telegram auth route проходит проверку с живым `initData`
6. `n8n` получает webhook от Telegram через `ngrok-n8n`

## 12. Как загрузить первые уроки в Supabase

Если хочешь быстро оживить бота и сайт, в проекте уже есть demo content seed:

- [supabase/seeds/20260317_demo_content.sql](/Users/antonzaratustra/Projects/Cognitive biaces/supabase/seeds/20260317_demo_content.sql)

Он добавляет:

- 4 секции
- 14 уроков
- atlas nodes и связи
- `quiz_pack_full_access`
- demo quiz `judgment-lab`

Если меняешь `data/course-data.ts`, пересобери SQL так:

```bash
npm run seed:content
```

Потом:

1. открой Supabase `SQL Editor`
2. создай новый query
3. вставь содержимое `20260317_demo_content.sql`
4. нажми `Run`

После этого у бота появится реальный стартовый контент.

## 13. Полезные маршруты

- `/` — лендинг и атлас
- `/biases/[slug]` — отдельная карточка искажения
- `/quizzes/judgment-lab` — квиз
- `/miniapp/register` — mini app регистрация
