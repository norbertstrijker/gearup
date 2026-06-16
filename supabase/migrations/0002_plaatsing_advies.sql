-- GearUp — twee-delige uitleg op de resultaatpagina (fase-1 finetuning, punt F)
-- Draai dit in de Supabase SQL-editor.
--
-- gearup_uitleg krijgt een tweede tekstlaag:
--   * uitleg_tekst   = KEUZE-advies  ("waar let je op bij het kiezen van dit onderdeel")
--   * plaatsing_advies = PLAATSINGS-advies ("waar let je op bij het monteren",
--                        veilig/algemeen; de app toont er automatisch de zin
--                        "raadpleeg voor de exacte procedure de handleiding" bij)
--   * waarschuwing   = blijft de korte rode waarschuwing
--
-- Additief en idempotent. Teksten lever je later aan; leeg = blok wordt niet getoond.

alter table public.gearup_uitleg
  add column if not exists plaatsing_advies text;
