import { cn } from '@/lib/utils';

interface StepTrackerProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = [
  'Service & Vehicle',
  'Contact & Location', 
  'Review & Submit'
];

export function StepTracker({ currentStep, totalSteps }: StepTrackerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      {/* Compact Progress Bar for All Screen Sizes */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-pink-600">
          {stepLabels[currentStep - 1]}
        </span>
      </div>
      
      {/* Progress Bar with Sections */}
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div
              key={stepNumber}
              className={cn(
                'flex-1 h-2 rounded-full transition-all duration-300',
                {
                  'bg-pink-500': isCompleted,
                  'bg-pink-400': isCurrent,
                  'bg-gray-200': !isCompleted && !isCurrent,
                }
              )}
            />
          );
        })}
      </div>
      
      {/* Step Labels Below Bar */}
      <div className="flex justify-between mt-2">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <span
              key={index}
              className={cn(
                'text-xs font-medium transition-colors',
                {
                  'text-pink-600': isCompleted || isCurrent,
                  'text-gray-400': !isCompleted && !isCurrent,
                }
              )}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}