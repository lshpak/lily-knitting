const s = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function WipsIcon(props) {
  return (
    <svg {...s} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c-1.5 3-1.5 6 0 9s1.5 6 0 9" />
      <path d="M3 12c3-1.5 6-1.5 9 0s6 1.5 9 0" />
    </svg>
  )
}

export function YarnIcon(props) {
  return (
    <svg {...s} {...props}>
      <path d="M3 17l4-4 4 4 4-4 4 4" />
      <path d="M3 11l4-4 4 4 4-4 4 4" />
    </svg>
  )
}

export function PatternsIcon(props) {
  return (
    <svg {...s} {...props}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

export function DoneIcon(props) {
  return (
    <svg {...s} {...props}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

export function TodoIcon(props) {
  return (
    <svg {...s} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 12h8" />
      <path d="M8 8h8" />
      <path d="M8 16h4" />
    </svg>
  )
}

export function StatsIcon(props) {
  return (
    <svg {...s} {...props}>
      <rect x="4" y="14" width="4" height="7" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="16" y="3" width="4" height="18" rx="1" />
    </svg>
  )
}

export function CalendarIcon(props) {
  return (
    <svg {...s} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <rect x="7" y="13" width="3" height="3" rx="0.5" />
    </svg>
  )
}
