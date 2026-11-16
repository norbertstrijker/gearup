import { notFound } from 'next/navigation'

// Elke onbekende pagina binnen een taal (bv. /nl/null/stihl-ms-170) toont de
// nette "niet gevonden"-pagina van [locale]/not-found.js in plaats van te crashen.
export default function CatchAll() {
  notFound()
}
