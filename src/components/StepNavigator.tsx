import { Check } from 'lucide-react';

interface StepNavigatorProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
  canNavigate: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
  };
}

export function StepNavigator({ currentStep, onStepClick, canNavigate }: StepNavigatorProps) {
  const steps = [
    { number: 1, label: 'Input', enabled: canNavigate.step1 },
    { number: 2, label: 'Generate', enabled: canNavigate.step2 },
    { number: 3, label: 'Customize', enabled: canNavigate.step3 }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <button
              onClick={() => step.enabled && onStepClick(step.number as 1 | 2 | 3)}
              disabled={!step.enabled}
              className={`flex items-center gap-3 ${
                step.enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep === step.number
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110'
                    : currentStep > step.number
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="text-left">
                <div className={`text-sm font-semibold ${
                  currentStep === step.number ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  Step {step.number}
                </div>
                <div className={`text-xs ${
                  currentStep === step.number ? 'text-gray-700' : 'text-gray-500'
                }`}>
                  {step.label}
                </div>
              </div>
            </button>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
