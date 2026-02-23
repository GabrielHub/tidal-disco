interface Props {
  currentStep: number
}

const STEPS = [
  'Fetching playlist from Tidal',
  'Analyzing your taste profile',
  'Searching Tidal for candidates',
  'AI curation in progress',
]

const BAR_DELAYS = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9]

function stepOpacity(isDone: boolean, isActive: boolean): string {
  if (isDone) return 'opacity-35'
  if (isActive) return 'opacity-100'
  return 'opacity-15'
}

function stepNumberClass(isDone: boolean, isActive: boolean): string {
  if (isDone) return 'done'
  if (isActive) return 'active'
  return ''
}

function stepLabelClass(isDone: boolean, isActive: boolean): string {
  if (isActive) return 'font-medium text-text'
  if (isDone) return 'font-light text-text-dim line-through'
  return 'font-light text-text-muted'
}

export function LoadingSteps({ currentStep }: Props) {
  return (
    <div className="flex flex-col items-center pt-16 sm:pt-24">
      {/* Animated bars */}
      <div className="flex h-20 items-end gap-[4px]">
        {BAR_DELAYS.map((delay, i) => (
          <div
            key={i}
            className="loading-bar w-[5px] rounded-sm bg-accent"
            style={{
              animationDuration: `${0.8 + (i % 3) * 0.2}s`,
              animationDelay: `${delay}s`,
              height: '100%',
            }}
          />
        ))}
      </div>

      <p className="mt-6 text-xs font-medium uppercase tracking-[0.3em] text-text-dim">
        Discovering
      </p>

      {/* Steps with large serif numbers */}
      <div className="mt-16 w-full max-w-md">
        {STEPS.map((label, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep

          return (
            <div
              key={i}
              className={`flex items-center gap-5 border-b border-border py-4 transition-all duration-700 ${stepOpacity(isDone, isActive)}`}
            >
              <span
                className={`step-number w-20 text-right text-5xl ${stepNumberClass(isDone, isActive)}`}
                style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={`text-sm transition-all duration-500 ${stepLabelClass(isDone, isActive)}`}
              >
                {label}
                {isActive && (
                  <span
                    className="ml-1.5 inline-block text-accent"
                    style={{ animation: 'blink 1s step-end infinite' }}
                  >
                    _
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
