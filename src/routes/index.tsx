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
    <div className="relative flex flex-col items-center pt-16 sm:pt-24 pb-16">
      {/* Atmospheric gradient blobs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute -top-20 right-1/4 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-gap-fill/[0.03] blur-[100px]" />

      <h1 className="animate-fade-up font-display text-center text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
        Find <span className="gradient-text">music</span> you
        <br className="hidden sm:block" />
        {' '}didn&apos;t know you were
        <br className="hidden sm:block" />
        {' '}looking for.
      </h1>

      <p className="animate-fade-up mt-6 max-w-lg text-center text-base leading-relaxed text-text-muted sm:text-lg" style={{ animationDelay: '0.1s' }}>
        Paste a Tidal playlist and let AI uncover hidden gems,
        deep cuts, and emerging artists tailored to your taste.
      </p>

      <div className="animate-fade-up mt-10 w-full max-w-xl" style={{ animationDelay: '0.2s' }}>
        <PlaylistInput onSubmit={handleSubmit} />
      </div>

      {/* How it works */}
      <div className="animate-fade-up mt-20 grid w-full max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 sm:grid-cols-3" style={{ animationDelay: '0.35s' }}>
        {[
          { step: '01', title: 'Analyze', desc: 'AI dissects your taste — genres, moods, eras, and listening patterns.' },
          { step: '02', title: 'Discover', desc: 'Tidal\'s engine surfaces 80-100 candidates guided by AI strategy.' },
          { step: '03', title: 'Curate', desc: 'AI picks the best 30-50 tracks with reasons and confidence scores.' },
        ].map((item) => (
          <div key={item.step} className="bg-surface p-6">
            <span className="font-display text-xs font-bold text-accent">{item.step}</span>
            <h3 className="mt-2 font-display text-lg font-bold text-text">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Setup hint */}
      <p className="mt-12 text-center text-xs text-text-dim">
        Self-hosted &middot; Requires a{' '}
        <a
          href="https://vercel.com/docs/ai-gateway"
          className="text-text-muted underline decoration-text-dim underline-offset-2 transition hover:text-accent hover:decoration-accent"
          target="_blank"
          rel="noopener noreferrer"
        >
          AI Gateway key
        </a>{' '}
        and{' '}
        <a
          href="https://tidal.com"
          className="text-text-muted underline decoration-text-dim underline-offset-2 transition hover:text-accent hover:decoration-accent"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tidal account
        </a>
      </p>
    </div>
  )
}
