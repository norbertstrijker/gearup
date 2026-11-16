-- Zoeklog voor taak 4 (7 nov 2026). Alleen lezen, verandert niets.
-- Draaien in de SQL editor van het project "fuelguide" en het resultaat downloaden als CSV
-- naar C:\Users\sdkom\gearup\supabase\zoeklog_2026-11-07.csv
select lower(trim(invoer))            as invoer,
       taal,
       count(*)                       as aantal,
       sum(case when gevonden then 1 else 0 end) as gevonden,
       min(created_at)::date          as eerste,
       max(created_at)::date          as laatste
from public.gearup_zoekopdrachten
group by 1, 2
order by aantal desc;
