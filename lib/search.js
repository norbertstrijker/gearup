// GearUp zoekparser (fase-1, punt C).
// Ontleedt een vrije zoekterm in vier bouwstenen — merk, categorie, onderdeel,
// modelnummer — woordvolgorde-onafhankelijk. De merkenlijst komt live uit de
// database; categorie- en onderdeel-synoniemen staan hier (NL primair, met een
// aantal DE/EN-varianten omdat de markt meertalig is).

// token (lowercase) -> categorie-sleutel
const CATEGORY_SYNONYMS = {
  grasmaaier: 'grasmaaiers', grasmaaiers: 'grasmaaiers', gazonmaaier: 'grasmaaiers',
  maaier: 'grasmaaiers', rasenmaher: 'grasmaaiers', 'rasenmäher': 'grasmaaiers',
  lawnmower: 'grasmaaiers', lawnmowers: 'grasmaaiers', mower: 'grasmaaiers',
  kettingzaag: 'kettingzagen', kettingzagen: 'kettingzagen', kettensage: 'kettingzagen',
  'kettensäge': 'kettingzagen', kettensagen: 'kettingzagen', chainsaw: 'kettingzagen',
  chainsaws: 'kettingzagen',
  bladblazer: 'bladblazers', bladblazers: 'bladblazers', laubblaser: 'bladblazers',
  'laubbläser': 'bladblazers', blower: 'bladblazers', leafblower: 'bladblazers',
  bosmaaier: 'bosmaaiers', bosmaaiers: 'bosmaaiers', motorsense: 'bosmaaiers',
  motorsensen: 'bosmaaiers', brushcutter: 'bosmaaiers', strimmer: 'bosmaaiers',
  heggenschaar: 'heggenscharen', heggenscharen: 'heggenscharen', heckenschere: 'heggenscharen',
  heckenscheren: 'heggenscharen', hedgetrimmer: 'heggenscharen',
  generator: 'generatoren', generatoren: 'generatoren', generators: 'generatoren',
  aggregaat: 'generatoren', stroomaggregaat: 'generatoren',
  accugereedschap: 'accu-gereedschap', 'akku-werkzeug': 'accu-gereedschap',
  powertool: 'accu-gereedschap', powertools: 'accu-gereedschap',
}

// token (lowercase) -> producttype
const PART_SYNONYMS = {
  brandstof: 'brandstof', benzine: 'brandstof', benzin: 'brandstof', fuel: 'brandstof',
  petrol: 'brandstof', mengsmering: 'brandstof', tweetaktolie: 'brandstof',
  bougie: 'bougie', bougies: 'bougie', zundkerze: 'bougie', 'zündkerze': 'bougie',
  sparkplug: 'bougie',
  luchtfilter: 'filter', filter: 'filter', luftfilter: 'filter', airfilter: 'filter',
  ketting: 'ketting', zaagketting: 'ketting', kette: 'ketting', chain: 'ketting',
  maaimes: 'maaimes', mes: 'maaimes', messen: 'maaimes', mahmesser: 'maaimes',
  'mähmesser': 'maaimes', blade: 'maaimes',
  olie: 'olie', motorolie: 'olie', kettingolie: 'olie', oil: 'olie', 'öl': 'olie',
  maaidraad: 'maaidraad', draad: 'maaidraad', trimmerdraad: 'maaidraad', faden: 'maaidraad',
  lader: 'lader', oplader: 'lader', ladegerat: 'lader', 'ladegerät': 'lader', charger: 'lader',
  zaagblad: 'zaagblad', sageblatt: 'zaagblad', 'sägeblatt': 'zaagblad',
  boor: 'boren', boren: 'boren', bohrer: 'boren', drill: 'boren',
}

const STOPWORDS = new Set(['voor', 'van', 'de', 'het', 'een', 'fur', 'für', 'the', 'for', 'mijn', 'op'])

function clean(token) {
  return token
    .toLowerCase()
    .replace(/[.,;:!?]/g, '')
    .trim()
}

// merken: array van merknamen uit de database (bv. ['Honda','Husqvarna',...])
export function parseQuery(query, merken = []) {
  const merkLookup = new Map()
  for (const m of merken) merkLookup.set(m.toLowerCase(), m)

  const tokens = (query || '').split(/\s+/).map(clean).filter(Boolean)

  const out = { merken: [], categorieen: [], onderdelen: [], modelTokens: [] }

  for (const tok of tokens) {
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
