// Hulpfuncties voor de machinepagina. Alleen feiten uit de database; geen tekst verzinnen.

// Volgorde waarin producttypes op de pagina komen. Wat hier niet staat, komt erachter (alfabetisch).
const ORDER = [
  'brandstof', 'olie', 'bougie', 'filter', 'ketting', 'zaagblad', 'kettingwiel',
  'maaikop', 'maaidraad', 'spoelkap', 'maaimes', 'mesbalk', 'tegenmes',
  'opvangzak', 'beschermkap', 'draagstel', 'accu', 'lader',
  'carburateur', 'v-snaar', 'trekstarter', 'startkoord', 'brandstofleiding', 'primer', 'wiel', 'pomp',
]

// Groepeert koppelingen per producttype. Het gezochte onderdeel (?onderdeel=...) komt bovenaan
// en staat open.
export function groupParts(koppelingen, highlight) {
  const byType = new Map()
  for (const k of koppelingen) {
    if (!k.onderdeel) continue
    const type = k.onderdeel.producttype
    if (!byType.has(type)) byType.set(type, [])
    byType.get(type).push(k)
  }
  const rank = (type) => {
    if (type === highlight) return -1
    const i = ORDER.indexOf(type)
    return i === -1 ? ORDER.length : i
  }
  return [...byType.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([producttype, items]) => ({
      producttype,
      highlight: producttype === highlight,
      // Geverifieerd eerst, daarna op naam
      items: items.sort(
        (x, y) =>
          (x.status === 'geverifieerd' ? 0 : 1) - (y.status === 'geverifieerd' ? 0 : 1) ||
          x.onderdeel.naam.localeCompare(y.onderdeel.naam)
      ),
    }))
}

// Het nummer waarmee je dit onderdeel koopt: fabrieksnummer van de maker, anders het universele type.
export function partNumber(onderdeel) {
  if (onderdeel?.fabrieksnummer) return { kind: 'fabrieksnummer', value: onderdeel.fabrieksnummer }
  if (onderdeel?.universeel_type) return { kind: 'type', value: onderdeel.universeel_type }
  return null
}

// vervang_pagina heeft de vorm "de:34; nl:138". Geeft de pagina in de taal van de bezoeker,
// anders de eerste die er staat.
export function pageForLocale(value, locale) {
  if (!value || typeof value !== 'string') return null
  const pairs = value
    .split(';')
    .map((p) => p.trim().split(':').map((x) => x.trim()))
    .filter(([lang, page]) => lang && /^\d+$/.test(page || ''))
    .map(([lang, page]) => ({ lang, page: Number(page) }))
  if (!pairs.length) return null
  return pairs.find((p) => p.lang === locale) || pairs[0]
}

// Brandstoffeiten van de machine (recordeisen A8).
export function fuelFacts(machine) {
  const meng = machine.mengverhouding || null
  const raw = machine.e10_geschikt
  const e10 =
    raw === true || raw === 'ja' ? 'ja' : raw === false || raw === 'nee' ? 'nee' : raw === 'onbekend' ? 'onbekend' : null
  return {
    meng,
    e10,
    // Viertakt op mengsmering (bv. Stihl 4-MIX): besluit 14 nov, LET OP op de site.
    fourMix: machine.motortype === '4-takt' && Boolean(meng),
  }
}
