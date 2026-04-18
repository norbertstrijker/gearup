import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const BASE_URL = 'https://gearup.tools'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }) {
  const { locale } = await params
  const messages = await getMessages({ locale })

  const languages = {}
  for (const loc of routing.locales) {
    languages[loc] = `${BASE_URL}/${loc}`
  }

  return {
    title: messages.meta.title,
    description: messages.meta.description,
    alternates: { languages },
  }
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ backgroundColor: '#FBF8FF', color: '#181A2E', fontFamily: "'Inter', sans-serif" }}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
