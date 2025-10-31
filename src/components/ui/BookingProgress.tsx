"use client";

interface BookingProgressProps {
  currentStep: number;
  steps: string[];
}

export default function BookingProgress({ currentStep, steps }: BookingProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${
                    index < currentStep
                      ? "bg-gradient-to-br from-green-400 to-green-600 text-white"
                      : index === currentStep
                      ? "bg-gradient-to-br from-lavender to-blush text-white ring-4 ring-lavender/30"
                      : "bg-white/10 text-white/40"
                  }
                `}
              >
                {index < currentStep ? "✓" : index + 1}
              </div>
              <span
                className={`
                  text-xs mt-2 font-medium text-center
                  ${
                    index <= currentStep
                      ? "text-white"
                      : "text-white/40"
                  }
                `}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-2 rounded-full transition-all
                  ${
                    index < currentStep
                      ? "bg-gradient-to-r from-green-400 to-green-600"
                      : "bg-white/10"
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
