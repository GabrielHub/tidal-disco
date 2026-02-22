interface Props {
  currentStep: number
}

const STEP_LABELS = [
  'Fetching playlist from Tidal...',
  'Analyzing your taste profile...',
  'Finding similar music on Tidal...',
  'AI curation in progress...',
]

function indicatorClass(isDone: boolean, isActive: boolean): string {
  if (isDone) return 'bg-accent text-bg'
  if (isActive) return 'border-2 border-accent text-accent'
  return 'border-2 border-border text-text-muted'
}

function labelClass(isDone: boolean, isActive: boolean): string {
  if (isActive) return 'font-medium text-text'
  if (isDone) return 'text-text-muted line-through'
  return 'text-text-muted'
}

export function LoadingSteps({ currentStep }: Props) {
  return (
    <div className="flex flex-col items-center pt-20">
      <div className="mb-8">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
      </div>

      <div className="w-full max-w-sm space-y-3">
        {STEP_LABELS.map((label, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep

          return (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${indicatorClass(isDone, isActive)}`}
              >
                {isDone ? '\u2713' : i + 1}
              </div>
              <span
                className={`text-sm transition ${labelClass(isDone, isActive)}`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
