import { useState } from 'react'
import type { Recommendation } from '~/lib/types'

interface Props {
  rec: Recommendation
}

const typeColors = {
  gap_fill: 'bg-gap-fill/20 text-gap-fill',
  deep_cut: 'bg-deep-cut/20 text-deep-cut',
  emerging: 'bg-emerging/20 text-emerging',
} as const

const typeLabels = {
  gap_fill: 'Gap Fill',
  deep_cut: 'Deep Cut',
  emerging: 'Emerging',
} as const

export function RecCard({ rec }: Props) {
  const [expanded, setExpanded] = useState(false)
  const isTruncatable = rec.reason.length > 80
  const displayedReason = expanded
    ? rec.reason
    : rec.reason.slice(0, 80) + (isTruncatable ? '...' : '')
  const confidencePercent = Math.round(rec.confidence * 100)

  return (
    <div className="group rounded-lg border border-border bg-surface p-4 transition hover:border-accent/30 hover:bg-surface-hover">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-text">{rec.title}</h3>
          <p className="truncate text-sm text-text-muted">{rec.artist}</p>
          <p className="truncate text-xs text-text-muted">{rec.album}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[rec.discoveryType]}`}
        >
          {typeLabels[rec.discoveryType]}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Confidence</span>
          <span>{confidencePercent}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
          <div
            className="confidence-bar h-full rounded-full transition-all"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left text-xs text-text-muted hover:text-text"
      >
        {displayedReason}
        {isTruncatable && (
          <span className="ml-1 text-accent">
            {expanded ? 'less' : 'more'}
          </span>
        )}
      </button>

      {rec.tidalUrl && (
        <a
          href={rec.tidalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-accent hover:underline"
        >
          Open in Tidal
        </a>
      )}
    </div>
  )
}
