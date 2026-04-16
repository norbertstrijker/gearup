import Link from 'next/link'
import { categorySlug, categoryEmoji } from '@/lib/categories'
import { useTranslations } from 'next-intl'

const HOMEPAGE_CATEGORIES = ['grasmaaiers', 'kettingzagen', 'bladblazers', 'bosmaaiers']

export default function CategoryGrid({ locale }) {
  const t = useTranslations('categories')

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {HOMEPAGE_CATEGORIES.map((key) => (
        <Link
          key={key}
          href={`/${locale}/${categorySlug(key, locale)}`}
          className="group cursor-pointer"
        >
          <div className="aspect-square bg-surface-container-high rounded-lg flex flex-col items-center justify-center p-4 transition-all group-hover:bg-primary-fixed group-hover:-translate-y-1">
            <div className="w-20 h-20 bg-surface-container-low rounded-lg mb-4 overflow-hidden border border-outline-variant/30 flex items-center justify-center text-4xl">
              {categoryEmoji(key)}
            </div>
            <span className="font-headline font-bold text-primary text-xs uppercase tracking-widest text-center">
              {t(key)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
