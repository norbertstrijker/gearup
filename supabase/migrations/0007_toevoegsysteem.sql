-- GearUp — toevoegsysteem (afvinklijst taak 10), 7 nov 2026
-- Eisen: GearUp_Eisen_Toevoegsysteem.md (versie 1). Werkwijze: GearUp_Werkwijze_Toevoegen.md.
-- Additief en idempotent: twee keer draaien geeft geen fout. Bestaande kolommen en gedrag blijven.
-- Volgorde in productie: na 0004 en 0006 (de oude machines zijn dan weg, dus de slug is uniek).
-- EERST op de testdatabase.

-- 1) Sleutels waarop het laden samenvoegt (eisen §5)
--    Machine: slug = merk + model + uitvoering (al aanwezig, nu uniek).
create unique index if not exists gearup_machines_slug_uniek
  on public.gearup_machines (slug);

--    Onderdeel: sleutel volgens eisen §5 (fabrieksnummer, universeel type of maat), gemaakt door het script.
alter table public.gearup_onderdelen
  add column if not exists sleutel text;
create unique index if not exists gearup_onderdelen_sleutel_uniek
  on public.gearup_onderdelen (sleutel) where sleutel is not null;

--    Koppeling: één per machine + onderdeel + "geldt voor".
create unique index if not exists gearup_koppelingen_uniek
  on public.gearup_koppelingen (machine_id, onderdeel_id, (coalesce(geldt_voor, '')));

-- 2) Herkomst per portie (logboek, terugdraaien, risico R7 en R8)
alter table public.gearup_machines
  add column if not exists portie text,
  add column if not exists bijgewerkt_portie text;
alter table public.gearup_onderdelen
  add column if not exists portie text,
  add column if not exists bijgewerkt_portie text;
alter table public.gearup_koppelingen
  add column if not exists portie text,
  add column if not exists bijgewerkt_portie text;

-- 3) Tweede bron voor dezelfde koppeling (eisen §3: via beide routes binnen = één koppeling, met beide bronnen)
alter table public.gearup_koppelingen
  add column if not exists extra_bronnen jsonb not null default '[]'::jsonb;
