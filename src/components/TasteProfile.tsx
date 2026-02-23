import type { TasteAnalysis, TasteProfile } from '~/lib/types'

interface Props {
  analysis: TasteAnalysis
  profile: TasteProfile
}

export function TasteProfileCard({ analysis, profile }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-surface">
      <div className="border-b border-border/40 px-6 py-4">
        <h2 className="font-display text-xs font-bold uppercase tracking-widest text-accent">
          Your Taste Profile
        </h2>
      </div>

      <div className="p-6">
        <p className="font-display text-xl font-semibold leading-relaxed text-text sm:text-2xl">
          &ldquo;{analysis.summary}&rdquo;
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-text-dim">
              Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.primaryGenres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1 text-xs font-medium text-accent"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-text-dim">
              Moods
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.moodDescriptors.map((mood) => (
                <span
                  key={mood}
                  className="rounded-full border border-border bg-surface-hover px-3 py-1 text-xs font-medium text-text-muted"
                >
                  {mood}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-text-dim">
                Era
              </h3>
              <p className="text-sm text-text">{analysis.eraPreference}</p>
            </div>

            <div>
              <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-text-dim">
                Top Artists
              </h3>
              <p className="text-sm text-text-muted">
                {profile.topArtists
                  .slice(0, 5)
                  .map((a) => a.name)
                  .join(' \u00B7 ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
