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
      <div className="input-editorial border-b-2 border-border pb-1 transition">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://tidal.com/browse/playlist/..."
          className="w-full bg-transparent py-3 text-base text-text placeholder-text-dim outline-none"
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] font-light text-text-dim">
          Paste a Tidal playlist URL or playlist ID
        </p>
        <button
          type="submit"
          disabled={!url.trim()}
          className="group flex items-center gap-2 bg-text px-5 py-2.5 text-sm font-medium text-bg transition hover:bg-accent disabled:opacity-25"
        >
          Discover
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M1 7h12M8 2l5 5-5 5" />
          </svg>
        </button>
      </div>
    </form>
  )
}
