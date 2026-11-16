// Vangnet voor pagina's buiten een taalmap (bv. /onbekend). De hoofdopmaak
// (app/layout.js) heeft geen eigen <html>, dus deze pagina levert die zelf.
import './globals.css'

export default function RootNotFound() {
  return (
    <html lang="nl">
      <body className="bg-ink text-paper font-body min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold mb-3">Pagina niet gevonden</h1>
          <a href="/nl" className="underline">Naar de startpagina</a>
        </div>
      </body>
    </html>
  )
}
