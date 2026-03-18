create table if not exists public.cb_subgroups (
  id text primary key,
  slug text unique not null,
  section_id text not null references public.cb_sections(id) on delete cascade,
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  color_token text not null default 'soft-blue'
);

alter table public.cb_lessons
  add column if not exists subgroup_id text references public.cb_subgroups(id) on delete set null,
  add column if not exists title_en text,
  add column if not exists aliases_ru jsonb not null default '[]'::jsonb,
  add column if not exists aliases_en jsonb not null default '[]'::jsonb,
  add column if not exists mechanism text,
  add column if not exists why_it_matters text,
  add column if not exists everyday_examples_json jsonb not null default '[]'::jsonb,
  add column if not exists work_examples_json jsonb not null default '[]'::jsonb,
  add column if not exists signals_json jsonb not null default '[]'::jsonb,
  add column if not exists antidotes_json jsonb not null default '[]'::jsonb,
  add column if not exists self_check_questions_json jsonb not null default '[]'::jsonb,
  add column if not exists difficulty text,
  add column if not exists atlas_blurb text,
  add column if not exists image_prompt text,
  add column if not exists source_refs_json jsonb not null default '[]'::jsonb,
  add column if not exists confidence numeric;

alter table public.cb_atlas_nodes
  add column if not exists node_type text not null default 'bias',
  add column if not exists section_id text references public.cb_sections(id) on delete set null,
  add column if not exists subgroup_id text references public.cb_subgroups(id) on delete set null;

create index if not exists cb_subgroups_section_idx on public.cb_subgroups (section_id, sort_order);
create index if not exists cb_lessons_subgroup_idx on public.cb_lessons (subgroup_id, sort_order);
create index if not exists cb_atlas_nodes_node_type_idx on public.cb_atlas_nodes (node_type);
