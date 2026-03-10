-- Split nombre_apellido into nombre and apellido
alter table public.users add column nombre text not null default '';
alter table public.users add column apellido text not null default '';

-- Migrate existing data (put everything in nombre)
update public.users set nombre = nombre_apellido;

-- Drop old column
alter table public.users drop column nombre_apellido;

-- Update the trigger function for new auth users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, nombre, apellido)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.raw_user_meta_data->>'apellido', '')
  );
  return new;
end;
$$ language plpgsql security definer;
