import { useState } from 'react'
import type { Recommendation } from '~/lib/types'

interface Props {
  rec: Recommendation
  index: number
}

const TYPE_STYLES = {
  gap_fill: {
    badge: 'border-gap-fill/30 bg-gap-fill/10 text-gap-fill',
    label: 'Gap Fill',
  },
  deep_cut: {
    badge: 'border-deep-cut/30 bg-deep-cut/10 text-deep-cut',
    label: 'Deep Cut',
  },
  emerging: {
    badge: 'border-emerging/30 bg-emerging/10 text-emerging',
    label: 'Emerging',
  },
} as const

export function RecCard({ rec, index }: Props) {
  const [expanded, setExpanded] = useState(false)
  const style = TYPE_STYLES[rec.discoveryType]
  const isTruncatable = rec.reason.length > 80
  const displayReason = expanded
    ? rec.reason
    : rec.reason.slice(0, 80) + (isTruncatable ? '...' : '')
  const pct = Math.round(rec.confidence * 100)

  return (
    <div
      className={`card-glow-${rec.discoveryType} animate-fade-up rounded-xl border border-border/60 bg-surface p-5`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[15px] font-bold leading-tight text-text">
            {rec.title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-text-muted">{rec.artist}</p>
          <p className="truncate text-xs text-text-dim">{rec.album}</p>
        </div>
        <span
          className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}
        >
          {style.label}
        </span>
      </div>

      {/* Confidence */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] text-text-dim">
          <span>Confidence</span>
          <span className="font-medium text-text-muted">{pct}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border/60">
          <div
            className="confidence-bar h-full rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Reason */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left text-xs leading-relaxed text-text-muted transition hover:text-text"
      >
        {displayReason}
        {isTruncatable && (
          <span className="ml-1 font-medium text-accent">
            {expanded ? 'less' : 'more'}
          </span>
        )}
      </button>

      {rec.tidalUrl && (
        <a
          href={rec.tidalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent transition hover:text-accent-hover"
        >
          Open in Tidal
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 1h6v6M9 1L1 9" />
          </svg>
        </a>
      )}
    </div>
  )
}
