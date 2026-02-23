interface Props {
  currentStep: number
}

const STEPS = [
  { label: 'Fetching playlist from Tidal', icon: '01' },
  { label: 'Analyzing your taste profile', icon: '02' },
  { label: 'Finding similar music on Tidal', icon: '03' },
  { label: 'AI curation in progress', icon: '04' },
]

const EQ_ANIMATIONS = ['eq-1', 'eq-2', 'eq-3', 'eq-4', 'eq-5'] as const
const EQ_DURATIONS = [1.1, 0.9, 1.3, 1.0, 1.2] as const

export function LoadingSteps({ currentStep }: Props) {
  return (
    <div className="flex flex-col items-center pt-24">
      {/* Equalizer bars */}
      <div className="flex h-16 items-end gap-[5px]">
        {EQ_ANIMATIONS.map((anim, i) => (
          <div
            key={anim}
            className="w-[6px] rounded-full bg-accent"
            style={{
              animation: `${anim} ${EQ_DURATIONS[i]}s ease-in-out infinite`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>

      <p className="mt-6 font-display text-lg font-bold text-text">
        Discovering music for you
      </p>

      {/* Steps */}
      <div className="mt-10 w-full max-w-xs space-y-3">
        {STEPS.map((step, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep

          return (
            <div
              key={step.icon}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isDone ? 'opacity-40' : isActive ? 'opacity-100' : 'opacity-20'
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-display text-[11px] font-bold transition-colors duration-500 ${
                  isDone
                    ? 'bg-accent/20 text-accent'
                    : isActive
                      ? 'bg-accent text-bg'
                      : 'bg-surface text-text-dim'
                }`}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`text-sm transition-colors duration-500 ${
                  isActive ? 'font-medium text-text' : 'text-text-muted'
                }`}
              >
                {step.label}
                {isActive && (
                  <span className="ml-1 inline-block animate-pulse text-accent">&hellip;</span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
