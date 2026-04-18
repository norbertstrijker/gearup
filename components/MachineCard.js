import Link from 'next/link'
import { categorySlug, categoryEmoji, categoryName } from '@/lib/categories'

const CATEGORY_COLORS = {
  kettingzagen: '#2B2D42',
  grasmaaiers: '#1e4d38',
  bladblazers: '#7c3aed',
  bosmaaiers: '#b45309',
  heggenscharen: '#0e7490',
  generatoren: '#dc2626',
  'accu-gereedschap': '#2563eb',
}

export default function MachineCard({ machine, locale }) {
  const catSlug = categorySlug(machine.categorie, locale)
  const emoji = categoryEmoji(machine.categorie)
  const catName = categoryName(machine.categorie, locale)
  const catColor = CATEGORY_COLORS[machine.categorie] || '#16182C'

  return (
    <Link
      href={`/${locale}/${catSlug}/${machine.slug}`}
      className="rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-colors"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #C7C5CD',
      }}
    >
      <div
        className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl flex-shrink-0"
        style={{ backgroundColor: '#E0E0FC' }}
      >
        {emoji}
      </div>
      <div className="flex-grow">
        <span
          className="text-xs font-bold uppercase tracking-widest block mb-1"
          style={{ color: catColor }}
        >
          {catName}
        </span>
        <h3
          className="text-lg font-bold"
          style={{
            color: '#16182C',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {machine.merk} {machine.modelnummer}
        </h3>
      </div>
      <span className="material-symbols-outlined" style={{ color: '#E8620A' }}>
        arrow_forward
      </span>
    </Link>
  )
}
