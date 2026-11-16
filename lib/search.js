// GearUp zoekparser (fase-1, punt C).
// Ontleedt een vrije zoekterm in vier bouwstenen — merk, categorie, onderdeel,
// modelnummer — woordvolgorde-onafhankelijk. De merkenlijst komt live uit de
// database; categorie- en onderdeel-synoniemen staan hier (NL primair, met een
// aantal DE/EN-varianten omdat de markt meertalig is).

// token (lowercase) -> categorie-sleutel (zoals in de database, enkelvoud)
const CATEGORY_SYNONYMS = {
  grasmaaier: 'grasmaaier', grasmaaiers: 'grasmaaier', gazonmaaier: 'grasmaaier', maaier: 'grasmaaier',
  rasenmaher: 'grasmaaier', 'rasenmäher': 'grasmaaier', lawnmower: 'grasmaaier', lawnmowers: 'grasmaaier',
  mower: 'grasmaaier',
  zitmaaier: 'zitmaaier', zitmaaiers: 'zitmaaier', tuintrekker: 'zitmaaier', 'aufsitzmäher': 'zitmaaier',
  rasentraktor: 'zitmaaier', 'ride-on': 'zitmaaier', tractor: 'zitmaaier',
  robotmaaier: 'robotmaaier', robotmaaiers: 'robotmaaier', 'mähroboter': 'robotmaaier',
  maehroboter: 'robotmaaier', robotmower: 'robotmaaier',
  kettingzaag: 'kettingzaag', kettingzagen: 'kettingzaag', motorzaag: 'kettingzaag', kettensage: 'kettingzaag',
  'kettensäge': 'kettingzaag', motorsäge: 'kettingzaag', chainsaw: 'kettingzaag', chainsaws: 'kettingzaag',
  bosmaaier: 'bosmaaier', bosmaaiers: 'bosmaaier', motorsense: 'bosmaaier', motorsensen: 'bosmaaier',
  freischneider: 'bosmaaier', brushcutter: 'bosmaaier', strimmer: 'bosmaaier',
  grastrimmer: 'grastrimmer', grastrimmers: 'grastrimmer', trimmer: 'grastrimmer', rasentrimmer: 'grastrimmer',
  heggenschaar: 'heggenschaar', heggenscharen: 'heggenschaar', heckenschere: 'heggenschaar',
  heckenscheren: 'heggenschaar', hedgetrimmer: 'heggenschaar',
  bladblazer: 'bladblazer', bladblazers: 'bladblazer', laubblaser: 'bladblazer', 'laubbläser': 'bladblazer',
  blower: 'bladblazer', leafblower: 'bladblazer', bladzuiger: 'bladblazer',
  hogedrukreiniger: 'hogedrukreiniger', hogedrukreinigers: 'hogedrukreiniger', hochdruckreiniger: 'hogedrukreiniger',
  'pressure-washer': 'hogedrukreiniger', pressurewasher: 'hogedrukreiniger',
  verticuteermachine: 'verticuteermachine', verticuteerder: 'verticuteermachine', vertikutierer: 'verticuteermachine',
  scarifier: 'verticuteermachine',
  hakselaar: 'hakselaar', hakselaars: 'hakselaar', versnipperaar: 'hakselaar', 'häcksler': 'hakselaar',
  hacksler: 'hakselaar', shredder: 'hakselaar', chipper: 'hakselaar',
}

// token (lowercase) -> producttype (zoals in vullen/indeling.json)
const PART_SYNONYMS = {
  brandstof: 'brandstof', benzine: 'brandstof', benzin: 'brandstof', fuel: 'brandstof',
  petrol: 'brandstof', mengsmering: 'brandstof', tweetaktolie: 'brandstof', mengolie: 'brandstof',
  bougie: 'bougie', bougies: 'bougie', zundkerze: 'bougie', 'zündkerze': 'bougie', sparkplug: 'bougie',
  luchtfilter: 'filter', filter: 'filter', luftfilter: 'filter', airfilter: 'filter',
  ketting: 'ketting', zaagketting: 'ketting', kette: 'ketting', 'sägekette': 'ketting', chain: 'ketting',
  zwaard: 'zaagblad', zaagblad: 'zaagblad', schiene: 'zaagblad', 'führungsschiene': 'zaagblad', bar: 'zaagblad',
  maaimes: 'maaimes', mes: 'maaimes', messen: 'maaimes', grassnijblad: 'maaimes', mahmesser: 'maaimes',
  'mähmesser': 'maaimes', blade: 'maaimes', messer: 'maaimes',
  olie: 'olie', motorolie: 'olie', kettingolie: 'olie', oil: 'olie', 'öl': 'olie',
  maaidraad: 'maaidraad', draad: 'maaidraad', trimmerdraad: 'maaidraad', faden: 'maaidraad',
  'mähfaden': 'maaidraad', line: 'maaidraad',
  maaikop: 'maaikop', draadkop: 'maaikop', 'mähkopf': 'maaikop', fadenkopf: 'maaikop',
  opvangzak: 'opvangzak', grasbak: 'opvangzak', fangsack: 'opvangzak',
  beschermkap: 'beschermkap', schutzhaube: 'beschermkap',
  draagstel: 'draagstel', draaggordel: 'draagstel', tragegurt: 'draagstel', harness: 'draagstel',
  accu: 'accu', batterij: 'accu', akku: 'accu', battery: 'accu',
  lader: 'lader', oplader: 'lader', ladegerat: 'lader', 'ladegerät': 'lader', charger: 'lader',
  carburateur: 'carburateur', vergaser: 'carburateur', carburettor: 'carburateur', carburetor: 'carburateur',
  'v-snaar': 'v-snaar', vsnaar: 'v-snaar', snaar: 'v-snaar', keilriemen: 'v-snaar', belt: 'v-snaar',
  trekstarter: 'trekstarter', starter: 'trekstarter', seilzugstarter: 'trekstarter',
  startkoord: 'startkoord', anwerfseil: 'startkoord', 'starter-cord': 'startkoord',
  kettingwiel: 'kettingwiel', kettenrad: 'kettingwiel', sprocket: 'kettingwiel',
  wiel: 'wiel', rad: 'wiel', wheel: 'wiel',
  pomp: 'pomp', pumpe: 'pomp', pump: 'pomp',
}

const STOPWORDS = new Set(['voor', 'van', 'de', 'het', 'een', 'fur', 'für', 'the', 'for', 'mijn', 'op'])

function clean(token) {
  return token
    .toLowerCase()
    .replace(/[.,;:!?]/g, '')
    .trim()
}

// merken: array van merknamen uit de database (bv. ['Honda','Husqvarna',...])
// aliassen: optioneel { 'andreas stihl': 'Stihl', 'kaercher': 'Kärcher', ... } uit gearup_merk_aliassen
export function parseQuery(query, merken = [], aliassen = {}) {
  const merkLookup = new Map()
  for (const m of merken) merkLookup.set(m.toLowerCase(), m)
  for (const [alias, merk] of Object.entries(aliassen)) {
    if (!merkLookup.has(alias.toLowerCase())) merkLookup.set(alias.toLowerCase(), merk)
  }

  const tokens = (query || '').split(/\s+/).map(clean).filter(Boolean)

  const out = { merken: [], categorieen: [], onderdelen: [], modelTokens: [] }

  // Merknamen van twee of drie woorden ("john deere", "oleo mac", "black & decker"):
  // eerst de langste combinatie proberen, ook zonder spatie ("oleomac").
  const merged = []
  for (let i = 0; i < tokens.length; i++) {
    let hit = null
    for (const n of [3, 2]) {
      if (i + n > tokens.length) continue
      const part = tokens.slice(i, i + n)
      const cands = [part.join(' '), part.join(''), part.join('-')]
      const found = cands.find((c) => merkLookup.has(c))
      if (found) { hit = { tok: found, n }; break }
    }
    if (hit) { merged.push(hit.tok); i += hit.n - 1 } else merged.push(tokens[i])
  }

  for (const tok of merged) {
    if (merkLookup.has(tok)) {
      const canon = merkLookup.get(tok)
      if (!out.merken.includes(canon)) out.merken.push(canon)
    } else if (CATEGORY_SYNONYMS[tok]) {
      const c = CATEGORY_SYNONYMS[tok]
      if (!out.categorieen.includes(c)) out.categorieen.push(c)
    } else if (PART_SYNONYMS[tok]) {
      const p = PART_SYNONYMS[tok]
      if (!out.onderdelen.includes(p)) out.onderdelen.push(p)
    } else if (!STOPWORDS.has(tok)) {
      out.modelTokens.push(tok)
    }
  }
  return out
}
