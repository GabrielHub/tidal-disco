export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
}

export interface TasteProfile {
  totalTracks: number
  uniqueArtists: number
  topArtists: { name: string; count: number }[]
  avgDuration: number
  summaryText: string
}

export interface Recommendation {
  title: string
  artist: string
  album: string
  source: 'tidal-similar' | 'tidal-radio' | 'claude'
  reason: string
  discoveryType: 'gap_fill' | 'deep_cut' | 'emerging'
  confidence: number
  tidalUrl?: string
}

export interface TasteAnalysis {
  summary: string
  primaryGenres: string[]
  moodDescriptors: string[]
  eraPreference: string
}

export interface DiscoveryResult {
  tasteAnalysis: TasteAnalysis
  recommendations: Recommendation[]
  tasteProfile: TasteProfile
  stats: {
    tidalCandidates: number
    finalPicks: number
  }
}
