import { useState, useEffect, useCallback } from 'react'
import { startTidalLogin, pollTidalLogin } from '~/server/tidal'

interface Props {
  onAuthenticated: () => void
}

type AuthState =
  | { phase: 'starting' }
  | {
      phase: 'waiting'
      verificationUri: string
      userCode: string
      deviceCode: string
      expiresIn: number
      interval: number
    }
  | { phase: 'success' }
  | { phase: 'expired' }
  | { phase: 'error'; message: string }

export function TidalAuth({ onAuthenticated }: Props) {
  const [state, setState] = useState<AuthState>({ phase: 'starting' })

  const startLogin = useCallback(async () => {
    setState({ phase: 'starting' })
    try {
      const data = await startTidalLogin()
      setState({
        phase: 'waiting',
        verificationUri: data.verification_uri_complete,
        userCode: data.user_code,
        deviceCode: data.device_code,
        expiresIn: data.expires_in,
        interval: data.interval,
      })
    } catch (e) {
      setState({
        phase: 'error',
        message: e instanceof Error ? e.message : 'Failed to start login',
      })
    }
  }, [])

  useEffect(() => {
    startLogin()
  }, [startLogin])

  function getAuthUrl(): string {
    if (state.phase !== 'waiting') return ''
    if (state.verificationUri.startsWith('http')) return state.verificationUri
    return `https://${state.verificationUri}`
  }

  const authUrl = getAuthUrl()

  // Poll for auth completion
  const deviceCode = state.phase === 'waiting' ? state.deviceCode : null
  const pollInterval = state.phase === 'waiting' ? state.interval : 0

  useEffect(() => {
    if (!deviceCode) return

    const intervalMs = Math.max(pollInterval, 2) * 1000
    let cancelled = false

    async function poll() {
      if (cancelled) return
      try {
        const result = await pollTidalLogin({
          data: { deviceCode: deviceCode! },
        })
        if (cancelled) return

        if (result.status === 'authenticated') {
          setState({ phase: 'success' })
          setTimeout(onAuthenticated, 800)
        } else if (result.status === 'expired') {
          setState({ phase: 'expired' })
        } else if (result.status === 'error') {
          setState({ phase: 'error', message: result.message || 'Login failed' })
        }
      } catch {
        // Network error, keep polling
      }
    }

    const timer = setInterval(poll, intervalMs)
    const initialPoll = setTimeout(poll, 2000)

    return () => {
      cancelled = true
      clearInterval(timer)
      clearTimeout(initialPoll)
    }
  }, [deviceCode, pollInterval, onAuthenticated])

  return (
    <div className="flex flex-col items-center pt-16 sm:pt-24">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
        Authentication Required
      </p>
      <h2 className="mt-3 font-display text-3xl italic text-text sm:text-4xl">
        Connect Tidal
      </h2>

      {state.phase === 'starting' && (
        <p className="mt-8 text-sm text-text-muted">Initializing login...</p>
      )}

      {state.phase === 'waiting' && (
        <div className="mt-10 w-full max-w-md">
          {/* User code display */}
          <div className="border-y-2 border-text py-6 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-dim">
              Your code
            </p>
            <p className="mt-3 font-display text-5xl tracking-[0.2em] text-text sm:text-6xl">
              {state.userCode}
            </p>
          </div>

          {/* Instructions */}
          <div className="mt-8 space-y-4">
            <div className="flex gap-4">
              <span className="font-display text-2xl text-border">01</span>
              <div>
                <p className="text-sm font-medium text-text">
                  Open the Tidal login page
                </p>
                <a
                  href={authUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block border-b border-accent text-sm text-accent transition hover:border-text hover:text-text"
                >
                  {authUrl.replace('https://', '')}
                </a>
              </div>
            </div>

            <hr className="editorial" />

            <div className="flex gap-4">
              <span className="font-display text-2xl text-border">02</span>
              <p className="text-sm font-medium text-text">
                Sign in and enter the code above
              </p>
            </div>

            <hr className="editorial" />

            <div className="flex gap-4">
              <span className="font-display text-2xl text-border">03</span>
              <p className="text-sm text-text-muted">
                This page will update automatically once connected
              </p>
            </div>
          </div>

          {/* Polling indicator */}
          <div className="mt-10 flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  style={{
                    animation: 'blink 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-text-dim">Waiting for authorization...</span>
          </div>
        </div>
      )}

      {state.phase === 'success' && (
        <div className="mt-10 text-center">
          <p className="font-display text-2xl italic text-emerging">Connected</p>
          <p className="mt-2 text-sm text-text-muted">Starting discovery...</p>
        </div>
      )}

      {(state.phase === 'expired' || state.phase === 'error') && (
        <div className="mt-10 text-center">
          <p className="text-sm text-text-muted">
            {state.phase === 'expired' ? 'The login code expired.' : state.message}
          </p>
          <button
            onClick={startLogin}
            className="mt-4 border-b-2 border-accent pb-1 text-sm font-medium text-accent transition hover:border-text hover:text-text"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
