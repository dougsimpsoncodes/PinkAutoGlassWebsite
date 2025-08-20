import { cn } from '@/lib/utils';

interface StepTrackerProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = [
  'Service',
  'Vehicle',
  'Contact',
  'Location',
  'Review'
];

export function StepTracker({ currentStep, totalSteps }: StepTrackerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mobile Progress Bar */}
      <div className="block sm:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-brand-navy">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {stepLabels[currentStep - 1]}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${(currentStep / totalSteps) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Desktop Step Circles */}
      <div className="hidden sm:flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
                  {
                    'bg-gradient-primary text-white shadow-brand': isCompleted,
                    'bg-brand-pink text-white shadow-brand scale-110': isCurrent,
                    'bg-gray-200 text-gray-500': !isCompleted && !isCurrent,
                  }
                )}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center transition-colors duration-200',
                  {
                    'text-brand-pink': isCompleted || isCurrent,
                    'text-gray-500': !isCompleted && !isCurrent,
                  }
                )}
              >
                {stepLabels[index]}
              </span>

              {/* Connector Line */}
              {index < totalSteps - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 -z-10">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      isCompleted ? 'bg-gradient-primary' : 'bg-gray-200'
                    )}
                    style={{
                      marginLeft: '20px',
                      marginRight: '20px',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Percentage Text */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-600">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
    </div>
  );
}