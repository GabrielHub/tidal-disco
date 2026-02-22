import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { runDiscovery } from '~/server/recommend'
import { LoadingSteps } from '~/components/LoadingSteps'
import { TasteProfileCard } from '~/components/TasteProfile'
import { RecGrid } from '~/components/RecGrid'
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
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!url) {
      setError('No playlist URL provided')
      setLoading(false)
      return
    }

    let cancelled = false

    async function discover() {
      try {
        setStep(0)
        const stepTimer1 = setTimeout(() => !cancelled && setStep(1), 3000)
        const stepTimer2 = setTimeout(() => !cancelled && setStep(2), 8000)
        const stepTimer3 = setTimeout(() => !cancelled && setStep(3), 15000)

        const data = await runDiscovery({ data: { playlistUrl: url } })

        clearTimeout(stepTimer1)
        clearTimeout(stepTimer2)
        clearTimeout(stepTimer3)

        if (!cancelled) {
          setResult(data)
          setStep(4)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Discovery failed')
          setLoading(false)
        }
      }
    }

    discover()
    return () => {
      cancelled = true
    }
  }, [url])

  if (error) {
    return (
      <div className="flex flex-col items-center pt-20">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-400">Error</h2>
          <p className="text-red-300">{error}</p>
          <a
            href="/"
            className="mt-4 inline-block rounded-lg bg-surface px-4 py-2 text-sm text-accent hover:bg-surface-hover"
          >
            Try again
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSteps currentStep={step} />
  }

  if (!result) return null

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface px-6 py-4">
        <span className="text-sm text-text-muted">
          Analyzed{' '}
          <span className="font-semibold text-text">
            {result.tasteProfile.totalTracks}
          </span>{' '}
          tracks
        </span>
        <span className="text-border">|</span>
        <span className="text-sm text-text-muted">
          <span className="font-semibold text-text">
            {result.stats.tidalCandidates}
          </span>{' '}
          Tidal candidates
        </span>
        <span className="text-border">|</span>
        <span className="text-sm text-text-muted">
          <span className="font-semibold text-accent">
            {result.stats.finalPicks}
          </span>{' '}
          curated picks
        </span>
      </div>

      <TasteProfileCard analysis={result.tasteAnalysis} profile={result.tasteProfile} />

      <RecGrid recommendations={result.recommendations} />
    </div>
  )
}
