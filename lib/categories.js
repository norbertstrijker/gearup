// Categorieën van de livegang (besluit: alleen tuingereedschap).
// De sleutel is de waarde zoals die in de database staat (gearup_machines.categorie,
// enkelvoud, zie vullen/indeling.json). De slug is wat in de URL staat (meervoud, per taal).
export const CATEGORIES = {
  grasmaaier: {
    slugs: { nl: 'grasmaaiers', de: 'rasenmaeher', en: 'lawnmowers' },
    names: { nl: 'Grasmaaiers', de: 'Rasenmäher', en: 'Lawnmowers' },
    emoji: '🌿',
  },
  zitmaaier: {
    slugs: { nl: 'zitmaaiers', de: 'aufsitzmaeher', en: 'ride-on-mowers' },
    names: { nl: 'Zitmaaiers', de: 'Aufsitzmäher', en: 'Ride-on mowers' },
    emoji: '🚜',
  },
  robotmaaier: {
    slugs: { nl: 'robotmaaiers', de: 'maehroboter', en: 'robot-mowers' },
    names: { nl: 'Robotmaaiers', de: 'Mähroboter', en: 'Robot mowers' },
    emoji: '🤖',
  },
  kettingzaag: {
    slugs: { nl: 'kettingzagen', de: 'kettensaegen', en: 'chainsaws' },
    names: { nl: 'Kettingzagen', de: 'Kettensägen', en: 'Chainsaws' },
    emoji: '🪚',
  },
  bosmaaier: {
    slugs: { nl: 'bosmaaiers', de: 'motorsensen', en: 'brush-cutters' },
    names: { nl: 'Bosmaaiers', de: 'Motorsensen', en: 'Brush cutters' },
    emoji: '🌾',
  },
  grastrimmer: {
    slugs: { nl: 'grastrimmers', de: 'rasentrimmer', en: 'grass-trimmers' },
    names: { nl: 'Grastrimmers', de: 'Rasentrimmer', en: 'Grass trimmers' },
    emoji: '🌱',
  },
  heggenschaar: {
    slugs: { nl: 'heggenscharen', de: 'heckenscheren', en: 'hedge-trimmers' },
    names: { nl: 'Heggenscharen', de: 'Heckenscheren', en: 'Hedge trimmers' },
    emoji: '✂️',
  },
  bladblazer: {
    slugs: { nl: 'bladblazers', de: 'laubblaeser', en: 'leaf-blowers' },
    names: { nl: 'Bladblazers', de: 'Laubbläser', en: 'Leaf blowers' },
    emoji: '💨',
  },
  hogedrukreiniger: {
    slugs: { nl: 'hogedrukreinigers', de: 'hochdruckreiniger', en: 'pressure-washers' },
    names: { nl: 'Hogedrukreinigers', de: 'Hochdruckreiniger', en: 'Pressure washers' },
    emoji: '💦',
  },
  verticuteermachine: {
    slugs: { nl: 'verticuteermachines', de: 'vertikutierer', en: 'scarifiers' },
    names: { nl: 'Verticuteermachines', de: 'Vertikutierer', en: 'Scarifiers' },
    emoji: '🪴',
  },
  hakselaar: {
    slugs: { nl: 'hakselaars', de: 'haecksler', en: 'garden-shredders' },
    names: { nl: 'Hakselaars', de: 'Häcksler', en: 'Garden shredders' },
    emoji: '🍂',
  },
}

export function categoryFromSlug(slug, locale) {
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    if (cat.slugs[locale] === slug) return key
  }
  return null
}

export function categorySlug(key, locale) {
  return CATEGORIES[key]?.slugs[locale] || null
}

export function categoryName(key, locale) {
  return CATEGORIES[key]?.names[locale] || null
}

export function categoryEmoji(key) {
  return CATEGORIES[key]?.emoji || '🔧'
}

export function allCategoryKeys() {
  return Object.keys(CATEGORIES)
}

// Link naar een machinepagina. Geeft null als de categorie onbekend is,
// zodat er nooit een link naar /nl/null/... ontstaat.
export function machineHref(machine, locale) {
  const slug = categorySlug(machine?.categorie, locale)
  if (!slug || !machine?.slug) return null
  return `/${locale}/${slug}/${machine.slug}`
}

export function machineSlug(merk, modelnummer) {
  return `${merk}-${modelnummer}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}
