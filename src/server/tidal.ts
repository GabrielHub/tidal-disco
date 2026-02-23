import { createServerFn } from '@tanstack/react-start'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import type { Track } from '~/lib/types'

const execFileAsync = promisify(execFile)

const PYTHON = process.env.PYTHON_PATH || 'python'
const BRIDGE = path.resolve('python/tidal_bridge.py')

async function callBridge(args: string[]): Promise<string> {
  try {
    const { stdout, stderr } = await execFileAsync(PYTHON, [BRIDGE, ...args], {
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
    })
    if (stderr) {
      console.error('[tidal_bridge]', stderr)
    }
    return stdout
  } catch (err: unknown) {
    // execFileAsync errors include stdout/stderr from the failed process
    const execErr = err as { code?: number; stdout?: string; stderr?: string; message?: string }

    // Exit code 2 = auth issue from the Python bridge
    if (execErr.code === 2) {
      throw new Error('TIDAL_NOT_AUTHENTICATED')
    }

    // Also check stdout for auth JSON in case code isn't available
    const combined = `${execErr.stdout || ''} ${execErr.stderr || ''} ${execErr.message || ''}`
    if (combined.includes('not_authenticated') || combined.includes('session_expired')) {
      throw new Error('TIDAL_NOT_AUTHENTICATED')
    }

    throw new Error(`Tidal API error: ${execErr.message || String(err)}`)
  }
}

function parsePlaylistId(url: string): string {
  const match = url.match(/playlist\/([a-f0-9-]+)/i)
  if (match) return match[1]
  if (/^[a-f0-9-]+$/i.test(url.trim())) return url.trim()
  throw new Error(`Could not extract playlist ID from: ${url}`)
}

// ---- Auth endpoints ----

export const checkTidalAuth = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ authenticated: boolean }> => {
    const stdout = await callBridge(['check_auth'])
    return JSON.parse(stdout)
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
    const stdout = await callBridge(['login_start'])
    return JSON.parse(stdout)
  },
)

export const pollTidalLogin = createServerFn({ method: 'POST' })
  .inputValidator((data: { deviceCode: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<{ status: 'authenticated' | 'pending' | 'expired' | 'error'; message?: string }> => {
      const stdout = await callBridge(['login_poll', data.deviceCode])
      return JSON.parse(stdout)
    },
  )

// ---- Data endpoints ----

export const fetchPlaylist = createServerFn({ method: 'POST' })
  .inputValidator((data: { playlistUrl: string }) => data)
  .handler(async ({ data }): Promise<Track[]> => {
    const playlistId = parsePlaylistId(data.playlistUrl)
    const stdout = await callBridge(['fetch_playlist', playlistId])
    return JSON.parse(stdout) as Track[]
  })

export const fetchTidalRecommendations = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { seedArtists: string[]; seedTrackIds: string[] }) => data,
  )
  .handler(
    async ({
      data,
    }): Promise<{ similarArtistTracks: Track[]; radioTracks: Track[] }> => {
      const [similarRaw, radioRaw] = await Promise.all([
        data.seedArtists.length > 0
          ? callBridge(['similar_artists', ...data.seedArtists])
          : Promise.resolve('[]'),
        data.seedTrackIds.length > 0
          ? callBridge(['track_radio', ...data.seedTrackIds])
          : Promise.resolve('[]'),
      ])

      const similarData = JSON.parse(similarRaw) as Array<{
        source_artist: string
        similar_artist: string
        tracks: Track[]
      }>
      const similarArtistTracks = similarData.flatMap((s) => s.tracks)
      const radioTracks = JSON.parse(radioRaw) as Track[]

      return { similarArtistTracks, radioTracks }
    },
  )
