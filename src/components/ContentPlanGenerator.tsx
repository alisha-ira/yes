import { useState } from 'react';
import { Calendar as CalendarIcon, TrendingUp, Lightbulb, CheckCircle, X } from 'lucide-react';
import { getPostingFrequencyRecommendations, generateContentPlan, type PlannedPost as PlannedPostType } from '../services/contentPlanner';
import type { BrandProfile } from '../types';

interface ContentPlanGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePlan: (plan: {
    planName: string;
    startDate: string;
    endDate: string;
    frequency: string;
    posts: PlannedPostType[];
  }) => void;
  brandProfile?: BrandProfile | null;
}

export function ContentPlanGenerator({ isOpen, onClose, onGeneratePlan, brandProfile }: ContentPlanGeneratorProps) {
  const [selectedFrequency, setSelectedFrequency] = useState('3x_week');
  const [weeksToGenerate, setWeeksToGenerate] = useState(4);
  const [platforms, setPlatforms] = useState<string[]>(['instagram']);
  const [generatedPlan, setGeneratedPlan] = useState<ReturnType<typeof generateContentPlan> | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const frequencies = getPostingFrequencyRecommendations(brandProfile?.industry);

  const handleGeneratePreview = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    const selectedFreq = frequencies.find(f => f.id === selectedFrequency);
    if (!selectedFreq) return;

    const plan = generateContentPlan(
      startDate,
      weeksToGenerate,
      selectedFreq.postsPerWeek,
      platforms,
      brandProfile
    );

    setGeneratedPlan(plan);
    setShowPreview(true);
  };

  const handleApprovePlan = () => {
    if (!generatedPlan) return;

    onGeneratePlan({
      planName: generatedPlan.planName,
      startDate: generatedPlan.startDate.toISOString().split('T')[0],
      endDate: generatedPlan.endDate.toISOString().split('T')[0],
      frequency: generatedPlan.frequency,
      posts: generatedPlan.posts
    });

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedFrequency('3x_week');
    setWeeksToGenerate(4);
    setPlatforms(['instagram']);
    setGeneratedPlan(null);
    setShowPreview(false);
  };

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">AI Content Plan Generator</h2>
              <p className="text-sm text-gray-600">Let AI suggest optimal posting schedule for you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!showPreview ? (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How often do you want to post?
              </label>
              <div className="space-y-3">
                {frequencies.map(freq => (
                  <button
                    key={freq.id}
                    onClick={() => setSelectedFrequency(freq.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedFrequency === freq.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">{freq.label}</span>
                          {freq.recommended && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{freq.description}</p>
                        <ul className="space-y-1">
                          {freq.reasons.map((reason, idx) => (
                            <li key={idx} className="text-xs text-gray-500 flex items-start gap-1">
                              <span className="text-gray-400">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {selectedFrequency === freq.id && (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="weeks" className="block text-sm font-medium text-gray-700 mb-2">
                Plan duration (weeks)
              </label>
              <select
                id="weeks"
                value={weeksToGenerate}
                onChange={(e) => setWeeksToGenerate(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={2}>2 weeks</option>
                <option value={4}>4 weeks (1 month)</option>
                <option value={8}>8 weeks (2 months)</option>
                <option value={12}>12 weeks (3 months)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Platforms
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['instagram', 'twitter', 'linkedin', 'facebook'].map(platform => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm font-medium capitalize ${
                      platforms.includes(platform)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">AI Optimization</p>
                  <p>
                    Our AI will analyze your brand, industry, and target platforms to suggest the
                    best posting times and content themes for maximum engagement.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGeneratePreview}
              disabled={platforms.length === 0}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all"
            >
              Generate Content Plan
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Plan Overview</h3>
              <div className="space-y-2">
                {generatedPlan?.insights.map((insight, idx) => (
                  <p key={idx} className="text-sm text-gray-700">{insight}</p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Scheduled Posts</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedPlan?.posts.map((post, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl p-4 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-500">
                            Post #{idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">{post.title}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          📅 {post.suggestedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })} at {post.suggestedTime}
                        </p>
                        <p className="text-xs text-gray-500 italic">{post.rationale}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Settings
              </button>
              <button
                onClick={handleApprovePlan}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all"
              >
                Approve Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
