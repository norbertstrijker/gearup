// Inline-SVG iconen. Eén bron van waarheid voor categorie-, onderdeel- en
// UI-iconen, zodat alle schermen consistent zijn.

const PATHS = {
  // ── categorieën (machine-types) — herkenbare silhouetten ──
  grasmaaiers: (
    <>
      <path d="M3 17h11v-3a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3z" />
      <circle cx="6.5" cy="20" r="1.6" />
      <circle cx="12.5" cy="20" r="1.6" />
      <path d="M14 14h4l3-7M18 7h3" />
      <path d="M5 11V8" />
    </>
  ),
  kettingzagen: (
    <>
      <path d="M3 9h9l9 2.5L12 14H3z" />
      <path d="M12 9V7h4l2 2" />
      <path d="M5 9v5M8 9v5M11 9v5" />
    </>
  ),
  bosmaaiers: (
    <>
      <path d="M7 3l3 3-6 14" />
      <path d="M10 6l8 1.5L13 11l6 1.5L11 14" />
    </>
  ),
  bladblazers: (
    <>
      <path d="M3 10a4 4 0 0 1 4-4h4v8H7a4 4 0 0 1-4-4z" />
      <path d="M11 8l7-3v10l-7-3" />
      <path d="M5 14v3h3" />
    </>
  ),
  heggenscharen: (
    <>
      <path d="M3 5l9 6M3 9l9 2" />
      <path d="M14 11h7M14 11l3-2M14 11l3 2" />
      <circle cx="12.5" cy="9.5" r="1" />
    </>
  ),
  generatoren: (
    <>
      <rect x="3" y="8" width="18" height="10" rx="2" />
      <path d="M7 8V6h10v2" />
      <path d="M12 11l-1.5 2.5h3L12 16" />
    </>
  ),
  'accu-gereedschap': (
    <>
      <path d="M7 20v-7l-2-2 4-4 2 2 5-5 3 3-5 5 2 2-4 4z" />
      <path d="M9 11l4 4" />
    </>
  ),

  // ── onderdeel-categorieën (producttypes) ──
  brandstof: <path d="M3 22h12M14 9l4-4 3 3-4 4M5 22V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14M5 12h8" />,
  maaimes: <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />,
  ketting: (
    <>
      <path d="M3 9h9l9 2.5L12 14H3z" />
      <path d="M5 9v5M8 9v5M11 9v5" />
    </>
  ),
  bougie: <path d="M12 2v6M9 8h6l-1 8a2 2 0 0 1-4 0z M10 22h4" />,
  filter: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 6v12M11 6v12M15 6v12" />
    </>
  ),
  olie: (
    <>
      <path d="M5 22V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14M14 9l4-4 3 3-4 4" />
      <circle cx="9" cy="14" r="1.5" />
    </>
  ),
  maaidraad: <path d="M12 3v10M12 13l-7 8M12 13l7 8M8 6h8" />,
  accu: (
    <>
      <rect x="4" y="8" width="14" height="9" rx="2" />
      <path d="M18 11h2v3h-2M8 5h4v3" />
    </>
  ),
  lader: <path d="M5 22V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14M14 9l4-4 3 3-4 4" />,
  zaagblad: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 5v2M12 17v2M5 12h2M17 12h2M7 7l1.5 1.5M15.5 15.5L17 17M17 7l-1.5 1.5M8.5 15.5L7 17" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  boren: <path d="M6 3h6v6l3 3v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V3zM6 8h6" />,

  // ── UI ──
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  shield: (
    <>
      <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  leaf: (
    <>
      <path d="M4 20s1-7 6-11 10-5 10-5-0 6-4 10-8 4-12 6z" />
      <path d="M9 15c2-2 4-3 7-4" />
    </>
  ),
  plug: (
    <>
      <path d="M9 2v6M15 2v6" />
      <path d="M7 8h10v3a5 5 0 0 1-10 0z" />
      <path d="M12 16v6" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </>
  ),
  warning: (
    <>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </>
  ),
  edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  notFound: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3M11 8v3M11 14h.01" />
    </>
  ),
  photo: (
    <>
      <rect x="14" y="44" width="58" height="26" rx="4" />
      <circle cx="26" cy="74" r="8" />
      <circle cx="60" cy="74" r="8" />
      <path d="M72 52h18l14-26M84 44V30h16" />
      <path d="M22 44l6-12h30l6 12" />
    </>
  ),
}

export default function Icon({ name, className = '', strokeWidth = 1.8, viewBox = '0 0 24 24', ...rest }) {
  const path = PATHS[name] || PATHS.search
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  )
}

export function hasIcon(name) {
  return Boolean(PATHS[name])
}
