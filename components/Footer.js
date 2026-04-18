import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer
      className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5"
      style={{ backgroundColor: '#16182C' }}
    >
      <div className="flex flex-col items-center md:items-start gap-4">
        <span
          className="text-lg font-black font-headline uppercase italic"
          style={{ color: '#FD711F' }}
        >
          GEARUP
        </span>
        <p
          className="text-[12px] font-bold tracking-widest uppercase"
          style={{ color: '#77767D' }}
        >
          {t('copyright')}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <a
          className="text-[12px] font-bold tracking-widest uppercase"
          style={{ color: '#9394AE' }}
          href="#"
        >
          {t('privacy')}
        </a>
        <a
          className="text-[12px] font-bold tracking-widest uppercase"
          style={{ color: '#9394AE' }}
          href="#"
        >
          {t('terms')}
        </a>
        <a
          className="text-[12px] font-bold tracking-widest uppercase"
          style={{ color: '#9394AE' }}
          href="#"
        >
          {t('support')}
        </a>
      </div>
    </footer>
  )
}
