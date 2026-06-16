import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Icon from '@/components/Icons'
import { CATEGORIES, categoryName } from '@/lib/categories'

const ORDER = Object.keys(CATEGORIES)

export default function CategoryGrid({ locale, counts = {} }) {
  const tc = useTranslations('categories')

  // Gevulde categorieën eerst, daarna de rest als "binnenkort"
  const sorted = [...ORDER].sort((a, b) => (counts[a] ? 0 : 1) - (counts[b] ? 0 : 1))

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-[11px]">
      {sorted.map((key) => {
        const count = counts[key] || 0
        const active = count > 0

        if (!active) {
          return (
            <div
              key={key}
              className="bg-ink-2 border border-dashed border-steel rounded-card p-5 flex flex-col gap-3 opacity-70"
            >
              <span className="w-14 h-14 rounded-[12px] bg-ink border border-steel flex items-center justify-center text-mut">
                <Icon name={key} className="w-8 h-8" />
              </span>
              <span className="font-headline font-bold text-[15px] text-mut">{categoryName(key, locale)}</span>
              <span className="text-[12px] text-mut-d">{tc('soon')}</span>
            </div>
          )
        }

        return (
          <Link
            key={key}
            href={`/${locale}/suggesties?cat=${key}`}
            className="group bg-gradient-to-br from-ink-2 to-[#15171c] border border-steel rounded-card p-5 flex flex-col gap-3 transition-all hover:border-signal hover:-translate-y-[2px]"
          >
            <span className="w-14 h-14 rounded-[12px] bg-ink border border-steel flex items-center justify-center text-signal group-hover:scale-105 transition-transform">
              <Icon name={key} className="w-8 h-8" />
            </span>
            <span className="font-headline font-bold text-[15px] text-paper">{categoryName(key, locale)}</span>
            <span className="text-[12px] text-mut">{tc('model_count', { count })}</span>
          </Link>
        )
      })}
    </div>
  )
}
