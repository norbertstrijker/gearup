'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const LOCALES = ['nl', 'de', 'en']

export default function Header() {
  const t = useTranslations('header')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale) {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <nav
      className="fixed top-0 w-full z-50 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(43, 45, 66, 0.8)' }}
    >
      <div className="flex items-center justify-between px-6 py-4 w-full">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Image
            src="/gearup-logo-onderste.png"
            alt={t('logo_alt')}
            width={96}
            height={48}
            className="h-12 w-auto object-contain"
          />
          <span
            className="text-2xl font-black italic tracking-widest font-headline uppercase"
            style={{ color: '#ffffff' }}
          >
            GEARUP
          </span>
        </Link>
        <div className="flex gap-1">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className="px-3 py-1 text-xs font-headline font-bold uppercase tracking-widest transition-colors rounded-sm"
              style={
                loc === locale
                  ? { backgroundColor: '#E8620A', color: '#ffffff' }
                  : { color: '#9394AE' }
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
