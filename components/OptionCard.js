import { useTranslations } from 'next-intl'
import Icon from '@/components/Icons'
import { isValidUrl } from '@/lib/links'

function priceLabel(value) {
  if (value == null) return null
  return '€' + Number(value).toFixed(2).replace('.', ',')
}

// tier: 'basis' | 'beter' | 'best'  ·  mini: compacte (donkere) variant voor de accordion
export default function OptionCard({ product, tier, mini = false }) {
  const t = useTranslations()
  const isBest = tier === 'beter' // middelste optie = "beste prijs/kwaliteit" (uitgelicht)
  const tierLabel = t(`tiers.${tier}`)
  const price = product ? priceLabel(product.prijs_indicatie) : null
  const store = product?.winkel
  // Geen kapotte/placeholder-links: knop alleen bij een geldige bestemming
  const buyable = isValidUrl(product?.affiliate_url)

  if (mini) {
    if (!product) {
      return (
        <div className="bg-ink-2 border border-steel rounded-[10px] p-3 flex flex-col opacity-60">
          <div className="font-headline font-bold text-[9.5px] tracking-wide uppercase text-mut mb-2">{tierLabel}</div>
          <div className="text-[12.5px] font-semibold text-paper mb-2 flex-1">{t('result.coming_soon')}</div>
          <div className="font-headline font-extrabold text-[15px] text-mut mb-[9px]">—</div>
          <span className="bg-steel text-mut-d text-[12px] font-semibold py-2 px-[10px] rounded-[9px] text-center">
            {t('result.coming_soon_short')}
          </span>
        </div>
      )
    }
    return (
      <div className={`bg-ink-2 rounded-[10px] p-3 flex flex-col border ${isBest ? 'border-signal' : 'border-steel'}`}>
        <div className={`font-headline font-bold text-[9.5px] tracking-wide uppercase mb-2 ${isBest ? 'text-signal' : 'text-mut'}`}>
          {tierLabel}
        </div>
        <div className="text-[12.5px] font-semibold text-paper mb-2 flex-1 leading-snug">{product.product_naam}</div>
        <div className="font-headline font-extrabold text-[15px] text-paper mb-[9px]">{price}</div>
        {buyable ? (
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`text-[12px] font-semibold py-2 px-[10px] rounded-[9px] text-center transition hover:brightness-110 ${
              isBest ? 'bg-signal text-white' : 'bg-steel-2 text-paper'
            }`}
          >
            {t('result.order')}
          </a>
        ) : (
          <span className="text-[12px] font-semibold py-2 px-[10px] rounded-[9px] text-center bg-steel text-mut-d">
            {t('result.link_soon')}
          </span>
        )}
      </div>
    )
  }

  // Hero-variant (lichte kaart)
  if (!product) {
    return (
      <div className="bg-white border border-line-on-light rounded-[11px] flex flex-col overflow-hidden opacity-70">
        <div className="font-headline font-bold text-[10px] tracking-wide uppercase px-[13px] py-[9px] border-b border-line-on-light text-mut-d bg-[#faf8f3]">
          {tierLabel}
        </div>
        <div className="p-[13px] flex flex-col flex-1">
          <div className="h-[74px] rounded-lg bg-paper-2 flex items-center justify-center text-mut-d mb-[10px]">
            <Icon name="search" className="w-[34px] h-[34px] opacity-50" strokeWidth={1.6} />
          </div>
          <div className="text-[13.5px] font-semibold text-ink mb-1">{t('result.coming_soon')}</div>
          <div className="text-[12px] text-mut-d mb-[11px] flex-1">{t('result.coming_soon_desc')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-[11px] flex flex-col overflow-hidden ${isBest ? 'border-2 border-signal' : 'border border-line-on-light'}`}>
      <div
        className={`font-headline font-bold text-[10px] tracking-wide uppercase px-[13px] py-[9px] border-b ${
          isBest ? 'text-white bg-signal border-signal' : 'text-mut-d bg-[#faf8f3] border-line-on-light'
        }`}
      >
        {tierLabel}
      </div>
      <div className="p-[13px] flex flex-col flex-1">
        <div className="h-[74px] rounded-lg bg-paper-2 flex items-center justify-center text-mut-d mb-[10px] overflow-hidden">
          {product.afbeelding_url ? (
            <img src={product.afbeelding_url} alt={product.product_naam} className="h-full w-full object-contain" />
          ) : (
            <Icon name="search" className="w-[34px] h-[34px] opacity-50" strokeWidth={1.6} />
          )}
        </div>
        <div className="text-[13.5px] font-semibold text-ink leading-snug mb-1">{product.product_naam}</div>
        <div className="text-[12px] text-mut-d mb-[11px] flex-1">{product.beschrijving}</div>
        <div className="font-headline font-extrabold text-[18px] text-ink mb-[10px]">{price}</div>
        {buyable ? (
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`flex items-center justify-center gap-[7px] font-semibold text-[13px] py-[10px] px-3 rounded-[9px] transition hover:brightness-110 ${
              isBest ? 'bg-signal text-white' : 'bg-ink text-white'
            }`}
          >
            {t('result.order')}
            {store && <span className="opacity-70 font-medium text-[11px]">· {store}</span>}
          </a>
        ) : (
          <span className="flex items-center justify-center font-semibold text-[13px] py-[10px] px-3 rounded-[9px] bg-paper-2 text-mut-d">
            {t('result.link_soon')}
          </span>
        )}
      </div>
    </div>
  )
}
