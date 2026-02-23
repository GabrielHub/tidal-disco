import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Tidal Discovery' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap',
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return (
    <div className="relative min-h-screen bg-bg">
      <div className="paper-grain" />

      {/* Editorial header */}
      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pt-6 pb-4">
          <div className="flex items-end justify-between">
            <a href="/" className="group">
              <span className="font-display text-3xl italic leading-none text-text transition-colors group-hover:text-accent sm:text-4xl">
                Tidal Discovery
              </span>
            </a>
            <span className="hidden pb-1 text-xs font-light uppercase tracking-[0.3em] text-text-dim sm:block">
              AI-Curated Music
            </span>
          </div>
          <hr className="editorial-thick mt-3" />
          <hr className="editorial mt-1" />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto max-w-6xl px-6 pb-8">
        <hr className="editorial" />
        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-text-dim">
          Powered by Tidal &middot; Vercel AI Gateway &middot; Gemini
        </p>
      </footer>
    </div>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
