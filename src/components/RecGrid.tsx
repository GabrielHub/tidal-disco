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

const FILTER_COLORS: Record<FilterType, string> = {
  all: 'bg-text text-bg',
  gap_fill: 'bg-gap-fill text-white',
  deep_cut: 'bg-deep-cut text-white',
  emerging: 'bg-emerging text-white',
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
      {/* Controls — editorial style */}
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-dim">
          Curated Tracklist
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortType)}
          className="rounded-none border-b border-border bg-transparent py-1 text-[11px] font-medium text-text-muted outline-none transition focus:border-text"
        >
          <option value="confidence">Sort: Confidence</option>
          <option value="type">Sort: Type</option>
          <option value="artist">Sort: Artist</option>
        </select>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 border-b-2 border-text pb-3 pt-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wider transition ${
              filter === value
                ? FILTER_COLORS[value]
                : 'bg-transparent text-text-muted hover:text-text'
            }`}
          >
            {label}
            <span className="ml-1.5 text-[10px] opacity-60">{counts[value]}</span>
          </button>
        ))}
      </div>

      {/* Tracklist header */}
      <div className="flex items-center gap-4 border-b border-border py-2 text-[10px] font-semibold uppercase tracking-wider text-text-dim sm:gap-6">
        <span className="w-8 text-right">#</span>
        <span className="flex-1">Track</span>
        <span className="hidden w-16 sm:block">Type</span>
        <span className="hidden w-20 sm:block">Conf.</span>
        <span className="w-6" />
      </div>

      {/* Track rows */}
      <div>
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
          <p className="font-display text-xl italic text-text-dim">
            No tracks match this filter.
          </p>
        </div>
      )}
    </div>
  )
}
