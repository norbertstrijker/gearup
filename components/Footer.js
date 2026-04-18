import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-primary w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5">
      <div className="flex flex-col items-center md:items-start gap-4">
        <span className="text-lg font-black text-secondary-container font-headline uppercase italic">
          GEARUP
        </span>
        <p className="text-[12px] font-bold tracking-widest uppercase text-outline">
          {t('copyright')}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <a className="text-[12px] font-bold tracking-widest uppercase text-on-primary-container hover:text-white" href="#">
          {t('privacy')}
        </a>
        <a className="text-[12px] font-bold tracking-widest uppercase text-on-primary-container hover:text-white" href="#">
          {t('terms')}
        </a>
        <a className="text-[12px] font-bold tracking-widest uppercase text-on-primary-container hover:text-white" href="#">
          {t('support')}
        </a>
      </div>
    </footer>
  )
}
