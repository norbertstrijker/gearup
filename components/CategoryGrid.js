import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Icon from '@/components/Icons'
import {
  CATEGORIES,
  categoryName,
  categoryProducttypes,
} from '@/lib/categories'

// Volgorde zoals gedefinieerd in lib/categories.js
const ORDER = Object.keys(CATEGORIES)

export default function CategoryGrid({ locale, populated = [] }) {
  const tp = useTranslations('producttypes')
  const tc = useTranslations('categories')

  const populatedSet = new Set(populated)

  // Toon gevulde categorieën eerst, daarna de rest als "binnenkort"
  const sorted = [...ORDER].sort((a, b) => {
    const av = populatedSet.has(a) ? 0 : 1
    const bv = populatedSet.has(b) ? 0 : 1
    return av - bv
  })

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-[11px]">
      {sorted.map((key) => {
        const active = populatedSet.has(key)
        const desc = categoryProducttypes(key)
          .slice(0, 5)
          .map((p) => tp(p))
          .join(', ')

        if (!active) {
          return (
            <div
              key={key}
              className="bg-ink-2 border border-dashed border-steel rounded-card p-5 flex flex-col gap-[11px] opacity-80"
            >
              <span className="w-11 h-11 rounded-[11px] bg-ink border border-steel flex items-center justify-center text-mut">
                <Icon name={key} className="w-6 h-6" />
              </span>
              <span className="font-headline font-bold text-[15px] text-mut">{categoryName(key, locale)}</span>
              <span className="text-[12.5px] text-mut-d leading-snug">{tc('soon')}</span>
            </div>
          )
        }

        return (
          <Link
            key={key}
            href={`/${locale}/suggesties?cat=${key}`}
            className="group bg-ink-2 border border-steel rounded-card p-5 flex flex-col gap-[11px] transition-all hover:border-signal hover:-translate-y-[2px]"
          >
            <span className="w-11 h-11 rounded-[11px] bg-ink border border-steel flex items-center justify-center text-signal">
              <Icon name={key} className="w-6 h-6" />
            </span>
            <span className="font-headline font-bold text-[15px] text-paper">{categoryName(key, locale)}</span>
            <span className="text-[12.5px] text-mut leading-snug">{desc}</span>
          </Link>
        )
      })}
    </div>
  )
}
