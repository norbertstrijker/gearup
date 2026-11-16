import { supabaseServer } from '@/lib/supabase-server'

// Brandstof-afleiding: puur feitelijk, uit bestaande gearup_machines-velden.
// (Geen prozatekst — die komt uit gearup_uitleg en lever je later aan.)
export function fuelInfo(machine) {
  const mt = machine.motortype // '4-takt' | '2-takt' | 'accu'
  if (mt === 'accu') {
    return { applies: false, motortype: mt }
  }
  // Mengsmering bij een tweetakt, én bij een viertakt met mengverhouding (Stihl 4-MIX, besluit 14 nov).
  const mix = mt === '2-takt' || Boolean(machine.mengverhouding)
  const raw = machine.e10_geschikt
  return {
    applies: true,
    motortype: mt,
    brandstofKey: mix ? 'mengsmering' : 'euro95',
    meng: mix ? machine.mengverhouding || null : null,
    // database: 'ja' | 'nee' | 'onbekend' (oude data: true | false)
    e10: raw === true || raw === 'ja' ? true : raw === false || raw === 'nee' ? false : null,
  }
}

// Sleutel waarop een onderdeel-blok zijn uitlegtekst zoekt in gearup_uitleg.
// Brandstof heeft twee feitelijke varianten (4-takt / 2-takt).
export function uitlegKey(producttype, machine) {
  if (producttype === 'brandstof') {
    const variant = machine.motortype === '2-takt' ? '2takt' : '4takt'
    return `brandstof-${variant}`
  }
  return producttype
}

// Primair onderdeel dat bovenaan (de hero) komt: brandstof indien van toepassing.
export function primaryType(relevantTypes, machine) {
  if (machine.motortype !== 'accu' && relevantTypes.includes('brandstof')) {
    return 'brandstof'
  }
  return relevantTypes[0] || null
}

// Leest gearup_uitleg defensief in. Bestaat de tabel nog niet (migratie niet
// gedraaid) of is hij leeg, dan geven we een lege map terug en degradeert de
// pagina naar 'alleen koopopties' zonder te breken.
export async function fetchUitleg(locale) {
  try {
    // select('*') i.p.v. expliciete kolommen: zo blijft het werken ongeacht of
    // migratie 0002 (plaatsing_advies) al gedraaid is.
    const { data, error } = await supabaseServer
      .from('gearup_uitleg')
      .select('*')
      .eq('taal', locale)
    if (error || !data) return {}
    const map = {}
    for (const row of data) {
      map[row.onderdeel_categorie] = {
        titel: row.titel || null,
        keuze: row.uitleg_tekst || null,
        plaatsing: row.plaatsing_advies || null,
        waarschuwing: row.waarschuwing || null,
      }
    }
    return map
  } catch {
    return {}
  }
}
