import Link from 'next/link'
import { categorySlug, categoryEmoji, categoryName } from '@/lib/categories'

const CATEGORY_LABEL_CLASS = {
  kettingzagen: 'text-[#2B2D42]',
  grasmaaiers: 'text-[#1e4d38]',
  bladblazers: 'text-[#7c3aed]',
  bosmaaiers: 'text-[#b45309]',
}

export default function MachineCard({ machine, locale }) {
  const catSlug = categorySlug(machine.categorie, locale)
  const emoji = categoryEmoji(machine.categorie)
  const catName = categoryName(machine.categorie, locale)
  const labelClass = CATEGORY_LABEL_CLASS[machine.categorie] || 'text-primary'

  return (
    <Link
      href={`/${locale}/${catSlug}/${machine.slug}`}
      className="model-card bg-white border border-outline-variant rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-colors"
    >
      <div className="w-16 h-16 bg-surface-container-highest rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
        {emoji}
      </div>
      <div className="flex-grow">
        <span className={`text-xs font-bold ${labelClass} uppercase tracking-widest block mb-1`}>
          {catName}
        </span>
        <h3 className="text-lg font-bold text-primary font-headline">
          {machine.merk} {machine.modelnummer}
        </h3>
      </div>
      <span className="material-symbols-outlined text-[#E8620A]">arrow_forward</span>
    </Link>
  )
}
