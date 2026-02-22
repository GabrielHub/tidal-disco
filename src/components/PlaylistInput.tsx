import { useState } from 'react'

interface Props {
  onSubmit: (url: string) => void
}

export function PlaylistInput({ onSubmit }: Props) {
  const [url, setUrl] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (url.trim()) {
      onSubmit(url.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://tidal.com/browse/playlist/..."
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-text placeholder-text-muted outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={!url.trim()}
          className="rounded-lg bg-accent px-6 py-3 font-semibold text-bg transition hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
        >
          Discover Music
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-text-muted">
        Paste a Tidal playlist URL or playlist ID
      </p>
    </form>
  )
}
