-- Agregar descripcion e imagen a categories
alter table public.categories
  add column if not exists descripcion text,
  add column if not exists imagen text;
