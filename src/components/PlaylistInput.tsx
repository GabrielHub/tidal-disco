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
    <form onSubmit={handleSubmit}>
      <div className="input-glow flex gap-3 rounded-xl border border-border bg-surface p-1.5 transition">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://tidal.com/browse/playlist/..."
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-text placeholder-text-dim outline-none"
        />
        <button
          type="submit"
          disabled={!url.trim()}
          className="shrink-0 rounded-lg bg-accent px-6 py-3 font-display text-sm font-bold text-bg transition hover:bg-accent-hover disabled:opacity-30 disabled:hover:bg-accent"
        >
          Discover
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-text-dim">
        Paste a Tidal playlist URL or playlist ID
      </p>
    </form>
  )
}
