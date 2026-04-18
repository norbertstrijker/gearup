import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-[#16182C] w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5">
      <div className="flex flex-col items-center md:items-start gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-[#FD711F] font-headline uppercase italic">GEARUP</span>
        </div>
        <p className="text-[12px] font-bold tracking-widest uppercase text-slate-500">
          {t('copyright')}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <a className="text-[12px] font-bold tracking-widest uppercase text-slate-300 hover:text-white" href="#">
          {t('privacy')}
        </a>
        <a className="text-[12px] font-bold tracking-widest uppercase text-slate-300 hover:text-white" href="#">
          {t('terms')}
        </a>
        <a className="text-[12px] font-bold tracking-widest uppercase text-slate-300 hover:text-white" href="#">
          {t('support')}
        </a>
      </div>
    </footer>
  )
}
