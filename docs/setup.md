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

5. В `n8n` импортируй workflow blueprint:

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

## 7. Что такое blueprint / contract в `n8n`

Файл [atlas-first-course.blueprint.json](/Users/antonzaratustra/Projects/Cognitive biaces/n8n/atlas-first-course.blueprint.json) сейчас не является готовым импортируемым workflow.

Это contract-файл:

- какие entrypoint'ы будут у бота
- как называются callback'и
- какие таблицы используются
- какие блоки должны быть в workflow
- какой payload идет в OpenRouter

Следующий шаг после настройки env — собрать на его основе настоящий `n8n` workflow JSON для импорта.

## 8. OpenRouter и AI в боте

Для AI-ветки в `n8n` используй:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`

На старте можно использовать бесплатную модель, например:

```bash
OPENROUTER_MODEL=google/gemma-3-27b-it:free
```

Детали по интеграции описаны здесь:

- [docs/n8n-openrouter.md](/Users/antonzaratustra/Projects/Cognitive biaces/docs/n8n-openrouter.md)

## 9. Что проверить руками после запуска

1. Лендинг открывается и атлас встроен прямо в главную
2. Карточка искажения открывается по клику на ветвь карты
3. `/miniapp/register` открывается по публичному URL
4. `/quizzes/judgment-lab` показывает preview без доступа и полный режим после entitlement
5. Telegram auth route проходит проверку с живым `initData`
6. `n8n` получает webhook от Telegram через `ngrok-n8n`

## 10. Полезные маршруты

- `/` — лендинг и атлас
- `/biases/[slug]` — отдельная карточка искажения
- `/quizzes/judgment-lab` — квиз
- `/miniapp/register` — mini app регистрация
