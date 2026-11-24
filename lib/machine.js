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

// Soort van een ketting uit de naam ("zaagketting STIHL Micro 3, ..."). De titel in gewone taal
// staat in messages (soorten.*) en is afgeleid van het kenmerk dat de maker geeft.
const SOORTEN = [
  ['Micro 3', 'micro3'], ['Micro', 'micro'], ['Super 3', 'super3'], ['Super', 'super'],
  ['Hexa 3', 'hexa3'], ['Hexa', 'hexa'], ['Duro 3', 'duro3'],
]
const VOLGORDE = ['micro', 'micro3', 'super', 'super3', 'hexa', 'hexa3', 'duro3'] // licht -> zwaar werk
export function soortVan(onderdeel) {
  if (onderdeel?.producttype !== 'ketting') return null
  const m = (onderdeel.naam || '').match(/STIHL (Micro 3|Micro|Super 3|Super|Hexa 3|Hexa|Duro 3)\b/)
  if (!m) return null
  const key = SOORTEN.find(([n]) => n === m[1])[1]
  return { key, merknaam: 'STIHL ' + m[1] }
}

// Soorten onder elkaar (besluit 18 en 19 nov): groepeer op de voorwaarde vóór de eerste ';'
// (bv. "zwaard 35 cm") plus de maat van het onderdeel; wat na de ';' komt blijft per soort staan (k.rest).
// label: kort voor de keuzeregel ("35 cm", of "35 cm · 1,3 mm" als er bij die lengte meer diktes zijn).
export function groupByCondition(items) {
  const groups = new Map()
  for (const k of items) {
    const gv = (k.geldt_voor || '').trim()
    const i = gv.indexOf(';')
    const cond = i === -1 ? gv : gv.slice(0, i).trim()
    const rest = i === -1 ? '' : gv.slice(i + 1).trim()
    const spec = (k.onderdeel?.specificatie || '').trim()
    const key = [cond, spec].filter(Boolean).join(' · ')
    if (!groups.has(key)) {
      const cm = cond.match(/(\d+(?:\/\d+)*) cm/)
      const mm = spec.match(/(\d+,\d) mm/) || cond.match(/(\d+,\d) mm/)
      groups.set(key, { key, lengte: cm ? cm[1] + ' cm' : '', dikte: mm ? mm[1] + ' mm' : '', items: [] })
    }
    groups.get(key).items.push({ ...k, rest })
  }
  const num = (s) => {
    const m = s.match(/\d+/)
    return m ? Number(m[0]) : Infinity
  }
  const rank = (k) => {
    const sv = soortVan(k.onderdeel)
    return sv ? VOLGORDE.indexOf(sv.key) : VOLGORDE.length
  }
  const list = [...groups.values()].sort((a, b) => num(a.lengte || a.key) - num(b.lengte || b.key) || a.key.localeCompare(b.key))
  const perLengte = {}
  for (const g of list) perLengte[g.lengte] = (perLengte[g.lengte] || 0) + 1
  for (const g of list) {
    g.label = g.lengte ? (perLengte[g.lengte] > 1 && g.dikte ? `${g.lengte} · ${g.dikte}` : g.lengte) : g.key
    g.items.sort(
      (x, y) =>
        (x.standaard === true ? 0 : 1) - (y.standaard === true ? 0 : 1) ||
        rank(x) - rank(y) ||
        (x.status === 'geverifieerd' ? 0 : 1) - (y.status === 'geverifieerd' ? 0 : 1) ||
        x.onderdeel.naam.localeCompare(y.onderdeel.naam)
    )
  }
  return list
}

// Toon de soorten onder elkaar als er meer dan één onderdeel van dit type is.
export function hasChoices(items) {
  return Array.isArray(items) && items.length > 1
}

// Waar staat de pagina van de vervangprocedure? In de handleiding. Is de bron van de koppeling
// zelf een handleiding, dan die; anders (bv. een catalogus) de handleiding van de machine.
export function procedureDoc(k, manualUrl, isValidUrl) {
  const fromManual = /handleiding/.test(k.bron_soort || '')
  return (fromManual && isValidUrl(k.bron_url) && k.bron_url) || manualUrl
}

// Zwaard en ketting in één blok (besluit 19 nov). Groepeert zwaarden (producttype zaagblad) en
// kettingen op lengte + steek + groefbreedte, zodat zwaard en ketting altijd bij elkaar passen.
// Lengte: bij een zwaard uit de specificatie ("35 cm, ..."), bij een ketting uit geldt_voor
// ("zwaard 35 cm" of "zwaard Rollomatic E 30/35/40/45 cm"; dan staat hij bij elke lengte).
const STEEK = /(3\/8" P|3\/8"|\.325"|1\/4" P|1\/4"|\.404")/
export function isBarChain(type) {
  return type === 'ketting' || type === 'zaagblad'
}
export function groupBarChain(items) {
  const groups = new Map()
  const add = (lengte, steek, dikte, k, kind, rest) => {
    const key = [lengte, steek, dikte].join('|')
    if (!groups.has(key)) groups.set(key, { key, lengte, steek, dikte, zwaarden: [], kettingen: [] })
    groups.get(key)[kind].push({ ...k, rest })
  }
  for (const k of items) {
    const o = k.onderdeel || {}
    const spec = `${o.specificatie || ''} ${o.naam || ''}`
    const steek = (spec.match(STEEK) || [])[1] || ''
    const dikte = (spec.match(/(\d,\d) mm/) || [])[1] || ''
    const gv = (k.geldt_voor || '').trim()
    if (o.producttype === 'zaagblad') {
      const cm = (o.specificatie || o.naam || '').match(/(\d+) cm/)
      add(cm ? cm[1] : '', steek, dikte, k, 'zwaarden', gv)
    } else {
      const i = gv.indexOf(';')
      const cond = i === -1 ? gv : gv.slice(0, i)
      const rest = i === -1 ? '' : gv.slice(i + 1).trim()
      const cm = cond.match(/(\d+(?:\/\d+)*) cm/)
      const lengtes = cm ? cm[1].split('/') : ['']
      // Een ketting zonder nummer die voor een hele reeks lengtes geldt: alleen tonen als er bij
      // die lengte geen ketting mét nummer is (zie hieronder).
      for (const l of lengtes) add(l, steek, dikte, { ...k, _breed: lengtes.length > 1 }, 'kettingen', rest)
    }
  }
  const rank = (k) => {
    const sv = soortVan(k.onderdeel)
    return sv ? VOLGORDE.indexOf(sv.key) : VOLGORDE.length
  }
  const sortItems = (xs) =>
    xs.sort(
      (x, y) =>
        (x.standaard === true ? 0 : 1) - (y.standaard === true ? 0 : 1) ||
        (x.onderdeel.fabrieksnummer ? 0 : 1) - (y.onderdeel.fabrieksnummer ? 0 : 1) ||
        rank(x) - rank(y) ||
        x.onderdeel.naam.localeCompare(y.onderdeel.naam)
    )
  const list = [...groups.values()]
  for (const g of list) {
    if (g.kettingen.some((k) => k.onderdeel.fabrieksnummer)) {
      g.kettingen = g.kettingen.filter((k) => k.onderdeel.fabrieksnummer || !k._breed)
    }
    sortItems(g.zwaarden)
    sortItems(g.kettingen)
    g.standaard = [...g.zwaarden, ...g.kettingen].some((k) => k.standaard === true)
  }
  list.sort((a, b) => (Number(a.lengte) || 999) - (Number(b.lengte) || 999) || a.steek.localeCompare(b.steek) || a.dikte.localeCompare(b.dikte))
  // Label: lengte; steek en groefbreedte erbij als die bij dezelfde lengte verschillen.
  for (const g of list) {
    const zelfde = list.filter((x) => x.lengte === g.lengte)
    const parts = [g.lengte ? g.lengte + ' cm' : '?']
    if (new Set(zelfde.map((x) => x.steek)).size > 1) parts.push(g.steek)
    if (new Set(zelfde.map((x) => x.dikte)).size > 1) parts.push(g.dikte + ' mm')
    g.label = parts.join(' · ')
  }
  return list
}

// Brandstof (besluit 22 nov): splitst de brandstofkoppelingen in kant-en-klaar en zelf mengen.
// Per mengverhouding: ml olie per liter benzine en een korte omschrijving van de olie, afgeleid
// van de voorwaarden uit de handleiding. De volledige voorwaarden blijven bij de koppeling staan.
export function isFuelMix(items) {
  return (items || []).some((k) => /mengsmering|kant-en-klare/.test(k.onderdeel?.naam || ''))
}
export function fuelParts(items) {
  // Kant-en-klaar (besluit 24 nov): per soort een eigen onderdeel met fabrieksnummer (bijv. MotoMix, MotoMix Eco 20).
  const kantEnKlaar = []
  const mengen = []
  for (const k of items || []) {
    const naam = k.onderdeel?.naam || ''
    const gv = k.geldt_voor || ''
    if (/kant-en-klare/.test(naam)) {
      // Oud algemeen record zonder nummer (van vóór 24 nov): alleen tonen als er geen soort met nummer is.
      kantEnKlaar.push({ k, naam: naam.replace(/^kant-en-klare 2-taktbrandstof /, ''), nummer: k.onderdeel?.fabrieksnummer || null })
      continue
    }
    const r = (naam + ' ' + (k.onderdeel?.specificatie || '')).match(/1:(\d+)/)
    if (!r) continue
    const deel = Number(r[1])
    // Eerste voorwaarde, zonder wat tussen haakjes staat (daar staat vaak een verwijzing naar de andere verhouding).
    const eerste = gv.split(';')[0].replace(/\([^)]*\)/g, '')
    let olie = 'algemeen'
    if (/ander merk/.test(eerste) || (deel !== 50 && /ander merk/.test(gv))) olie = 'ander_merk'
    else if (/JASO/.test(eerste)) olie = 'stihl_of_jaso'
    else if (/STIHL/.test(eerste)) olie = 'stihl'
    mengen.push({ k, verhouding: '1:' + deel, ml: Math.round(1000 / deel), olie, deel })
  }
  const metNummer = kantEnKlaar.filter((x) => x.nummer)
  mengen.sort((a, b) => b.deel - a.deel)
  return { kantEnKlaar: metNummer.length ? metNummer : kantEnKlaar, mengen }
}
