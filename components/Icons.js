// Inline-SVG iconen, overgenomen uit newdesign/. Eén bron van waarheid voor
// categorie- en onderdeel-iconen, zodat alle schermen consistent zijn.

const PATHS = {
  // categorieën (machine-types)
  grasmaaiers: (
    <>
      <rect x="3" y="13" width="13" height="6" rx="1" />
      <circle cx="6" cy="19" r="2" />
      <path d="M16 16h3l2-6h-5M9 13V8h4" />
    </>
  ),
  kettingzagen: (
    <>
      <path d="M3 8h11l7 3-7 3H3z" />
      <path d="M5 8v6M8 8v6M11 8v6" />
    </>
  ),
  bosmaaiers: <path d="M12 3v10M12 13l-7 8M12 13l7 8M8 6h8" />,
  bladblazers: <path d="M4 12h10l6-4v8l-6-4M4 9v6" />,
  heggenscharen: (
    <>
      <path d="M3 7h18M3 12h18M3 17h18" />
      <path d="M7 7v10M17 7v10" />
    </>
  ),
  generatoren: (
    <>
      <rect x="3" y="8" width="18" height="11" rx="2" />
      <path d="M7 8V6h10v2M11 12l-2 3h4l-2 3" />
    </>
  ),
  'accu-gereedschap': (
    <>
      <rect x="4" y="8" width="14" height="9" rx="2" />
      <path d="M18 11h2v3h-2M8 5h4v3" />
    </>
  ),

  // onderdeel-categorieën (producttypes)
  brandstof: <path d="M3 22h12M14 9l4-4 3 3-4 4M5 22V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14M5 12h8" />,
  maaimes: <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />,
  ketting: (
    <>
      <path d="M3 8h11l7 3-7 3H3z" />
      <path d="M5 8v6M8 8v6M11 8v6" />
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
      <path d="M18 11h2v3h-2" />
    </>
  ),
  lader: <path d="M5 22V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14M14 9l4-4 3 3-4 4" />,
  zaagblad: (
    <>
      <path d="M3 6h18M5 6l3 13h8l3-13M9 6V4h6v2" />
      <path d="M7 10h10M8 14h8" />
    </>
  ),
  boren: <path d="M6 3h6v6l3 3v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V3zM6 8h6" />,

  // UI
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
