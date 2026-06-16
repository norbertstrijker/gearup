// Eén gedeelde, gecentreerde contentbreedte voor de hele site (fase-1, punt A).
// Header én pagina-inhoud gebruiken dit, zodat logo en content overal consistent
// uitgelijnd staan. Mobiel: px-[18px] marge, gecentreerd.
export default function Container({ as: Tag = 'div', className = '', children }) {
  return <Tag className={`w-full max-w-3xl mx-auto px-[18px] ${className}`}>{children}</Tag>
}
