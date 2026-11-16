-- GearUp — huidige stand vastleggen (stap 1 van de database-aanpassing, 2 nov 2026)
-- ALLEEN LEZEN: deze query verandert niets in de database.
-- Draai in Supabase: Project → SQL Editor → New query → plakken → Run.
-- Stuur het resultaat (de tabel onderaan) terug, of klik "Download CSV".

select 'kolom' as soort, c.table_name as tabel, c.column_name as naam,
       c.data_type || coalesce('(' || c.character_maximum_length || ')', '') as type,
       c.is_nullable as leeg_toegestaan, coalesce(c.column_default, '') as standaard
from information_schema.columns c
where c.table_schema = 'public' and c.table_name like 'gearup\_%'
union all
select 'aantal rijen', 'gearup_machines', count(*)::text, '', '', '' from public.gearup_machines
union all
select 'aantal rijen', 'gearup_producten', count(*)::text, '', '', '' from public.gearup_producten
union all
select 'aantal rijen', 'gearup_uitleg', count(*)::text, '', '', '' from public.gearup_uitleg
union all
select 'aantal rijen', 'gearup_zoekopdrachten', count(*)::text, '', '', '' from public.gearup_zoekopdrachten
union all
select 'beveiliging', tablename, policyname, cmd, array_to_string(roles, ','), coalesce(qual, '')
from pg_policies where schemaname = 'public' and tablename like 'gearup\_%'
order by 1, 2, 3;
