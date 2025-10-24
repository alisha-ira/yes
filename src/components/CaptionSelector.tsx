import { useState } from 'react';
import { Check } from 'lucide-react';
import type { GeneratedContent, ToneType } from '../types';

interface CaptionSelectorProps {
  content: GeneratedContent;
  onSelectTone: (tone: ToneType) => void;
}

export function CaptionSelector({ content, onSelectTone }: CaptionSelectorProps) {
  const [selectedTone, setSelectedTone] = useState<ToneType>('casual');

  const handleSelect = (tone: ToneType) => {
    setSelectedTone(tone);
    onSelectTone(tone);
  };

  const tones: { type: ToneType; label: string; color: string; description: string }[] = [
    {
      type: 'formal',
      label: 'Formal',
      color: 'from-slate-500 to-slate-700',
      description: 'Professional & polished'
    },
    {
      type: 'casual',
      label: 'Casual',
      color: 'from-blue-500 to-cyan-500',
      description: 'Friendly & approachable'
    },
    {
      type: 'funny',
      label: 'Funny',
      color: 'from-orange-500 to-pink-500',
      description: 'Humorous & engaging'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Tone</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {tones.map(({ type, label, color, description }) => (
          <button
            key={type}
            onClick={() => handleSelect(type)}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              selectedTone === type
                ? 'border-transparent ring-2 ring-offset-2 ring-blue-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-full h-2 bg-gradient-to-r ${color} rounded-full mb-3`} />
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-800">{label}</span>
              {selectedTone === type && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 text-left">{description}</p>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">Preview Caption</h3>
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {content[selectedTone]}
        </p>
      </div>
    </div>
  );
}
