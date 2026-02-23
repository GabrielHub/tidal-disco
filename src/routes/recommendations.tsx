import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { runDiscovery } from '~/server/recommend'
import { LoadingSteps } from '~/components/LoadingSteps'
import { TasteProfileCard } from '~/components/TasteProfile'
import { RecGrid } from '~/components/RecGrid'
import { TidalAuth } from '~/components/TidalAuth'
import type { DiscoveryResult } from '~/lib/types'

export const Route = createFileRoute('/recommendations')({
  validateSearch: (search: Record<string, unknown>) => ({
    url: (search.url as string) || '',
  }),
  component: RecommendationsPage,
})

function RecommendationsPage() {
  const { url } = Route.useSearch()
  const [result, setResult] = useState<DiscoveryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)

  const discover = useCallback(async () => {
    if (!url) {
      setError('No playlist URL provided')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setNeedsAuth(false)
    setStep(0)

    const stepTimers = [
      setTimeout(() => setStep(1), 3000),
      setTimeout(() => setStep(2), 8000),
      setTimeout(() => setStep(3), 15000),
    ]

    try {
      const data = await runDiscovery({ data: { playlistUrl: url } })
      setResult(data)
      setStep(4)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Discovery failed'

      if (msg.includes('TIDAL_NOT_AUTHENTICATED')) {
        setNeedsAuth(true)
      } else {
        setError(msg)
      }
    } finally {
      stepTimers.forEach(clearTimeout)
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    discover()
  }, [discover])

  if (needsAuth) {
    return <TidalAuth onAuthenticated={discover} />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center pt-20">
        <span className="font-display text-[8rem] leading-none text-border-light">!</span>
        <h2 className="mt-4 font-display text-3xl italic text-text">Something went wrong</h2>
        <p className="mt-3 max-w-md text-center text-sm font-light leading-relaxed text-text-muted">
          {error}
        </p>
        <a
          href="/"
          className="mt-8 border-b-2 border-accent pb-1 text-sm font-medium text-accent transition hover:border-text hover:text-text"
        >
          &larr; Try again
        </a>
      </div>
    )
  }

  if (loading) {
    return <LoadingSteps currentStep={step} />
  }

  if (!result) return null

  return (
    <div className="animate-fade-in">
      {/* Headline dateline */}
      <div className="mb-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-accent">
          Discovery Complete
        </p>
        <h1 className="mt-2 font-display text-4xl italic leading-tight text-text sm:text-5xl">
          Your Listening Report
        </h1>
      </div>

      {/* Stats as editorial dateline */}
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b-2 border-text pb-3 pt-4">
        <span className="text-sm text-text-muted">
          <strong className="font-semibold text-text">{result.tasteProfile.totalTracks}</strong> tracks analyzed
        </span>
        <span className="text-text-dim">&middot;</span>
        <span className="text-sm text-text-muted">
          <strong className="font-semibold text-text">{result.stats.tidalCandidates}</strong> candidates found
        </span>
        <span className="text-text-dim">&middot;</span>
        <span className="text-sm text-text-muted">
          <strong className="font-semibold text-accent">{result.stats.finalPicks}</strong> curated picks
        </span>
      </div>

      {/* Two-column editorial layout */}
      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Sidebar — Taste Profile */}
        <aside className="animate-slide-left lg:col-span-4">
          <div className="lg:sticky lg:top-8">
            <TasteProfileCard analysis={result.tasteAnalysis} profile={result.tasteProfile} />
          </div>
        </aside>

        {/* Main content — Tracklist */}
        <div className="animate-slide-right lg:col-span-8">
          <RecGrid recommendations={result.recommendations} />
        </div>
      </div>
    </div>
  )
}
