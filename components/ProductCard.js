import { useTranslations } from 'next-intl'

export default function ProductCard({ product, tier }) {
  const t = useTranslations()

  if (!product) {
    // "Coming soon" fallback card
    const wrapperClass =
      tier === 'best'
        ? 'min-w-[260px] bg-[#E8620A] p-5 snap-start flex flex-col opacity-60'
        : tier === 'beter'
          ? 'min-w-[260px] bg-primary-container p-5 snap-start flex flex-col relative -translate-y-2 shadow-2xl opacity-60'
          : 'min-w-[260px] bg-surface-container-low p-5 snap-start flex flex-col opacity-60'

    const tierLabelClass =
      tier === 'best'
        ? 'font-headline text-xs font-bold text-white uppercase tracking-widest mb-4'
        : tier === 'beter'
          ? 'font-headline text-xs font-bold text-on-primary-container uppercase tracking-widest mb-4'
          : 'font-headline text-xs font-bold text-outline uppercase tracking-widest mb-4'

    const imageBgClass =
      tier === 'best'
        ? 'h-36 mb-4 bg-[#2B2D42] flex items-center justify-center'
        : tier === 'beter'
          ? 'h-36 mb-4 bg-slate-800 flex items-center justify-center'
          : 'h-36 mb-4 bg-surface-container-highest flex items-center justify-center'

    const iconClass =
      tier === 'best' || tier === 'beter'
        ? 'material-symbols-outlined text-4xl text-white'
        : 'material-symbols-outlined text-4xl'

    const nameClass =
      tier === 'best' || tier === 'beter'
        ? 'text-lg font-headline font-black text-white mb-1 uppercase'
        : 'text-lg font-headline font-black mb-1 uppercase'

    const descClass =
      tier === 'best'
        ? 'text-sm text-white/80 mb-4 flex-grow'
        : tier === 'beter'
          ? 'text-sm text-on-primary-container mb-4 flex-grow'
          : 'text-sm text-on-surface-variant mb-4 flex-grow'

    return (
      <div className={wrapperClass}>
        <span className={tierLabelClass}>
          {t(`tiers.${tier}`)}
        </span>
        <div className={imageBgClass}>
          <span className={iconClass}>hourglass_empty</span>
        </div>
        <h4 className={nameClass}>
          {t('result.coming_soon')}
        </h4>
        <p className={descClass}>
          {t('result.coming_soon_desc')}
        </p>
      </div>
    )
  }

  if (tier === 'best') {
    return (
      <div className="min-w-[260px] bg-[#E8620A] p-5 snap-start flex flex-col">
        <span className="font-headline text-xs font-bold text-white uppercase tracking-widest mb-4">
          {t('tiers.best')}
        </span>
        <div className="h-36 mb-4 bg-[#2B2D42] flex items-center justify-center text-5xl">
          {product.afbeelding_url ? (
            <img src={product.afbeelding_url} alt={product.product_naam} className="h-full w-full object-contain" />
          ) : '🏆'}
        </div>
        <h4 className="text-lg font-headline font-black text-white mb-1 uppercase">
          {product.product_naam}
        </h4>
        <p className="text-sm text-white/80 mb-4 flex-grow">
          {product.beschrijving}
        </p>
        <div className="flex items-center justify-between mt-auto">
          {product.prijs_indicatie && (
            <span className="text-xl font-headline font-bold text-white">
              €{Number(product.prijs_indicatie).toFixed(2).replace('.', ',')}
            </span>
          )}
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#E8620A] px-5 py-2 font-headline font-black uppercase text-xs tracking-widest"
          >
            {t('result.order')}
          </a>
        </div>
      </div>
    )
  }

  if (tier === 'beter') {
    return (
      <div className="min-w-[260px] bg-primary-container p-5 snap-start flex flex-col relative -translate-y-2 shadow-2xl">
        <div className="absolute -top-3 right-4 bg-[#E8620A] text-white px-3 py-1 font-headline text-[10px] font-black tracking-widest uppercase">
          {t('tiers.popular')}
        </div>
        <span className="font-headline text-xs font-bold text-on-primary-container uppercase tracking-widest mb-4">
          {t('tiers.beter')}
        </span>
        <div className="h-36 mb-4 bg-slate-800 flex items-center justify-center text-5xl">
          {product.afbeelding_url ? (
            <img src={product.afbeelding_url} alt={product.product_naam} className="h-full w-full object-contain" />
          ) : '⭐'}
        </div>
        <h4 className="text-lg font-headline font-black text-white mb-1 uppercase">
          {product.product_naam}
        </h4>
        <p className="text-sm text-on-primary-container mb-4 flex-grow">
          {product.beschrijving}
        </p>
        <div className="flex items-center justify-between mt-auto">
          {product.prijs_indicatie && (
            <span className="text-xl font-headline font-bold text-white">
              €{Number(product.prijs_indicatie).toFixed(2).replace('.', ',')}
            </span>
          )}
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#E8620A] text-white px-5 py-2 font-headline font-black uppercase text-xs tracking-widest"
          >
            {t('result.order')}
          </a>
        </div>
      </div>
    )
  }

  // Basis tier (default)
  return (
    <div className="min-w-[260px] bg-surface-container-low p-5 snap-start flex flex-col">
      <span className="font-headline text-xs font-bold text-outline uppercase tracking-widest mb-4">
        {t('tiers.basis')}
      </span>
      <div className="h-36 mb-4 bg-surface-container-highest flex items-center justify-center text-5xl">
        {product.afbeelding_url ? (
          <img src={product.afbeelding_url} alt={product.product_naam} className="h-full w-full object-contain" />
        ) : '🛢️'}
      </div>
      <h4 className="text-lg font-headline font-black mb-1 uppercase">
        {product.product_naam}
      </h4>
      <p className="text-sm text-on-surface-variant mb-4 flex-grow">
        {product.beschrijving}
      </p>
      <div className="flex items-center justify-between mt-auto">
        {product.prijs_indicatie && (
          <span className="text-xl font-headline font-bold">
            €{Number(product.prijs_indicatie).toFixed(2).replace('.', ',')}
          </span>
        )}
        <a
          href={product.affiliate_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#2B2D42] text-white px-5 py-2 font-headline font-black uppercase text-xs tracking-widest"
        >
          {t('result.order')}
        </a>
      </div>
    </div>
  )
}
