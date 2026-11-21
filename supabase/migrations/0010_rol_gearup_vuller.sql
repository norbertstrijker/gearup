-- 0010 Rol gearup_vuller (besluit Norbert 21 nov 2026): Claude laadt goedgekeurde porties met beperkte rechten.
-- Mag alleen rijen lezen, toevoegen, wijzigen en verwijderen in de vier GearUp-tabellen van het vulsysteem.
-- Mag geen tabellen aanmaken, wijzigen of weggooien, niet bij andere tabellen, niet bij auth.
-- Het wachtwoord staat NIET in dit bestand: dat stelt Norbert apart in (zie onderaan).
-- Twee keer draaien kan geen kwaad.

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'gearup_vuller') then
    create role gearup_vuller with login noinherit nocreatedb nocreaterole;
  end if;
end $$;

grant usage on schema public to gearup_vuller;
grant select, insert, update, delete on
  public.gearup_machines, public.gearup_onderdelen, public.gearup_koppelingen, public.gearup_merk_aliassen
  to gearup_vuller;

-- tellers (id's) van alleen deze tabellen
do $$
declare t text; s text;
begin
  foreach t in array array['gearup_machines', 'gearup_onderdelen', 'gearup_koppelingen', 'gearup_merk_aliassen'] loop
    for s in select pg_get_serial_sequence('public.' || t, a.attname)
             from pg_attribute a where a.attrelid = ('public.' || t)::regclass and a.attnum > 0 and not a.attisdropped
    loop
      if s is not null then execute format('grant usage, select on sequence %s to gearup_vuller', s); end if;
    end loop;
  end loop;
end $$;

-- row level security staat aan op deze tabellen: deze rol mag er alles in (en nergens anders)
do $$
declare t text;
begin
  foreach t in array array['gearup_machines', 'gearup_onderdelen', 'gearup_koppelingen', 'gearup_merk_aliassen'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'vuller_alles') then
      execute format('create policy vuller_alles on public.%I for all to gearup_vuller using (true) with check (true)', t);
    end if;
  end loop;
end $$;

-- Daarna, apart en NIET opslaan in een bestand (Norbert, in de SQL-editor):
--   alter role gearup_vuller with password 'kies-een-lang-wachtwoord-met-alleen-letters-en-cijfers';
-- Verbinding via de Session pooler: gebruiker gearup_vuller.<projectkenmerk>, zelfde server en poort.
