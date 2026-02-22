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
    <div className="flex flex-col items-center justify-center pt-20">
      <h1 className="mb-3 text-4xl font-bold text-text">
        Discover New Music
      </h1>
      <p className="mb-10 max-w-lg text-center text-text-muted">
        Paste a Tidal playlist URL and let AI analyze your taste to find tracks
        you&apos;ll love. Powered by Tidal&apos;s recommendation engine and
        AI-powered curation.
      </p>

      <PlaylistInput onSubmit={handleSubmit} />

      <div className="mt-16 max-w-md rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Setup for your own instance
        </h2>
        <ol className="space-y-2 text-sm text-text-muted">
          <li>
            <span className="font-mono text-accent">1.</span> Clone this repo
            and run{' '}
            <code className="rounded bg-bg px-1.5 py-0.5 text-text">
              npm install
            </code>
          </li>
          <li>
            <span className="font-mono text-accent">2.</span> Install Python
            deps:{' '}
            <code className="rounded bg-bg px-1.5 py-0.5 text-text">
              pip install tidalapi
            </code>
          </li>
          <li>
            <span className="font-mono text-accent">3.</span> Copy{' '}
            <code className="rounded bg-bg px-1.5 py-0.5 text-text">
              .env.example
            </code>{' '}
            to{' '}
            <code className="rounded bg-bg px-1.5 py-0.5 text-text">.env</code>{' '}
            and add your{' '}
            <a
              href="https://vercel.com/docs/ai-gateway"
              className="text-accent underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              AI Gateway API key
            </a>
          </li>
          <li>
            <span className="font-mono text-accent">4.</span> Run{' '}
            <code className="rounded bg-bg px-1.5 py-0.5 text-text">
              npm run dev
            </code>{' '}
            — first use triggers Tidal OAuth in terminal
          </li>
        </ol>
      </div>
    </div>
  )
}
