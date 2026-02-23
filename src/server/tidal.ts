import { createServerFn } from '@tanstack/react-start'
import type { Track } from '~/lib/types'
import * as tidal from './tidal-client'

function parsePlaylistId(url: string): string {
  const match = url.match(/playlist\/([a-f0-9-]+)/i)
  if (match) return match[1]
  if (/^[a-f0-9-]+$/i.test(url.trim())) return url.trim()
  throw new Error(`Could not extract playlist ID from: ${url}`)
}

// ---- Auth endpoints ----

export const checkTidalAuth = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ authenticated: boolean }> => {
    return { authenticated: tidal.isAuthenticated() }
  },
)

export const startTidalLogin = createServerFn({ method: 'POST' }).handler(
  async (): Promise<{
    verification_uri: string
    verification_uri_complete: string
    user_code: string
    device_code: string
    expires_in: number
    interval: number
  }> => {
    return tidal.startDeviceLogin()
  },
)

export const pollTidalLogin = createServerFn({ method: 'POST' })
  .inputValidator((data: { deviceCode: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<{ status: 'authenticated' | 'pending' | 'expired' | 'error'; message?: string }> => {
      return tidal.pollDeviceLogin(data.deviceCode)
    },
  )

// ---- Data endpoints ----

export const fetchPlaylist = createServerFn({ method: 'POST' })
  .inputValidator((data: { playlistUrl: string }) => data)
  .handler(async ({ data }): Promise<Track[]> => {
    const playlistId = parsePlaylistId(data.playlistUrl)
    return tidal.fetchPlaylistTracks(playlistId)
  })

export const fetchTidalRecommendations = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { seedArtists: string[]; seedTrackIds: string[] }) => data,
  )
  .handler(
    async ({
      data,
    }): Promise<{ similarArtistTracks: Track[]; radioTracks: Track[] }> => {
      // Similar artists pipeline
      const similarArtistTracks: Track[] = []
      for (const name of data.seedArtists) {
        try {
          const artist = await tidal.searchArtist(name)
          if (!artist) continue

          const similar = await tidal.getSimilarArtists(artist.id)
          for (const sim of similar) {
            try {
              const tracks = await tidal.getArtistTopTracks(sim.id)
              similarArtistTracks.push(...tracks)
            } catch (e) {
              console.error(`Error getting top tracks for ${sim.name}:`, e)
            }
          }
        } catch (e) {
          console.error(`Error finding similar artists for ${name}:`, e)
        }
      }

      // Track radio pipeline
      const radioMap = new Map<string, Track>()
      for (const tid of data.seedTrackIds) {
        try {
          const tracks = await tidal.getTrackRadio(tid)
          for (const t of tracks) {
            if (!radioMap.has(t.id)) radioMap.set(t.id, t)
          }
        } catch (e) {
          console.error(`Error getting radio for track ${tid}:`, e)
        }
      }

      return { similarArtistTracks, radioTracks: Array.from(radioMap.values()) }
    },
  )
