'use client'
import { useLocale } from 'next-intl'
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
    <header className="w-full">
      <div className="max-w-5xl mx-auto px-[18px] flex items-center justify-between py-5">
        <Link href={`/${locale}`} className="flex items-center" aria-label="GearUp.tools home">
          <span className="logoplate px-[18px] py-[10px] flex items-center">
            <Image
              src="/gearup-logo-onderste.png"
              alt="GearUp.tools"
              width={110}
              height={42}
              className="h-[42px] w-auto object-contain"
              priority
            />
          </span>
        </Link>

        <div className="flex border border-steel rounded-[9px] overflow-hidden">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={
                loc === locale
                  ? 'text-[12.5px] font-semibold px-3 py-[7px] bg-signal text-white transition-colors'
                  : 'text-[12.5px] font-semibold px-3 py-[7px] text-mut hover:text-paper transition-colors'
              }
            >
              {loc.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
