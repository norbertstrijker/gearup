import ProductCard from '@/components/ProductCard'
import { useTranslations } from 'next-intl'

const PRODUCTTYPE_ICONS = {
  brandstof: 'local_gas_station',
  ketting: 'link',
  bougie: 'bolt',
  filter: 'air',
  olie: 'opacity',
  maaimes: 'content_cut',
  maaidraad: 'grass',
  accu: 'battery_full',
  lader: 'power',
  zaagblad: 'carpenter',
  boren: 'hardware',
}

const TIERS = ['basis', 'beter', 'best']

export default function ProductCarousel({ producttype, products }) {
  const t = useTranslations()
  const icon = PRODUCTTYPE_ICONS[producttype] || 'category'

  // Group products by tier
  const byTier = {}
  for (const tier of TIERS) {
    byTier[tier] = products.find((p) => p.kwaliteit === tier) || null
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-cta text-2xl">{icon}</span>
        <h3 className="text-xl font-headline font-bold uppercase tracking-tight">
          {t(`producttypes.${producttype}`)}
        </h3>
      </div>
      <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
        {TIERS.map((tier) => (
          <ProductCard key={tier} product={byTier[tier]} tier={tier} />
        ))}
      </div>
    </div>
  )
}
