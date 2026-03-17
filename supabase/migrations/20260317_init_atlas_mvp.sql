create extension if not exists "pgcrypto";

create table if not exists public.cb_users (
  id uuid primary key default gen_random_uuid(),
  tg_id text unique not null,
  tg_username text,
  first_name text,
  last_name text,
  phone text,
  email text,
  marketing_consent boolean not null default false,
  profile_city_region text,
  profile_format text,
  profile_stage text,
  profile_size text,
  profile_finance_level text,
  profile_client_base text,
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cb_sections (
  id text primary key,
  slug text unique not null,
  title text not null,
  description text not null,
  sort_order integer not null default 0
);

create table if not exists public.cb_lessons (
  id text primary key,
  slug text unique not null,
  section_id text not null references public.cb_sections(id) on delete cascade,
  sort_order integer not null default 0,
  title text not null,
  short_text text not null,
  full_text text not null,
  ai_context text not null,
  ai_suggestions_json jsonb not null default '[]'::jsonb,
  image_url text,
  atlas_node_id text,
  related_slugs jsonb not null default '[]'::jsonb,
  source_book_ref text,
  source_atlas_ref text,
  category text not null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.cb_user_lessons (
  id uuid primary key default gen_random_uuid(),
  user_tg_id text not null references public.cb_users(tg_id) on delete cascade,
  lesson_id text not null references public.cb_lessons(id) on delete cascade,
  status text not null default 'new' check (status in ('new', 'in_progress', 'completed')),
  last_opened_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_tg_id, lesson_id)
);

create table if not exists public.cb_saved_lessons (
  id uuid primary key default gen_random_uuid(),
  user_tg_id text not null references public.cb_users(tg_id) on delete cascade,
  lesson_id text not null references public.cb_lessons(id) on delete cascade,
  saved_at timestamptz not null default now(),
  unique(user_tg_id, lesson_id)
);

create table if not exists public.cb_atlas_nodes (
  id text primary key,
  slug text unique not null,
  title text not null,
  category text not null,
  x numeric not null,
  y numeric not null,
  size numeric not null default 1,
  color_token text not null,
  lesson_id text references public.cb_lessons(id) on delete set null,
  short_text text not null
);

create table if not exists public.cb_atlas_edges (
  id text primary key,
  from_node_id text not null references public.cb_atlas_nodes(id) on delete cascade,
  to_node_id text not null references public.cb_atlas_nodes(id) on delete cascade,
  relation_type text not null,
  relation_label text not null,
  weight integer not null default 1
);

create table if not exists public.cb_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  tg_username text,
  tg_id text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  consent_email boolean not null default false,
  consent_terms boolean not null default false,
  bound_user_id uuid references public.cb_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.cb_ai_threads (
  id uuid primary key default gen_random_uuid(),
  user_tg_id text not null references public.cb_users(tg_id) on delete cascade,
  lesson_id text not null references public.cb_lessons(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'archived')),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_tg_id, lesson_id)
);

create table if not exists public.cb_ai_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.cb_ai_threads(id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant')),
  message_text text not null,
  message_type text not null default 'text' check (message_type in ('text', 'voice')),
  provider text not null,
  model text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cb_ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_tg_id text not null references public.cb_users(tg_id) on delete cascade,
  lesson_id text not null references public.cb_lessons(id) on delete cascade,
  provider text not null,
  model text not null,
  input_tokens integer,
  output_tokens integer,
  status text not null default 'ok',
  created_at timestamptz not null default now()
);

create table if not exists public.cb_products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  title text not null,
  description text not null,
  type text not null check (type in ('quiz_pack')),
  price_xtr integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.cb_purchases (
  id uuid primary key default gen_random_uuid(),
  user_tg_id text not null references public.cb_users(tg_id) on delete cascade,
  product_sku text not null references public.cb_products(sku) on delete restrict,
  provider text not null default 'telegram_stars',
  amount_xtr integer not null,
  status text not null check (status in ('pending', 'paid', 'refunded', 'failed')),
  invoice_payload text not null,
  telegram_payment_charge_id text,
  purchased_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.cb_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_tg_id text not null references public.cb_users(tg_id) on delete cascade,
  scope_type text not null default 'quiz_pack',
  scope_id text,
  product_sku text not null references public.cb_products(sku) on delete restrict,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  purchase_id uuid references public.cb_purchases(id) on delete set null
);

create table if not exists public.cb_quizzes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  section_id text not null references public.cb_sections(id) on delete cascade,
  description text not null,
  product_sku text not null references public.cb_products(sku) on delete restrict,
  sort_order integer not null default 0,
  is_public_preview boolean not null default false,
  teaser text not null
);

create table if not exists public.cb_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.cb_quizzes(id) on delete cascade,
  question_text text not null,
  question_type text not null default 'single_choice',
  options_json jsonb not null,
  correct_answer_json jsonb not null,
  explanation text,
  lesson_id text references public.cb_lessons(id) on delete set null,
  sort_order integer not null default 0
);

create table if not exists public.cb_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_tg_id text not null references public.cb_users(tg_id) on delete cascade,
  quiz_id uuid not null references public.cb_quizzes(id) on delete cascade,
  score integer,
  answers_json jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.cb_events (
  id uuid primary key default gen_random_uuid(),
  user_tg_id text references public.cb_users(tg_id) on delete set null,
  lead_id uuid references public.cb_leads(id) on delete set null,
  event_name text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cb_user_lessons_user_status_idx on public.cb_user_lessons (user_tg_id, status);
create index if not exists cb_saved_lessons_user_idx on public.cb_saved_lessons (user_tg_id);
create index if not exists cb_atlas_nodes_category_idx on public.cb_atlas_nodes (category);
create index if not exists cb_ai_messages_thread_idx on public.cb_ai_messages (thread_id, created_at desc);
create index if not exists cb_entitlements_user_product_idx on public.cb_entitlements (user_tg_id, product_sku);
create index if not exists cb_events_user_idx on public.cb_events (user_tg_id, created_at desc);
