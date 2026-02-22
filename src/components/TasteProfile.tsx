import type { TasteAnalysis, TasteProfile } from '~/lib/types'

interface Props {
  analysis: TasteAnalysis
  profile: TasteProfile
}

export function TasteProfileCard({ analysis, profile }: Props) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="mb-4 text-lg font-semibold text-accent">
        Your Taste Profile
      </h2>

      <p className="mb-5 leading-relaxed text-text">{analysis.summary}</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.primaryGenres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-accent-dim px-3 py-1 text-xs font-medium text-accent"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Moods
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.moodDescriptors.map((mood) => (
              <span
                key={mood}
                className="rounded-full bg-surface-hover px-3 py-1 text-xs font-medium text-text-muted"
              >
                {mood}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Era Preference
          </h3>
          <p className="text-sm text-text">{analysis.eraPreference}</p>

          <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Top Artists
          </h3>
          <p className="text-sm text-text-muted">
            {profile.topArtists
              .slice(0, 5)
              .map((a) => a.name)
              .join(', ')}
          </p>
        </div>
      </div>
    </div>
  )
}
