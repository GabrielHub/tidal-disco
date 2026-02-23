import { useState } from 'react'
import type { Recommendation } from '~/lib/types'

interface Props {
  rec: Recommendation
  index: number
}

const TYPE_META = {
  gap_fill: { label: 'Gap Fill', className: 'badge-gap_fill' },
  deep_cut: { label: 'Deep Cut', className: 'badge-deep_cut' },
  emerging: { label: 'Emerging', className: 'badge-emerging' },
} as const

export function RecCard({ rec, index }: Props) {
  const [expanded, setExpanded] = useState(false)
  const meta = TYPE_META[rec.discoveryType]
  const pct = Math.round(rec.confidence * 100)

  return (
    <div
      className="track-row animate-fade-up group border-b border-border-light"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Main row */}
      <div className="flex items-center gap-4 py-3.5 pr-2 sm:gap-6">
        {/* Number */}
        <span className="w-8 shrink-0 text-right font-display text-lg text-text-dim">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Track info */}
        <div className="min-w-0 flex-1">
          <span className="truncate text-sm font-medium text-text">
            {rec.title}
          </span>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
            <span className="truncate">{rec.artist}</span>
            <span className="text-text-dim">&middot;</span>
            <span className="truncate font-light italic text-text-dim">
              {rec.album}
            </span>
          </div>
        </div>

        {/* Type badge */}
        <span
          className={`hidden shrink-0 rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline-block ${meta.className}`}
        >
          {meta.label}
        </span>

        {/* Confidence */}
        <div className="hidden w-20 shrink-0 sm:block">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-dim">conf.</span>
            <span className="font-medium tabular-nums text-text-muted">{pct}%</span>
          </div>
          <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-border-light">
            <div
              className="confidence-bar h-full rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Expand / Tidal link */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 p-1 text-text-dim transition hover:text-accent"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="M3 5l4 4 4-4" />
          </svg>
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="animate-fade-in flex gap-4 pb-4 pl-12 sm:pl-14">
          {/* Mobile badges */}
          <div className="flex flex-col gap-2 sm:hidden">
            <span className={`rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.className}`}>
              {meta.label}
            </span>
            <span className="text-[10px] tabular-nums text-text-dim">{pct}% conf.</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-light leading-relaxed text-text-muted">
              {rec.reason}
            </p>
            {rec.tidalUrl && (
              <a
                href={rec.tidalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block border-b border-accent pb-0.5 text-[11px] font-medium text-accent transition hover:border-text hover:text-text"
              >
                Open in Tidal &rarr;
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
