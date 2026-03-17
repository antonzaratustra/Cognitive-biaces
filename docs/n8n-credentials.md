# n8n Credentials Checklist

## Что создать перед импортом workflow

### 1. Telegram API

Нужен для:

- `Telegram Trigger`
- всех `Telegram` send/edit nodes

Что использовать:

- token от бота `cognitive_biases_atlas_bot`

### 2. Postgres

Нужен для всех SQL nodes, которые читают и пишут в `cb_*`.

Подключение идет не к REST API Supabase, а к Postgres database проекта Supabase.

Что взять в Supabase:

- `Project Settings` -> `Database`
- host
- port
- database name
- user
- password
- SSL mode обычно нужен `require`

### 3. OpenAI

Нужен только для node `Transcribe Voice`.

Если хочешь тестировать сначала только:

- `/start`
- уроки
- `Следующий`
- `Сохранить`
- текстовый AI

то этот credential можно подключить позже.

## Что еще проверить после импорта

### Attach Config nodes

Открой nodes `Attach Config (Telegram)` и `Attach Config (Webhook)` и проверь:

- `NEXT_PUBLIC_SITE_URL`
- `miniapp_url`
- `quiz_url`

### OpenRouter

Node `Call OpenRouter` читает ключ из env контейнера `n8n`:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`

Для автозапуска курса после mini app регистрации также нужен:

- `N8N_WEBHOOK_SECRET`

## Минимальный smoke test

1. Импортируй workflow
2. Назначь `Telegram API` и `Postgres`
3. Активируй workflow
4. Напиши боту `/start`
5. Пройди регистрацию через mini app
6. Получи первый урок
7. Нажми `Сохранить`
8. Нажми `Спросить AI`
9. Задай вопрос текстом
10. Проверь, что после mini app регистрации `n8n` получает webhook `cb-miniapp-register`

После этого можно отдельно добивать:

- voice transcription
- deep links
- Stars payments
