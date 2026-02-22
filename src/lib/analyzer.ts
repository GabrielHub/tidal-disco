import type { Track, TasteProfile } from './types'

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = String(seconds % 60).padStart(2, '0')
  return `${mins}:${secs}`
}

export function buildTasteProfile(tracks: Track[]): TasteProfile {
  const artistCounts = new Map<string, number>()

  for (const track of tracks) {
    artistCounts.set(track.artist, (artistCounts.get(track.artist) ?? 0) + 1)
  }

  const topArtists = [...artistCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }))

  const uniqueArtists = artistCounts.size

  const avgDuration =
    tracks.length > 0
      ? Math.round(
          tracks.reduce((sum, t) => sum + t.duration, 0) / tracks.length,
        )
      : 0

  const topArtistList = topArtists
    .slice(0, 10)
    .map((a) => `${a.name} (${a.count})`)
    .join(', ')

  const summaryText = [
    `Playlist with ${tracks.length} tracks from ${uniqueArtists} unique artists.`,
    `Average track duration: ${formatDuration(avgDuration)}.`,
    `Most played artists: ${topArtistList}.`,
  ].join(' ')

  return {
    totalTracks: tracks.length,
    uniqueArtists,
    topArtists,
    avgDuration,
    summaryText,
  }
}
