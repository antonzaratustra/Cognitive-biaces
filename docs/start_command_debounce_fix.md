# Исправление дублей `/start`

## Что меняем

Старая схема опиралась на `cb_events`, уникальный индекс и ручную очистку. Это было хрупко:

- защита ломалась, если миграция с индексом не была применена;
- `cb_events` одновременно использовался и как лог, и как lock-механизм;
- дубликат мог пройти часть workflow и успеть создать побочные эффекты.

Новая схема выносит дебаунс в отдельный атомарный слой:

- таблица `public.cb_command_locks` хранит последнее успешно обработанное состояние команды по пользователю;
- функция `public.cb_claim_command(...)` одним SQL-выражением решает, должен ли текущий запрос обрабатываться;
- если это первый `/start` за окно в 2 секунды, функция возвращает `should_process = true` и обновляет только operational lock;
- если это дубль, функция возвращает `should_process = false`, а workflow тихо заканчивается без второго Telegram-сообщения.

## Актуальная цепочка в n8n

```text
Is /start?
  -> Claim Start Command
  -> Start Claimed?
     -> true  -> Get Start User -> Start Registered? -> ...
     -> false -> Ignore Duplicate Start
```

Ключевой принцип: дубль отсекается до `Get Start User`, `Create Start User`, создания очереди уроков и любых Telegram-ответов.

## Почему это надёжнее

- Не зависит от partial unique index на `cb_events`.
- Не требует `pg_advisory_xact_lock`.
- Не требует cleanup-триггера для временных записей.
- Не упирается в FK `cb_events_user_tg_id_fkey`, потому что не логирует `/start` до появления записи в `cb_users`.

## Что нужно применить

1. Прогнать новую миграцию:
   [`supabase/migrations/20260319_replace_start_debounce_with_command_claim.sql`](/Users/antonzaratustra/Projects/Cognitive biaces/supabase/migrations/20260319_replace_start_debounce_with_command_claim.sql)
2. Импортировать обновлённый workflow:
   [`n8n/cognitive-biases-atlas.workflow.json`](/Users/antonzaratustra/Projects/Cognitive biaces/n8n/cognitive-biases-atlas.workflow.json)
3. При необходимости использовать ту же копию для ручного импорта:
   [`n8n/Cognitive Bias Atlas Bot.json`](/Users/antonzaratustra/Projects/Cognitive biaces/n8n/Cognitive Bias Atlas Bot.json)

## Быстрая проверка

Ручной тест:

1. Открыть бота.
2. Отправить `/start` дважды очень быстро.
3. Ожидание: бот отвечает только один раз.
4. Вторая параллельная доставка попадает в `Ignore Duplicate Start`.

Проверка в БД:

```sql
select *
from public.cb_command_locks
where command_name = 'start_command'
order by updated_at desc
limit 20;
```

Если позже понадобится аналитический лог `/start`, его лучше писать отдельным узлом после `Create Start User` или в отдельную таблицу без FK на `cb_users`.
