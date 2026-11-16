-- GearUp — pagina van de vervangprocedure per koppeling (besluit Norbert, 14 nov 2026).
-- Additief en idempotent. Staat ook bovenaan elk laadbestand, zodat Norbert niets apart hoeft te draaien.
alter table public.gearup_koppelingen add column if not exists vervang_pagina text;
