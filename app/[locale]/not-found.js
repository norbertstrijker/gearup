import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import Container from '@/components/Container'
import Icon from '@/components/Icons'

export default function LocaleNotFound() {
  const t = useTranslations('notfound')
  const locale = useLocale()
  return (
    <Container className="pb-16">
      <div className="text-center max-w-[520px] mx-auto mt-10">
        <div className="w-[72px] h-[72px] rounded-[18px] bg-ink-2 border border-steel flex items-center justify-center text-mut mx-auto mb-[22px]">
          <Icon name="notFound" className="w-9 h-9" strokeWidth={1.7} />
        </div>
        <h1 className="font-headline font-extrabold text-[26px] tracking-[-0.02em] mb-3 leading-tight">{t('title')}</h1>
        <p className="text-[15px] text-mut leading-relaxed mb-7">{t('lead')}</p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-[11px] border border-steel-2 text-paper hover:border-signal hover:text-signal transition"
        >
          {t('home')}
        </Link>
      </div>
    </Container>
  )
}
