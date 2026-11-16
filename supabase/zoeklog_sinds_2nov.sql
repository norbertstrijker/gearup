-- GearUp — alleen lezen: de zoekopdrachten van na 2 november 2026 (stand toen: 1.811).
-- Verandert niets. Draaien in de SQL-editor; de uitkomst (één tabel) terugsturen.
select to_char(created_at at time zone 'Europe/Amsterdam', 'YYYY-MM-DD HH24:MI') as tijd,
       taal, gevonden, left(invoer, 80) as invoer
from public.gearup_zoekopdrachten
where created_at >= '2026-11-02'
order by created_at;
