import { FileText, Clock, Target, Zap } from 'lucide-react';
import type { PostOutline as PostOutlineType } from '../services/visualGenerator';

interface PostOutlineProps {
  outline: PostOutlineType;
}

export function PostOutline({ outline }: PostOutlineProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Post Structure Outline</h2>
          <p className="text-sm text-gray-500">Optimized content strategy for maximum engagement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Opening Hook</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{outline.hook}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-800">Main Message</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{outline.mainMessage}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-800">Call-to-Action</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{outline.callToAction}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">Best Time to Post</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{outline.bestTimeToPost}</p>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Content Structure Blueprint
          </h3>
          <ol className="space-y-3">
            {outline.structure.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
        <p className="text-sm text-gray-700">
          <strong>📊 Engagement Tip:</strong> Posts that follow this structure typically see 2-3x higher
          engagement rates. Start with a strong hook, deliver value, and always include a clear call-to-action.
        </p>
      </div>
    </div>
  );
}
