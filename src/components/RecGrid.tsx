import { useState } from 'react'
import type { Recommendation } from '~/lib/types'
import { RecCard } from './RecCard'

interface Props {
  recommendations: Recommendation[]
}

type FilterType = 'all' | 'gap_fill' | 'deep_cut' | 'emerging'
type SortType = 'confidence' | 'type' | 'artist'

const FILTER_OPTIONS: ReadonlyArray<[FilterType, string]> = [
  ['all', 'All'],
  ['gap_fill', 'Gap Fill'],
  ['deep_cut', 'Deep Cut'],
  ['emerging', 'Emerging'],
]

function computeCounts(
  recs: Recommendation[],
): Record<FilterType, number> {
  const counts = { all: recs.length, gap_fill: 0, deep_cut: 0, emerging: 0 }
  for (const r of recs) {
    counts[r.discoveryType]++
  }
  return counts
}

export function RecGrid({ recommendations }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('confidence')

  const filtered =
    filter === 'all'
      ? recommendations
      : recommendations.filter((r) => r.discoveryType === filter)

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'confidence':
        return b.confidence - a.confidence
      case 'type':
        return a.discoveryType.localeCompare(b.discoveryType)
      case 'artist':
        return a.artist.localeCompare(b.artist)
    }
  })

  const counts = computeCounts(recommendations)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {FILTER_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === value
                  ? 'bg-accent text-bg'
                  : 'bg-surface text-text-muted hover:bg-surface-hover hover:text-text'
              }`}
            >
              {label}{' '}
              <span className="opacity-60">({counts[value]})</span>
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text outline-none focus:border-accent"
          >
            <option value="confidence">Sort by Confidence</option>
            <option value="type">Sort by Type</option>
            <option value="artist">Sort by Artist</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((rec, i) => (
          <RecCard key={`${rec.artist}-${rec.title}-${i}`} rec={rec} />
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="py-12 text-center text-text-muted">
          No recommendations match this filter.
        </p>
      )}
    </div>
  )
}
