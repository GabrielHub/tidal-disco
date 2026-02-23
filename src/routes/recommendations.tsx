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
      <div className="flex flex-col items-center pt-24">
        <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="font-display text-lg font-bold text-red-400">Something went wrong</h2>
          <p className="mt-2 text-sm leading-relaxed text-red-300/70">{error}</p>
          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-surface px-5 py-2.5 text-sm font-medium text-accent transition hover:bg-surface-hover"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 2L4 8l6 6" />
            </svg>
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
    <div className="animate-fade-in space-y-10">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40">
        {[
          { value: result.tasteProfile.totalTracks, label: 'Tracks analyzed' },
          { value: result.stats.tidalCandidates, label: 'Tidal candidates' },
          { value: result.stats.finalPicks, label: 'Curated picks', highlight: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface px-6 py-5 text-center">
            <div className={`font-display text-3xl font-extrabold tracking-tight ${stat.highlight ? 'text-accent' : 'text-text'}`}>
              {stat.value}
            </div>
            <div className="mt-1 text-xs font-medium text-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <TasteProfileCard analysis={result.tasteAnalysis} profile={result.tasteProfile} />

      <RecGrid recommendations={result.recommendations} />
    </div>
  )
}
