'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const LOCALES = ['nl', 'de', 'en']

export default function Header() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale) {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#2B2D42]/80 glass-nav">
      <div className="flex items-center justify-between px-6 py-4 w-full max-w-full">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Image
            src="/gearup-logo-onderste.png"
            alt="GearUp"
            width={96}
            height={48}
            className="h-12 w-auto object-contain"
          />
        </Link>
        <div className="flex gap-1">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={
                loc === locale
                  ? 'px-3 py-1 text-xs font-headline font-bold uppercase tracking-widest bg-[#E8620A] text-white rounded-sm'
                  : 'px-3 py-1 text-xs font-headline font-bold uppercase tracking-widest text-on-primary-container hover:text-white'
              }
            >
              {loc.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
