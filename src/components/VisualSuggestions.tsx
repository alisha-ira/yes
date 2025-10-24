import { useState } from 'react';
import { Image, Lightbulb, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { VisualSuggestion } from '../services/visualGenerator';

interface VisualSuggestionsProps {
  suggestions: VisualSuggestion[];
}

export function VisualSuggestions({ suggestions }: VisualSuggestionsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Visual Suggestions</h2>
          <p className="text-sm text-gray-500">Generate images with these prompts in your favorite AI tool</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="border border-gray-200 rounded-xl p-4 hover:border-pink-300 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Image className="w-5 h-5 text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{suggestion.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                  {suggestion.style}
                </span>
                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                  {suggestion.aspectRatio}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestion.recommendedPlatforms.map((platform) => (
                  <span
                    key={platform}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700 mb-2"
            >
              <span>AI Generation Prompt</span>
              {expandedId === suggestion.id ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedId === suggestion.id && (
              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-700 leading-relaxed mb-3">
                  {suggestion.prompt}
                </p>
                <button
                  onClick={() => handleCopyPrompt(suggestion.id, suggestion.prompt)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700 border border-gray-200"
                >
                  {copiedId === suggestion.id ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Prompt
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl border border-pink-200">
        <p className="text-sm text-gray-700">
          <strong>💡 Pro Tip:</strong> Use these prompts with AI image generators like DALL-E, Midjourney,
          Stable Diffusion, or Leonardo.ai to create custom visuals perfectly matched to your campaign.
        </p>
      </div>
    </div>
  );
}
