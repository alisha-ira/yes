import { Video, CheckCircle } from 'lucide-react';
import { getVideoOptimizationTips } from '../services/visualGenerator';

export function VideoOptimizationTips() {
  const platforms = [
    { name: 'Instagram', color: 'from-purple-500 to-pink-500' },
    { name: 'Twitter', color: 'from-blue-400 to-cyan-500' },
    { name: 'LinkedIn', color: 'from-blue-600 to-blue-800' },
    { name: 'Facebook', color: 'from-blue-500 to-indigo-600' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Video className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Video Optimization Guide</h2>
          <p className="text-sm text-gray-500">Platform-specific best practices for video content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const tips = getVideoOptimizationTips(platform.name);
          return (
            <div
              key={platform.name}
              className="border border-gray-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center`}>
                  <Video className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">{platform.name}</h3>
              </div>

              <ul className="space-y-2.5">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">📱 Mobile-First</h4>
          <p className="text-xs text-gray-600">
            90% of social media users access via mobile. Always optimize for vertical or square formats.
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">🔇 Silent Viewing</h4>
          <p className="text-xs text-gray-600">
            85% watch without sound. Include captions and text overlays for maximum impact.
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-green-200">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">⚡ First 3 Seconds</h4>
          <p className="text-xs text-gray-600">
            Hook viewers immediately. The opening determines if they'll watch to completion.
          </p>
        </div>
      </div>
    </div>
  );
}
