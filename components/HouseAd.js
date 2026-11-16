import { useTranslations } from 'next-intl'
import Icon from '@/components/Icons'

// Eigen GearUp-blokken in de advertentieruimtes, tot er echte advertenties zijn.
// Geen nagemaakte advertenties van merken: alleen tips en een oproep die kloppen.
// kind: 'rect' (300 × 250) of 'half' (300 × 600)
export default function HouseAd({ kind, variant = 0 }) {
  const t = useTranslations('housead')
  if (kind === 'rect') {
    const tips = ['tip_plate', 'tip_manual']
    const key = tips[variant % tips.length]
    return (
      <div className="h-[250px] rounded-xl bg-gradient-to-br from-paper to-paper-2 text-ink p-5 flex flex-col">
        <div className="text-[10px] tracking-[0.14em] uppercase text-mut-d font-semibold mb-3">GearUp · {t('tip')}</div>
        <span className="w-10 h-10 rounded-[10px] bg-ink text-signal flex items-center justify-center mb-3">
          <Icon name={key === 'tip_plate' ? 'search' : 'shield'} className="w-5 h-5" strokeWidth={2} />
        </span>
        <div className="font-headline font-extrabold text-[17px] leading-tight mb-2">{t(`${key}_title`)}</div>
        <p className="text-[13px] text-[#55575c] leading-snug">{t(`${key}_text`)}</p>
      </div>
    )
  }
  return (
    <div className="h-[600px] rounded-xl bg-gradient-to-b from-signal to-[#c2560f] text-white p-6 flex flex-col">
      <div className="text-[10px] tracking-[0.14em] uppercase text-white/80 font-semibold mb-4">GearUp</div>
      <div className="font-headline font-extrabold text-[26px] leading-tight mb-4">{t('advertise_title')}</div>
      <p className="text-[14px] leading-relaxed text-white/90 mb-6">{t('advertise_text')}</p>
      <div className="mt-auto text-[13px] font-semibold bg-white/15 rounded-[9px] px-4 py-3 text-center">
        {t('advertise_soon')}
      </div>
    </div>
  )
}
