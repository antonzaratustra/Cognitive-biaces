# Extracted Content Import

## What This Is

Если у тебя есть выгрузка когнитивных искажений батчами:

- `taxonomy.json`
- несколько `biases*.jsonl`
- несколько `relations*.jsonl`

то не нужно вручную писать SQL.

В проекте есть генератор:

- [generate-extracted-seed.mjs](/Users/antonzaratustra/Projects/Cognitive%20biaces/scripts/generate-extracted-seed.mjs)

Он собирает все батчи и делает один SQL seed:

- [20260318_extracted_content.sql](/Users/antonzaratustra/Projects/Cognitive%20biaces/supabase/seeds/20260318_extracted_content.sql)

## Folder Structure

Положи файлы сюда:

```text
content/extracted/
  taxonomy.json
  batch-1-biases.jsonl
  batch-1-relations.jsonl
  batch-2-biases.jsonl
  batch-2-relations.jsonl
  ...
```

Правила:

- `taxonomy.json` должен называться именно так
- все файлы с `relations` в имени будут считаться relation batch
- остальные `.jsonl` будут считаться bias batch

## Import Flow

### 1. Примени миграцию

Сначала нужно обновить схему БД:

- [20260318_add_taxonomy_and_lesson_metadata.sql](/Users/antonzaratustra/Projects/Cognitive%20biaces/supabase/migrations/20260318_add_taxonomy_and_lesson_metadata.sql)

Эта миграция добавляет:

- `cb_subgroups`
- `subgroup_id` в `cb_lessons`
- дополнительные поля уроков
- `node_type`, `section_id`, `subgroup_id` в `cb_atlas_nodes`

### 2. Сгенерируй SQL

Запусти:

```bash
npm run seed:extracted
```

### 3. Получи итоговый файл

После этого появится файл:

- [20260318_extracted_content.sql](/Users/antonzaratustra/Projects/Cognitive%20biaces/supabase/seeds/20260318_extracted_content.sql)

### 4. Выполни SQL в Supabase

Открой Supabase SQL Editor и выполни:

- сначала миграцию `20260318_add_taxonomy_and_lesson_metadata.sql`
- потом seed `20260318_extracted_content.sql`

## What Gets Loaded

### cb_sections

Сюда загружаются 4 сферы.

### cb_subgroups

Сюда загружаются подгруппы.

### cb_lessons

Сюда загружаются сами искажения как уроки.

### cb_atlas_nodes

Сюда загружаются:

- узлы сфер
- узлы подгрупп
- узлы искажений

### cb_atlas_edges

Сюда загружаются:

- `sphere -> subgroup`
- `subgroup -> bias`
- `bias -> related bias`

## Important Note

Этот seed сейчас:

- очищает `cb_atlas_edges`
- очищает `cb_atlas_nodes`
- очищает `cb_lessons`
- очищает `cb_subgroups`
- очищает `cb_sections`

То есть он предназначен для полной замены текущих demo-заглушек на реальный набор из книги.

## Recommended Next Step

После первой загрузки логично сделать еще один шаг:

- перестроить `data/course-data.ts` и/или `lib/content.ts`, чтобы сайт тоже брал данные из базы, а не только из статических demo-данных.
