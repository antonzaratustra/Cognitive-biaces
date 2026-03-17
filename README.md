# Cognitive Bias Atlas MVP

Atlas-first запуск курса по когнитивным искажениям: лендинг, встроенный радиальный атлас, карточки искажений, quiz pack и Telegram-first архитектура под `n8n + Supabase`.

## Что уже есть

- `Next.js` сайт с лендингом, встроенным атласом, карточками и страницей квиза
- API-заготовки под лиды, Telegram auth и entitlement check
- SQL migration под новую схему `cb_*`
- Docker stack для `postgres + n8n + ngrok + site`
- mini app регистрация внутри сайта
- importable `n8n` workflow для бота и contract/blueprint-файлы для развития логики

## Быстрый старт

1. Скопируй `.env.example` в `.env.local`
2. Установи зависимости:

```bash
npm install
```

3. Запусти сайт:

```bash
npm run dev
```

4. Если нужен локальный стек:

```bash
docker compose up -d postgres n8n site ngrok-n8n ngrok-site
```

5. Для базы сейчас проще использовать облачный Supabase и применить SQL-схему из [supabase/migrations/20260317_init_atlas_mvp.sql](/Users/antonzaratustra/Projects/Cognitive biaces/supabase/migrations/20260317_init_atlas_mvp.sql) через SQL Editor

## Ключевые env

- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` — username бота
- `TELEGRAM_BOT_TOKEN` — нужен для проверки Telegram Mini App `initData`
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — включают реальную запись лидов и entitlement check
- `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` — для n8n AI-ветки
- `NGROK_AUTHTOKEN` — для публичных туннелей сайта и webhook
- `N8N_WEBHOOK_URL` — публичный URL именно для `n8n`
- `NEXT_PUBLIC_SITE_URL` — публичный URL именно для сайта / mini app

## Структура

- [app](/Users/antonzaratustra/Projects/Cognitive biaces/app) — страницы и API routes
- [components](/Users/antonzaratustra/Projects/Cognitive biaces/components) — lead form, atlas viewer, quiz gate
- [data/course-data.ts](/Users/antonzaratustra/Projects/Cognitive biaces/data/course-data.ts) — seed-данные atlas, уроков и квиза
- [supabase/migrations](/Users/antonzaratustra/Projects/Cognitive biaces/supabase/migrations) — SQL-таблицы под `cb_*`
- [n8n](/Users/antonzaratustra/Projects/Cognitive biaces/n8n) — importable workflow, naming и contract под развитие логики
- [docs](/Users/antonzaratustra/Projects/Cognitive biaces/docs) — setup, master-template и OpenRouter contract

## Что дальше

- заменить seed-данные на master-таблицу 160+ уроков
- импортировать atlas nodes / edges в БД
- импортировать [cognitive-biases-atlas.workflow.json](/Users/antonzaratustra/Projects/Cognitive biaces/n8n/cognitive-biases-atlas.workflow.json) в текущий `n8n` и назначить credentials
- подключить Telegram Stars invoice flow и запись entitlements
