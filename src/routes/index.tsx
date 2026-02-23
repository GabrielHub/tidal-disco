import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PlaylistInput } from '~/components/PlaylistInput'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()

  function handleSubmit(playlistUrl: string) {
    navigate({
      to: '/recommendations',
      search: { url: playlistUrl },
    })
  }

  return (
    <div className="relative pb-20">
      {/* Hero — editorial split layout */}
      <div className="grid grid-cols-1 gap-12 pt-12 sm:pt-20 lg:grid-cols-12 lg:gap-8">
        {/* Left column — oversized serif headline */}
        <div className="animate-slide-left lg:col-span-7">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-accent">
            Vol. I &mdash; Discovery Issue
          </p>
          <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] tracking-tight text-text">
            Unheard
            <br />
            <span className="italic text-accent">Music</span>
            <br />
            Awaits
          </h1>
          <p className="mt-8 max-w-md text-lg font-light leading-relaxed text-text-muted">
            Paste a Tidal playlist. Our AI dissects your taste,
            searches Tidal&rsquo;s catalog, and curates a personalized
            tracklist of hidden gems you never knew existed.
          </p>
        </div>

        {/* Right column — input + how it works */}
        <div className="animate-slide-right lg:col-span-5 lg:pt-8">
          <div className="rounded-none border-l-2 border-text pl-6">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-dim">
              Start Here
            </p>
            <PlaylistInput onSubmit={handleSubmit} />
          </div>

          {/* How it works — editorial numbered list */}
          <div className="mt-16 space-y-0">
            <hr className="editorial-double mb-6" />
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-dim">
              How It Works
            </p>
            {[
              { n: '01', title: 'Analyze', text: 'AI maps your genres, moods, eras, and listening patterns from the playlist.' },
              { n: '02', title: 'Search', text: 'Tidal surfaces 80-100 candidate tracks guided by an AI-crafted discovery strategy.' },
              { n: '03', title: 'Curate', text: 'AI selects 30-50 best tracks with confidence scores and reasons for each pick.' },
            ].map((step) => (
              <div key={step.n} className="group flex gap-5 border-t border-border py-5">
                <span className="font-display text-4xl leading-none text-border transition-colors group-hover:text-accent">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-body text-sm font-semibold uppercase tracking-wider text-text">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm font-light leading-relaxed text-text-muted">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="mt-20 text-center">
        <hr className="editorial mb-6" />
        <p className="text-xs font-light text-text-dim">
          Self-hosted &middot; Requires a{' '}
          <a
            href="https://vercel.com/docs/ai-gateway"
            className="underline underline-offset-2 transition hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel AI Gateway key
          </a>{' '}
          and a{' '}
          <a
            href="https://tidal.com"
            className="underline underline-offset-2 transition hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tidal account
          </a>
        </p>
      </div>
    </div>
  )
}
