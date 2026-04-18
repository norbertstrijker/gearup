import { useTranslations } from 'next-intl'

const TIER_STYLES = {
  basis: {
    card: { backgroundColor: '#F4F2FF' },
    tierLabel: { color: '#77767D', fontFamily: "'Space Grotesk', sans-serif" },
    imagePlaceholder: { backgroundColor: 'rgba(24,26,46,0.08)' },
    productName: { color: '#181A2E', fontFamily: "'Space Grotesk', sans-serif" },
    description: { color: '#46464D' },
    price: { color: '#181A2E', fontFamily: "'Space Grotesk', sans-serif" },
    orderButton: { backgroundColor: '#2B2D42', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" },
    comingSoonText: { color: '#181A2E', fontFamily: "'Space Grotesk', sans-serif" },
    comingSoonDesc: { color: '#46464D' },
    comingSoonIcon: { color: '#181A2E' },
  },
  beter: {
    card: { backgroundColor: '#2B2D42' },
    badge: { backgroundColor: '#E8620A', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" },
    tierLabel: { color: '#9394AE', fontFamily: "'Space Grotesk', sans-serif" },
    imagePlaceholder: { backgroundColor: 'rgba(255,255,255,0.1)' },
    productName: { color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" },
    description: { color: '#9394AE' },
    price: { color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" },
    orderButton: { backgroundColor: '#E8620A', color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" },
    comingSoonText: { color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" },
    comingSoonDesc: { color: '#9394AE' },
    comingSoonIcon: { color: '#FFFFFF' },
  },
  best: {
    card: { backgroundColor: '#E8620A' },
    tierLabel: { color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" },
    imagePlaceholder: { backgroundColor: 'rgba(255,255,255,0.15)' },
    productName: { color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" },
    description: { color: 'rgba(255,255,255,0.8)' },
    price: { color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" },
    orderButton: { backgroundColor: '#FFFFFF', color: '#E8620A', fontFamily: "'Space Grotesk', sans-serif" },
    comingSoonText: { color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif" },
    comingSoonDesc: { color: 'rgba(255,255,255,0.8)' },
    comingSoonIcon: { color: '#FFFFFF' },
  },
}

export default function ProductCard({ product, tier }) {
  const t = useTranslations()
  const s = TIER_STYLES[tier] || TIER_STYLES.basis

  if (!product) {
    // "Coming soon" fallback card
    return (
      <div
        className="min-w-[260px] p-5 snap-start flex flex-col"
        style={{ ...s.card, opacity: 0.6 }}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={s.tierLabel}
        >
          {t(`tiers.${tier}`)}
        </span>
        <div
          className="h-36 mb-4 flex items-center justify-center"
          style={s.imagePlaceholder}
        >
          <span className="material-symbols-outlined text-4xl" style={s.comingSoonIcon}>
            hourglass_empty
          </span>
        </div>
        <h4
          className="text-lg font-black mb-1 uppercase"
          style={s.comingSoonText}
        >
          {t('result.coming_soon')}
        </h4>
        <p className="text-sm mb-4 flex-grow" style={s.comingSoonDesc}>
          {t('result.coming_soon_desc')}
        </p>
      </div>
    )
  }

  if (tier === 'best') {
    return (
      <div
        className="min-w-[260px] p-5 snap-start flex flex-col"
        style={s.card}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={s.tierLabel}
        >
          {t('tiers.best')}
        </span>
        <div
          className="h-36 mb-4 flex items-center justify-center text-5xl"
          style={s.imagePlaceholder}
        >
          {product.afbeelding_url ? (
            <img src={product.afbeelding_url} alt={product.product_naam} className="h-full w-full object-contain" />
          ) : '🏆'}
        </div>
        <h4 className="text-lg font-black mb-1 uppercase" style={s.productName}>
          {product.product_naam}
        </h4>
        <p className="text-sm mb-4 flex-grow" style={s.description}>
          {product.beschrijving}
        </p>
        <div className="flex items-center justify-between mt-auto">
          {product.prijs_indicatie && (
            <span className="text-xl font-bold" style={s.price}>
              €{Number(product.prijs_indicatie).toFixed(2).replace('.', ',')}
            </span>
          )}
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 font-black uppercase text-xs tracking-widest"
            style={s.orderButton}
          >
            {t('result.order')}
          </a>
        </div>
      </div>
    )
  }

  if (tier === 'beter') {
    return (
      <div
        className="min-w-[260px] p-5 snap-start flex flex-col relative -translate-y-2 shadow-2xl"
        style={s.card}
      >
        <div
          className="absolute -top-3 right-4 px-3 py-1 text-[10px] font-black tracking-widest uppercase"
          style={s.badge}
        >
          {t('tiers.popular')}
        </div>
        <span
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={s.tierLabel}
        >
          {t('tiers.beter')}
        </span>
        <div
          className="h-36 mb-4 flex items-center justify-center text-5xl"
          style={s.imagePlaceholder}
        >
          {product.afbeelding_url ? (
            <img src={product.afbeelding_url} alt={product.product_naam} className="h-full w-full object-contain" />
          ) : '⭐'}
        </div>
        <h4 className="text-lg font-black mb-1 uppercase" style={s.productName}>
          {product.product_naam}
        </h4>
        <p className="text-sm mb-4 flex-grow" style={s.description}>
          {product.beschrijving}
        </p>
        <div className="flex items-center justify-between mt-auto">
          {product.prijs_indicatie && (
            <span className="text-xl font-bold" style={s.price}>
              €{Number(product.prijs_indicatie).toFixed(2).replace('.', ',')}
            </span>
          )}
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 font-black uppercase text-xs tracking-widest"
            style={s.orderButton}
          >
            {t('result.order')}
          </a>
        </div>
      </div>
    )
  }

  // Basis tier (default)
  return (
    <div
      className="min-w-[260px] p-5 snap-start flex flex-col"
      style={s.card}
    >
      <span
        className="text-xs font-bold uppercase tracking-widest mb-4"
        style={s.tierLabel}
      >
        {t('tiers.basis')}
      </span>
      <div
        className="h-36 mb-4 flex items-center justify-center text-5xl"
        style={s.imagePlaceholder}
      >
        {product.afbeelding_url ? (
          <img src={product.afbeelding_url} alt={product.product_naam} className="h-full w-full object-contain" />
        ) : '🛢️'}
      </div>
      <h4 className="text-lg font-black mb-1 uppercase" style={s.productName}>
        {product.product_naam}
      </h4>
      <p className="text-sm mb-4 flex-grow" style={s.description}>
        {product.beschrijving}
      </p>
      <div className="flex items-center justify-between mt-auto">
        {product.prijs_indicatie && (
          <span className="text-xl font-bold" style={s.price}>
            €{Number(product.prijs_indicatie).toFixed(2).replace('.', ',')}
          </span>
        )}
        <a
          href={product.affiliate_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 font-black uppercase text-xs tracking-widest"
          style={s.orderButton}
        >
          {t('result.order')}
        </a>
      </div>
    </div>
  )
}
