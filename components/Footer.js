import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="w-full mt-16 border-t border-steel">
      <div className="w-full max-w-3xl mx-auto px-[18px] py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-3">
          <span className="font-headline text-lg font-extrabold text-signal tracking-tight">GEARUP.TOOLS</span>
          <p className="text-[12px] font-semibold tracking-widest uppercase text-mut-d">
            {t('copyright')}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-[12px] font-semibold tracking-widest uppercase text-mut hover:text-paper transition-colors" href="#">
            {t('privacy')}
          </a>
          <a className="text-[12px] font-semibold tracking-widest uppercase text-mut hover:text-paper transition-colors" href="#">
            {t('terms')}
          </a>
          <a className="text-[12px] font-semibold tracking-widest uppercase text-mut hover:text-paper transition-colors" href="#">
            {t('support')}
          </a>
        </div>
      </div>
    </footer>
  )
}
