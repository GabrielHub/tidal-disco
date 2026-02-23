import type { TasteAnalysis, TasteProfile } from '~/lib/types'

interface Props {
  analysis: TasteAnalysis
  profile: TasteProfile
}

export function TasteProfileCard({ analysis, profile }: Props) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-dim">
        Taste Profile
      </p>
      <hr className="editorial-thick mt-2" />

      {/* Quote-style summary */}
      <blockquote className="mt-6 border-l-2 border-accent pl-5">
        <p className="font-display text-xl italic leading-snug text-text sm:text-2xl">
          &ldquo;{analysis.summary}&rdquo;
        </p>
      </blockquote>

      {/* Genres */}
      <div className="mt-8">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-dim">
          Primary Genres
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {analysis.primaryGenres.map((genre) => (
            <span
              key={genre}
              className="border border-text bg-text px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-bg"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Moods */}
      <div className="mt-6">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-dim">
          Moods
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {analysis.moodDescriptors.map((mood) => (
            <span
              key={mood}
              className="border border-border px-3 py-1 text-[11px] font-light text-text-muted"
            >
              {mood}
            </span>
          ))}
        </div>
      </div>

      <hr className="editorial mt-6" />

      {/* Era */}
      <div className="mt-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-dim">
          Era Preference
        </h3>
        <p className="mt-2 text-sm font-light leading-relaxed text-text">
          {analysis.eraPreference}
        </p>
      </div>

      <hr className="editorial mt-5" />

      {/* Top Artists */}
      <div className="mt-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-dim">
          Top Artists
        </h3>
        <div className="mt-3 space-y-1.5">
          {profile.topArtists.slice(0, 8).map((a, i) => (
            <div key={a.name} className="flex items-baseline gap-3">
              <span className="w-5 text-right font-display text-sm text-text-dim">
                {i + 1}
              </span>
              <span className="text-sm text-text">{a.name}</span>
              <span className="ml-auto text-xs tabular-nums text-text-dim">
                {a.count} tracks
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
