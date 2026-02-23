import { useState } from 'react'
import type { Recommendation } from '~/lib/types'
import { RecCard } from './RecCard'

interface Props {
  recommendations: Recommendation[]
}

type FilterType = 'all' | 'gap_fill' | 'deep_cut' | 'emerging'
type SortType = 'confidence' | 'type' | 'artist'

const FILTERS: ReadonlyArray<{ value: FilterType; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'gap_fill', label: 'Gap Fill' },
  { value: 'deep_cut', label: 'Deep Cut' },
  { value: 'emerging', label: 'Emerging' },
]

const FILTER_ACTIVE_STYLES: Record<FilterType, string> = {
  all: 'border-accent bg-accent/10 text-accent',
  gap_fill: 'border-gap-fill bg-gap-fill/10 text-gap-fill',
  deep_cut: 'border-deep-cut bg-deep-cut/10 text-deep-cut',
  emerging: 'border-emerging bg-emerging/10 text-emerging',
}

function countByType(recs: Recommendation[]): Record<FilterType, number> {
  const counts = { all: recs.length, gap_fill: 0, deep_cut: 0, emerging: 0 }
  for (const r of recs) counts[r.discoveryType]++
  return counts
}

export function RecGrid({ recommendations }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('confidence')
  const counts = countByType(recommendations)

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

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                filter === value
                  ? FILTER_ACTIVE_STYLES[value]
                  : 'border-border bg-surface text-text-muted hover:border-border hover:bg-surface-hover hover:text-text'
              }`}
            >
              {label}
              <span className="ml-1.5 opacity-50">{counts[value]}</span>
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortType)}
          className="ml-auto rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted outline-none transition focus:border-accent"
        >
          <option value="confidence">By confidence</option>
          <option value="type">By type</option>
          <option value="artist">By artist</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((rec, i) => (
          <RecCard
            key={`${rec.artist}-${rec.title}-${i}`}
            rec={rec}
            index={i}
          />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-text-muted">No recommendations match this filter.</p>
        </div>
      )}
    </div>
  )
}
