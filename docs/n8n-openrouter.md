# n8n + OpenRouter Contract

## Telegram callbacks

Под новым курсом фиксируем такие `callback_data`:

- `lesson:next:<lesson_id>`
- `lesson:save:<lesson_id>`
- `lesson:atlas:<lesson_slug>`
- `lesson:ai:<lesson_id>`
- `ai:suggest:<lesson_id>:life`
- `ai:suggest:<lesson_id>:spot`
- `ai:suggest:<lesson_id>:practice`
- `quiz:offer`

## 4 кнопки под уроком

1. `Следующий`
2. `Атлас`
3. `Сохранить`
4. `Спросить AI`

## AI-flow

### Вход

- текст из `message.text`
- или транскрибированный голос из `voice.file_id -> transcription`
- текущий `lesson_id`
- thread per `(user_tg_id, lesson_id)`

### Системный prompt

Складывается из:

- `lesson.title`
- `lesson.ai_context`
- `lesson.short_text`
- `lesson.related_slugs`
- короткой истории из `cb_ai_messages`

### HTTP Request в OpenRouter

- `POST https://openrouter.ai/api/v1/chat/completions`
- header `Authorization: Bearer {{OPENROUTER_API_KEY}}`
- model из env `OPENROUTER_MODEL`
- если модель недоступна, fallback на запасную через Switch/If node

### Что писать в таблицы

- `cb_ai_threads`: открыть или найти по `(user_tg_id, lesson_id)`
- `cb_ai_messages`: входящее сообщение пользователя и ответ ассистента
- `cb_ai_usage`: модель, токены, статус ответа, provider=`openrouter`

## SQL-заготовки для n8n

### Найти следующий урок

```sql
select l.*
from public.cb_user_lessons ul
join public.cb_lessons l on l.id = ul.lesson_id
where ul.user_tg_id = {{ $json.tg_id }}
  and ul.status in ('new', 'in_progress')
order by l.sort_order asc
limit 1;
```

### Пометить урок завершенным

```sql
update public.cb_user_lessons
set status = 'completed',
    completed_at = now()
where user_tg_id = {{ $json.tg_id }}
  and lesson_id = {{ $json.lesson_id }};
```

### Сохранить урок

```sql
insert into public.cb_saved_lessons (user_tg_id, lesson_id)
values ({{ $json.tg_id }}, {{ $json.lesson_id }})
on conflict (user_tg_id, lesson_id) do nothing;
```
