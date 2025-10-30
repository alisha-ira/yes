import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Sparkles, TrendingUp, X } from 'lucide-react';

interface SmartSchedulePlannerProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateSchedule: (schedule: {
    frequency: string;
    preferredDay: string;
    preferredTime: string;
    numberOfPosts: number;
    startDate: string;
  }) => void;
}

interface BestTime {
  day: string;
  time: string;
  label: string;
  reason: string;
  engagement: string;
}

const BEST_POSTING_TIMES: BestTime[] = [
  {
    day: 'wednesday',
    time: '12:00',
    label: 'Wednesday at 12:00 PM',
    reason: 'Peak mid-week engagement during lunch break',
    engagement: 'High'
  },
  {
    day: 'friday',
    time: '18:00',
    label: 'Friday at 6:00 PM',
    reason: 'Weekend anticipation drives high interaction',
    engagement: 'Very High'
  },
  {
    day: 'tuesday',
    time: '10:00',
    label: 'Tuesday at 10:00 AM',
    reason: 'Morning productivity hours with fresh audience',
    engagement: 'High'
  },
  {
    day: 'thursday',
    time: '15:00',
    label: 'Thursday at 3:00 PM',
    reason: 'Afternoon energy boost time',
    engagement: 'Medium-High'
  },
  {
    day: 'monday',
    time: '09:00',
    label: 'Monday at 9:00 AM',
    reason: 'Start of week, professional audience active',
    engagement: 'Medium'
  }
];

export function SmartSchedulePlanner({ isOpen, onClose, onGenerateSchedule }: SmartSchedulePlannerProps) {
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [preferredDay, setPreferredDay] = useState('wednesday');
  const [preferredTime, setPreferredTime] = useState('12:00');
  const [numberOfPosts, setNumberOfPosts] = useState(12);
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [useBestTime, setUseBestTime] = useState(false);

  const frequencyOptions = [
    {
      value: 'weekly',
      label: 'Weekly',
      description: 'Post once every week',
      icon: '📅',
      recommended: true
    },
    {
      value: 'biweekly',
      label: 'Bi-weekly',
      description: 'Post once every 2 weeks',
      icon: '📆',
      recommended: false
    },
    {
      value: 'monthly',
      label: 'Monthly',
      description: 'Post once every month',
      icon: '🗓️',
      recommended: false
    }
  ];

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const handleSelectBestTime = (bestTime: BestTime) => {
    setPreferredDay(bestTime.day);
    setPreferredTime(bestTime.time);
    setUseBestTime(false);
  };

  const handleGenerate = () => {
    onGenerateSchedule({
      frequency,
      preferredDay,
      preferredTime,
      numberOfPosts,
      startDate
    });
    onClose();
  };

  const getEstimatedDuration = () => {
    const multiplier = frequency === 'weekly' ? 1 : frequency === 'biweekly' ? 2 : 4.33;
    const weeks = numberOfPosts * multiplier;
    if (weeks < 8) return `${Math.round(weeks)} weeks`;
    return `${Math.round(weeks / 4.33)} months`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Smart Schedule Planner</h2>
              <p className="text-sm text-gray-600">Create a recurring posting schedule automatically</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Posting Frequency
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {frequencyOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFrequency(option.value as any)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    frequency === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{option.icon}</span>
                    {option.recommended && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Best
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{option.label}</h3>
                  <p className="text-xs text-gray-600">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">Best Posting Times</h3>
                <p className="text-xs text-gray-600 mb-3">
                  These times have proven to generate the highest engagement rates
                </p>
                <div className="space-y-2">
                  {BEST_POSTING_TIMES.map((bestTime, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectBestTime(bestTime)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        preferredDay === bestTime.day && preferredTime === bestTime.time
                          ? 'border-purple-500 bg-white shadow-sm'
                          : 'border-transparent bg-white/50 hover:bg-white hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800 text-sm">{bestTime.label}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              bestTime.engagement === 'Very High' ? 'bg-green-100 text-green-700' :
                              bestTime.engagement === 'High' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {bestTime.engagement}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{bestTime.reason}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Preferred Day
              </label>
              <select
                id="day"
                value={preferredDay}
                onChange={(e) => setPreferredDay(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
              >
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Preferred Time
              </label>
              <input
                id="time"
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="numberOfPosts" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Posts to Schedule: {numberOfPosts}
            </label>
            <input
              id="numberOfPosts"
              type="range"
              min="4"
              max="52"
              value={numberOfPosts}
              onChange={(e) => setNumberOfPosts(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>4 posts</span>
              <span>52 posts</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm">Schedule Preview</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>📊 Frequency: <span className="font-medium capitalize">{frequency}</span></li>
              <li>📅 Posting Day: <span className="font-medium capitalize">{preferredDay}</span></li>
              <li>⏰ Posting Time: <span className="font-medium">{preferredTime}</span></li>
              <li>📝 Total Posts: <span className="font-medium">{numberOfPosts}</span></li>
              <li>⏳ Duration: <span className="font-medium">~{getEstimatedDuration()}</span></li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
