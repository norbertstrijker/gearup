export const CATEGORIES = {
  grasmaaiers: {
    slugs: { nl: 'grasmaaiers', de: 'rasenmaher', en: 'lawnmowers' },
    names: { nl: 'Grasmaaiers', de: 'Rasenmäher', en: 'Lawnmowers' },
    emoji: '🌿',
    producttypes: ['brandstof', 'bougie', 'filter', 'maaimes', 'olie'],
  },
  kettingzagen: {
    slugs: { nl: 'kettingzagen', de: 'kettensagen', en: 'chainsaws' },
    names: { nl: 'Kettingzagen', de: 'Kettensägen', en: 'Chainsaws' },
    emoji: '🪚',
    producttypes: ['brandstof', 'ketting', 'bougie', 'filter', 'olie'],
  },
  bladblazers: {
    slugs: { nl: 'bladblazers', de: 'laubblasen', en: 'leaf-blowers' },
    names: { nl: 'Bladblazers', de: 'Laubbläser', en: 'Leaf Blowers' },
    emoji: '💨',
    producttypes: ['brandstof', 'bougie', 'filter'],
  },
  bosmaaiers: {
    slugs: { nl: 'bosmaaiers', de: 'motorsensen', en: 'brush-cutters' },
    names: { nl: 'Bosmaaiers', de: 'Motorsensen', en: 'Brush Cutters' },
    emoji: '🌾',
    producttypes: ['brandstof', 'bougie', 'filter', 'maaidraad'],
  },
  heggenscharen: {
    slugs: { nl: 'heggenscharen', de: 'heckenscheren', en: 'hedge-trimmers' },
    names: { nl: 'Heggenscharen', de: 'Heckenscheren', en: 'Hedge Trimmers' },
    emoji: '✂️',
    producttypes: ['brandstof', 'bougie', 'filter'],
  },
  generatoren: {
    slugs: { nl: 'generatoren', de: 'generatoren', en: 'generators' },
    names: { nl: 'Generatoren', de: 'Generatoren', en: 'Generators' },
    emoji: '⚡',
    producttypes: ['brandstof', 'bougie', 'olie'],
  },
  'accu-gereedschap': {
    slugs: { nl: 'accu-gereedschap', de: 'akku-werkzeug', en: 'power-tools' },
    names: { nl: 'Accu-gereedschap', de: 'Akku-Werkzeug', en: 'Power Tools' },
    emoji: '🔋',
    producttypes: ['accu', 'lader', 'zaagblad', 'boren'],
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

export function categoryProducttypes(key) {
  return CATEGORIES[key]?.producttypes || []
}

export function allCategoryKeys() {
  return Object.keys(CATEGORIES)
}

export function machineSlug(merk, modelnummer) {
  return `${merk}-${modelnummer}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}
