import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Track } from '~/lib/types'

const SESSION_FILE = resolve('.tidal-session.json')

const CLIENT_ID = 'fX2JxdmntZWK0ixT'
const CLIENT_SECRET = '1Nn9AfDAjxrgJFJbKNWLeAyKGVGmINuXPPLHVXAvxAg='
const AUTH_BASE = 'https://auth.tidal.com/v1/oauth2'
const API_BASE = 'https://api.tidal.com'
const FORM_URLENCODED = { 'Content-Type': 'application/x-www-form-urlencoded' } as const
const DEFAULT_SCOPES = 'r_usr w_usr w_sub'

// ---- Session management ----

interface StoredSession {
  token_type: string
  access_token: string
  refresh_token: string | null
  expiry_time: number // epoch seconds
  country_code?: string
}

let session: StoredSession | null = null

function loadSession(): StoredSession | null {
  if (session) return session
  if (!existsSync(SESSION_FILE)) return null
  try {
    session = JSON.parse(readFileSync(SESSION_FILE, 'utf-8'))
    return session
  } catch {
    return null
  }
}

function saveSession(s: StoredSession): void {
  session = s
  writeFileSync(SESSION_FILE, JSON.stringify(s, null, 2))
}

function clearSession(): void {
  session = null
  try { unlinkSync(SESSION_FILE) } catch { /* file may not exist */ }
}

function isExpired(s: StoredSession): boolean {
  return Date.now() / 1000 > s.expiry_time - 60 // 60s grace
}

function computeExpiryTime(expiresIn: number | undefined): number {
  return Math.floor(Date.now() / 1000) + (expiresIn ?? 86400)
}

function authHeader(s: StoredSession): { Authorization: string } {
  return { Authorization: `${s.token_type} ${s.access_token}` }
}

// ---- Token management ----

let refreshPromise: Promise<StoredSession> | null = null

async function refreshToken(s: StoredSession): Promise<StoredSession> {
  if (refreshPromise) return refreshPromise
  refreshPromise = doRefreshToken(s).finally(() => { refreshPromise = null })
  return refreshPromise
}

async function doRefreshToken(s: StoredSession): Promise<StoredSession> {
  if (!s.refresh_token) throw new Error('No refresh token available')

  const res = await fetch(`${AUTH_BASE}/token`, {
    method: 'POST',
    headers: FORM_URLENCODED,
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: s.refresh_token,
      grant_type: 'refresh_token',
      scope: DEFAULT_SCOPES,
    }),
  })

  if (!res.ok) {
    clearSession()
    throw new Error('TIDAL_NOT_AUTHENTICATED')
  }

  const data = await res.json()
  const updated: StoredSession = {
    token_type: data.token_type ?? s.token_type,
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? s.refresh_token,
    expiry_time: computeExpiryTime(data.expires_in),
    country_code: data.user?.countryCode ?? s.country_code,
  }
  saveSession(updated)
  return updated
}

async function getValidSession(): Promise<StoredSession> {
  const s = loadSession()
  if (!s) throw new Error('TIDAL_NOT_AUTHENTICATED')
  if (isExpired(s)) return refreshToken(s)
  return s
}

// ---- API request helpers ----

async function authenticatedFetch(url: string, s: StoredSession): Promise<Response> {
  return fetch(url, { headers: authHeader(s) })
}

async function apiGet(path: string, params: Record<string, string> = {}): Promise<unknown> {
  const s = await getValidSession()
  const url = new URL(`${API_BASE}${path}`)
  url.searchParams.set('countryCode', s.country_code || 'US')
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const href = url.toString()
  const res = await authenticatedFetch(href, s)

  if (res.status === 401) {
    const refreshed = await refreshToken(s)
    const retry = await authenticatedFetch(href, refreshed)
    if (!retry.ok) throw new Error(`Tidal API error: ${retry.status} ${retry.statusText}`)
    return retry.json()
  }

  if (!res.ok) throw new Error(`Tidal API error: ${res.status} ${res.statusText}`)
  return res.json()
}

// ---- Track parsing ----

/** Raw track shape from the Tidal API. Playlist endpoints nest under `item`, others are flat. */
interface TidalTrackItem {
  item?: TidalTrackFields
  id?: number
  title?: string
  artist?: { name: string }
  artists?: Array<{ name: string }>
  album?: { title: string }
  duration?: number
}

interface TidalTrackFields {
  id: number
  title: string
  artist?: { name: string }
  artists?: Array<{ name: string }>
  album?: { title: string }
  duration: number
}

function parseTrack(raw: TidalTrackItem): Track | null {
  const t = raw.item ?? raw
  if (!t.id) return null
  return {
    id: String(t.id),
    title: t.title ?? 'Unknown',
    artist: t.artist?.name ?? t.artists?.[0]?.name ?? 'Unknown',
    album: t.album?.title ?? 'Unknown',
    duration: t.duration ?? 0,
  }
}

function parseTracks(items: TidalTrackItem[]): Track[] {
  return items.reduce<Track[]>((acc, raw) => {
    const t = parseTrack(raw)
    if (t) acc.push(t)
    return acc
  }, [])
}

// ---- Public API ----

export function isAuthenticated(): boolean {
  const s = loadSession()
  if (!s) return false
  return s.refresh_token !== null || !isExpired(s)
}

export async function startDeviceLogin(): Promise<{
  verification_uri: string
  verification_uri_complete: string
  user_code: string
  device_code: string
  expires_in: number
  interval: number
}> {
  const res = await fetch(`${AUTH_BASE}/device_authorization`, {
    method: 'POST',
    headers: FORM_URLENCODED,
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      scope: DEFAULT_SCOPES,
    }),
  })

  if (!res.ok) throw new Error(`Tidal device auth failed: ${res.status}`)
  return res.json()
}

export async function pollDeviceLogin(
  deviceCode: string,
): Promise<{ status: 'authenticated' | 'pending' | 'expired' | 'error'; message?: string }> {
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: 'POST',
    headers: FORM_URLENCODED,
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      scope: DEFAULT_SCOPES,
    }),
  })

  if (res.ok) {
    const data = await res.json()
    saveSession({
      token_type: data.token_type,
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? null,
      expiry_time: computeExpiryTime(data.expires_in),
      country_code: data.user?.countryCode,
    })
    return { status: 'authenticated' }
  }

  let errorData: Record<string, string> = {}
  try { errorData = await res.json() } catch { /* non-JSON error body */ }

  if (errorData.error === 'expired_token') return { status: 'expired' }
  if (errorData.error === 'authorization_pending') return { status: 'pending' }
  return { status: 'error', message: errorData.error_description ?? errorData.error ?? `HTTP ${res.status}` }
}

export async function fetchPlaylistTracks(playlistId: string): Promise<Track[]> {
  const tracks: Track[] = []
  let offset = 0
  const limit = 100

  while (true) {
    const data = (await apiGet(`/v1/playlists/${playlistId}/tracks`, {
      limit: String(limit),
      offset: String(offset),
    })) as { items?: TidalTrackItem[]; totalNumberOfItems?: number }

    const items = data.items ?? []
    const total = data.totalNumberOfItems ?? 0

    tracks.push(...parseTracks(items))

    if (items.length === 0 || offset + limit >= total) break
    offset += limit
  }

  return tracks
}

export async function searchArtist(name: string): Promise<{ id: number; name: string } | null> {
  const data = (await apiGet('/v1/search', {
    query: name,
    types: 'ARTISTS',
    limit: '1',
  })) as { artists?: { items: Array<{ id: number; name: string }> } }

  const artist = data.artists?.items?.[0]
  return artist ? { id: artist.id, name: artist.name } : null
}

export async function getSimilarArtists(
  artistId: number,
): Promise<Array<{ id: number; name: string }>> {
  const data = (await apiGet(`/v1/artists/${artistId}/similar`, {
    limit: '3',
  })) as { items: Array<{ id: number; name: string }> }

  return data.items ?? []
}

export async function getArtistTopTracks(artistId: number): Promise<Track[]> {
  const data = (await apiGet(`/v1/artists/${artistId}/toptracks`, {
    limit: '5',
  })) as { items: TidalTrackItem[] }

  return parseTracks(data.items ?? [])
}

export async function getTrackRadio(trackId: string): Promise<Track[]> {
  const data = (await apiGet(`/v1/tracks/${trackId}/radio`, {
    limit: '10',
  })) as { items: TidalTrackItem[] }

  return parseTracks(data.items ?? [])
}
