import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Icon from '@/components/Icons'
import { machineHref, categoryName } from '@/lib/categories'

export default function MachineCard({ machine, locale, onderdeel = null }) {
  const t = useTranslations('suggestions')
  const catName = categoryName(machine.categorie, locale)
  const base = machineHref(machine, locale)
  if (!base) return null
  const href = base + (onderdeel ? `?onderdeel=${encodeURIComponent(onderdeel)}` : '')
  const variant = machine.uitvoering && machine.uitvoering !== machine.modelnummer ? machine.uitvoering : null

  return (
    <Link
      href={href}
      className="group bg-ink-2 border border-steel rounded-card overflow-hidden flex flex-col transition-all hover:border-signal hover:-translate-y-[3px]"
    >
      <span className="relative h-[124px] bg-gradient-to-br from-paper to-paper-2 flex items-center justify-center text-[#9a958a]">
        {machine.afbeelding_url ? (
          <img
            src={machine.afbeelding_url}
            alt={`${machine.merk} ${machine.modelnummer}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <>
            <Icon name="photo" viewBox="0 0 120 90" className="w-24 h-[72px]" strokeWidth={2.2} />
            <span className="absolute bottom-[7px] right-[9px] text-[9px] tracking-[0.08em] uppercase text-[#b0a99c] font-semibold">
              {t('photo_badge')}
            </span>
          </>
        )}
      </span>
      <span className="p-[13px] pt-[13px] pb-[14px] flex flex-col gap-[3px] flex-1">
        <span className="font-headline font-bold text-[15px] leading-tight text-paper">
          {machine.merk} {variant || machine.modelnummer}
        </span>
        <span className="text-[12px] text-mut">{catName}</span>
        {machine.typenummer && (
          <span className="text-[11.5px] text-mut-d">{t('type_label')} {machine.typenummer}</span>
        )}
        <span className="mt-2 inline-flex items-center gap-[5px] text-[12.5px] font-semibold text-signal">
          {t('view_parts')}
          <Icon name="arrowRight" className="w-[14px] h-[14px]" strokeWidth={2.2} />
        </span>
      </span>
    </Link>
  )
}
