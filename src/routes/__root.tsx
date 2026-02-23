import {
  HeadContent,
  Outlet,
  Scripts,
  ScrollRestoration,
  createRootRoute,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Tidal Discovery — AI Music Recommendations' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap',
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function EqIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="text-accent"
    >
      <rect x="1" y="7" width="2.5" height="9" rx="1.25" fill="currentColor" opacity="0.9" />
      <rect x="5.5" y="3" width="2.5" height="13" rx="1.25" fill="currentColor" />
      <rect x="10" y="1" width="2.5" height="15" rx="1.25" fill="currentColor" opacity="0.9" />
      <rect x="14.5" y="5" width="2.5" height="11" rx="1.25" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

function RootComponent() {
  return (
    <div className="relative min-h-screen bg-bg">
      <div className="noise-overlay" />

      <nav className="relative z-10 border-b border-border/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 transition group-hover:bg-accent/15">
              <EqIcon />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-text">
              Tidal Discovery
            </span>
          </a>
          <span className="hidden text-sm font-medium text-text-dim sm:block">
            AI-powered music recommendations
          </span>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
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
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
