interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  pageLabel: string;
}

export function ProgressBar({ currentStep, totalSteps, pageLabel }: ProgressBarProps) {
  return (
    <div className="progress-block">
      <div className="progress-bar">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`progress-bar__segment ${i < currentStep ? "progress-bar__segment--active" : ""}`}
          />
        ))}
      </div>
      <span className="progress-block__label">{pageLabel}</span>
    </div>
  );
}
