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
          <div
            className="aspect-square rounded-lg flex flex-col items-center justify-center p-4 transition-all group-hover:-translate-y-1"
            style={{ backgroundColor: '#E6E6FF' }}
          >
            <div
              className="w-20 h-20 rounded-lg mb-4 overflow-hidden flex items-center justify-center text-4xl"
              style={{
                backgroundColor: '#F4F2FF',
                border: '1px solid rgba(199, 197, 205, 0.3)',
              }}
            >
              {categoryEmoji(key)}
            </div>
            <span
              className="font-bold text-xs uppercase tracking-widest text-center"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: '#16182C',
              }}
            >
              {t(key)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
