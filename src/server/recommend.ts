import { createServerFn } from '@tanstack/react-start'
import { fetchPlaylist, fetchTidalRecommendations } from './tidal'
import { generateDiscoveryStrategy, curateRecommendations } from './claude'
import { buildTasteProfile } from '~/lib/analyzer'
import type { DiscoveryResult, Track } from '~/lib/types'

/** Deduplicate tracks by artist + title, preserving first occurrence. */
function deduplicateTracks(tracks: Track[]): Track[] {
  const seen = new Set<string>()
  return tracks.filter((t) => {
    const key = `${t.artist}-${t.title}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Match Claude's track radio query strings to actual track IDs in the playlist.
 * Falls back to evenly-spaced picks if fewer than 3 matches are found.
 */
function resolveTrackSeeds(queries: string[], tracks: Track[]): string[] {
  const ids: string[] = []

  for (const query of queries) {
    const lowerQuery = query.toLowerCase()
    const match = tracks.find(
      (t) =>
        t.id === query ||
        t.title.toLowerCase().includes(lowerQuery) ||
        `${t.artist} - ${t.title}`.toLowerCase().includes(lowerQuery),
    )
    if (match) {
      ids.push(match.id)
    }
  }

  if (ids.length < 3 && tracks.length > 0) {
    const step = Math.max(1, Math.floor(tracks.length / 5))
    for (let i = 0; i < 5 && i * step < tracks.length; i++) {
      const id = tracks[i * step].id
      if (!ids.includes(id)) {
        ids.push(id)
      }
    }
  }

  return ids
}

export const runDiscovery = createServerFn({ method: 'POST' })
  .inputValidator((data: { playlistUrl: string }) => data)
  .handler(async ({ data }): Promise<DiscoveryResult> => {
    const tracks = await fetchPlaylist({
      data: { playlistUrl: data.playlistUrl },
    })

    const tasteProfile = buildTasteProfile(tracks)

    const { tasteAnalysis, searchDirections } =
      await generateDiscoveryStrategy({
        data: { tasteProfile, sampleTracks: tracks },
      })

    const seedArtists = searchDirections
      .filter((d) => d.type === 'similar_artist')
      .map((d) => d.query)

    const trackRadioQueries = searchDirections
      .filter((d) => d.type === 'track_radio')
      .map((d) => d.query)

    const seedTrackIds = resolveTrackSeeds(trackRadioQueries, tracks)

    const { similarArtistTracks, radioTracks } =
      await fetchTidalRecommendations({
        data: { seedArtists, seedTrackIds },
      })

    const allCandidates = deduplicateTracks([
      ...similarArtistTracks,
      ...radioTracks,
    ])

    const { recommendations } = await curateRecommendations({
      data: {
        tasteAnalysis,
        tasteProfile,
        candidates: allCandidates,
        existingTracks: tracks,
      },
    })

    return {
      tasteAnalysis,
      recommendations,
      tasteProfile,
      stats: {
        tidalCandidates: allCandidates.length,
        finalPicks: recommendations.length,
      },
    }
  })
