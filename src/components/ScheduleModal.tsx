import { useState } from 'react';
import { X, Clock, Calendar as CalendarIcon, Save, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (data: {
    title: string;
    scheduledDate: string;
    scheduledTime: string;
    platforms: string[];
    notes: string;
  }) => void;
  prefilledData?: {
    title?: string;
    caption?: string;
  };
}

export function ScheduleModal({ isOpen, onClose, onSchedule, prefilledData }: ScheduleModalProps) {
  const [title, setTitle] = useState(prefilledData?.title || '');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [platforms, setPlatforms] = useState<string[]>(['instagram']);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule({
      title,
      scheduledDate,
      scheduledTime,
      platforms,
      notes
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setScheduledDate('');
    setScheduledTime('09:00');
    setPlatforms(['instagram']);
    setNotes('');
  };

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const platformOptions = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'from-blue-400 to-cyan-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-800' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-500 to-indigo-600' }
  ];

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Schedule Post</h2>
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Post Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Summer Sale Launch Post"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Date *
              </label>
              <input
                id="date"
                type="date"
                required
                min={getMinDate()}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time *
              </label>
              <input
                id="time"
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Target Platforms *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platformOptions.map(platform => {
                const Icon = platform.icon;
                const isSelected = platforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-transparent ring-2 ring-offset-2 ring-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {platform.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add any notes or reminders for this post..."
            />
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
              disabled={platforms.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Schedule Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
