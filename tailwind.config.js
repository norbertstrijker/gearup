/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // GearUp dark system (referentie: newdesign/)
        ink: '#16181d',          // basis-achtergrond
        'ink-2': '#1f2229',      // kaarten
        steel: '#2a2e37',        // randen
        'steel-2': '#3a3f4a',    // sterkere randen / knoppen
        paper: '#f4f2ec',        // lichte plaat / hero-vlak
        'paper-2': '#e8e5db',
        mut: '#8b9099',          // gedempte tekst
        'mut-d': '#5d6068',      // sterker gedempt
        signal: '#df5c02',       // accent
        'signal-d': '#b34a02',
        'signal-soft': '#2a1607',
        ok: '#3fb27f',
        'line-on-light': '#d8d3c6',
        anthracite: '#2C2F40',
      },
      fontFamily: {
        headline: ['Archivo', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Archivo', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}
