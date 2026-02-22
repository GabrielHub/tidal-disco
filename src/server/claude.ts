import { createServerFn } from '@tanstack/react-start'
import { generateText } from 'ai'
import type {
  TasteProfile,
  Track,
  Recommendation,
  TasteAnalysis,
} from '~/lib/types'

const MODEL = 'google/gemini-3.1-pro-preview'

/** Extract JSON from a response, stripping optional markdown fences. */
function parseJson<T>(text: string): T {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = fenceMatch ? fenceMatch[1].trim() : text.trim()
  return JSON.parse(raw) as T
}

/**
 * Phase 1: Analyze taste and generate a discovery strategy.
 * The LLM looks at the playlist and decides what kinds of music to search for,
 * which similar artists to prioritize, and what gaps/directions to explore.
 */
export const generateDiscoveryStrategy = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { tasteProfile: TasteProfile; sampleTracks: Track[] }) => data,
  )
  .handler(
    async ({
      data,
    }): Promise<{
      tasteAnalysis: TasteAnalysis
      searchDirections: Array<{
        type: 'similar_artist' | 'track_radio'
        query: string
        reason: string
      }>
    }> => {
      const sampleList = data.sampleTracks
        .slice(0, 50)
        .map((t) => `"${t.title}" by ${t.artist} (${t.album})`)
        .join('\n')

      const prompt = `You are a music discovery expert. Analyze this playlist and create a discovery strategy.

## Taste Profile
${data.tasteProfile.summaryText}

Top artists by track count:
${data.tasteProfile.topArtists.map((a) => `- ${a.name}: ${a.count} tracks`).join('\n')}

## Sample Tracks (first 50 of ${data.tasteProfile.totalTracks})
${sampleList}

## Instructions
1. Analyze the user's music taste — genres, moods, eras, patterns.
2. Create a discovery strategy: suggest specific artists to find similar music for, and specific tracks to use as radio seeds.
   - Pick artists that will lead to interesting discoveries (not just more of the same)
   - Include some "stretch" picks that push boundaries while staying within reach
   - Suggest 8-12 similar_artist searches and 5-8 track_radio seeds
   - For track_radio seeds, use the exact track title from the sample list

Respond with valid JSON only, no markdown fences:
{
  "tasteAnalysis": {
    "summary": "2-3 sentence analysis",
    "primaryGenres": ["genre1", "genre2"],
    "moodDescriptors": ["mood1", "mood2"],
    "eraPreference": "description of era preferences"
  },
  "searchDirections": [
    { "type": "similar_artist", "query": "Artist Name", "reason": "why this direction" },
    { "type": "track_radio", "query": "Track Title", "reason": "why this seed" }
  ]
}`

      const { text } = await generateText({
        model: MODEL,
        maxOutputTokens: 4000,
        prompt,
      })

      return parseJson(text)
    },
  )

/**
 * Phase 2: Curate the Tidal results.
 * The LLM receives the raw candidates from Tidal and picks the best ones.
 */
export const curateRecommendations = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      tasteAnalysis: TasteAnalysis
      tasteProfile: TasteProfile
      candidates: Track[]
      existingTracks: Track[]
    }) => data,
  )
  .handler(
    async ({
      data,
    }): Promise<{
      recommendations: Recommendation[]
    }> => {
      const existingSet = new Set(
        data.existingTracks.map(
          (t) => `${t.artist} - ${t.title}`.toLowerCase(),
        ),
      )
      const newCandidates = data.candidates.filter(
        (c) => !existingSet.has(`${c.artist} - ${c.title}`.toLowerCase()),
      )

      const prompt = `You are a music discovery expert. Curate recommendations from Tidal's suggestions.

## User's Taste Analysis
${data.tasteAnalysis.summary}
Genres: ${data.tasteAnalysis.primaryGenres.join(', ')}
Moods: ${data.tasteAnalysis.moodDescriptors.join(', ')}
Era: ${data.tasteAnalysis.eraPreference}

## Stats
${data.tasteProfile.totalTracks} tracks from ${data.tasteProfile.uniqueArtists} artists in their playlist.
Top artists: ${data.tasteProfile.topArtists.slice(0, 10).map((a) => a.name).join(', ')}

## Candidate Tracks from Tidal (${newCandidates.length} unique tracks, already excluding playlist tracks)
${newCandidates.map((t) => `- "${t.title}" by ${t.artist} (Album: ${t.album}, ID: ${t.id})`).join('\n')}

## Instructions
Select the best 30-50 tracks. For each, provide:
- title, artist, album (exactly as given above)
- discoveryType: "gap_fill" (fills a gap in their collection), "deep_cut" (deep cut from artists/genres they'd appreciate), or "emerging" (newer/rising artists matching their taste)
- reason: One sentence explaining why this fits
- confidence: 0.0 to 1.0

Prioritize quality and diversity. Mix familiar-adjacent picks with genuinely surprising finds.

Respond with valid JSON only, no markdown fences:
{
  "recommendations": [
    {
      "title": "...",
      "artist": "...",
      "album": "...",
      "discoveryType": "gap_fill",
      "reason": "...",
      "confidence": 0.85
    }
  ]
}`

      const { text } = await generateText({
        model: MODEL,
        maxOutputTokens: 8000,
        prompt,
      })

      const parsed = parseJson<{
        recommendations: Array<{
          title: string
          artist: string
          album: string
          discoveryType: 'gap_fill' | 'deep_cut' | 'emerging'
          reason: string
          confidence: number
        }>
      }>(text)

      const recommendations: Recommendation[] = parsed.recommendations.map(
        (r) => ({ ...r, source: 'tidal-similar', tidalUrl: undefined }),
      )

      return { recommendations }
    },
  )
