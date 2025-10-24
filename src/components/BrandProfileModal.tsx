import { useState, useEffect } from 'react';
import { X, Building2, Target, Palette, Save } from 'lucide-react';
import type { BrandProfile } from '../types';

interface BrandProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Partial<BrandProfile>) => void;
  existingProfile?: BrandProfile | null;
}

export function BrandProfileModal({ isOpen, onClose, onSave, existingProfile }: BrandProfileModalProps) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [tone, setTone] = useState('casual');
  const [targetAudience, setTargetAudience] = useState('');
  const [keyValues, setKeyValues] = useState('');

  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name);
      setIndustry(existingProfile.industry);
      setTone(existingProfile.tone);
      setTargetAudience(existingProfile.target_audience);
      setKeyValues(existingProfile.key_values.join(', '));
    }
  }, [existingProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      industry,
      tone,
      target_audience: targetAudience,
      key_values: keyValues.split(',').map(v => v.trim()).filter(Boolean)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {existingProfile ? 'Edit Brand Profile' : 'Create Brand Profile'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., EcoBottle Co."
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <input
              id="industry"
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Sustainable Products, Tech, Fashion"
            />
          </div>

          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Default Brand Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual & Friendly</option>
              <option value="playful">Playful & Fun</option>
              <option value="inspirational">Inspirational</option>
              <option value="educational">Educational</option>
            </select>
          </div>

          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target Audience
            </label>
            <textarea
              id="audience"
              rows={3}
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="e.g., Environmentally conscious millennials, ages 25-40, interested in sustainable living"
            />
          </div>

          <div>
            <label htmlFor="values" className="block text-sm font-medium text-gray-700 mb-2">
              Key Values & Keywords
            </label>
            <input
              id="values"
              type="text"
              value={keyValues}
              onChange={(e) => setKeyValues(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., sustainability, innovation, quality (comma-separated)"
            />
            <p className="mt-2 text-xs text-gray-500">
              Separate keywords with commas. These will influence content generation.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
