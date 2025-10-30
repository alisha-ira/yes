import { useState, useEffect } from 'react';
import { X, Bell, Volume2, VolumeX } from 'lucide-react';
import type { ScheduledPost, PlannedPost } from '../types';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAlarm: (alarmData: {
    title: string;
    alarmDatetime: string;
    scheduledPostId: string | null;
    plannedPostId: string | null;
    soundEnabled: boolean;
    notificationEnabled: boolean;
    notes: string;
  }) => void;
  linkedPost?: ScheduledPost | PlannedPost;
}

export function AlarmModal({ isOpen, onClose, onCreateAlarm, linkedPost }: AlarmModalProps) {
  const [title, setTitle] = useState('');
  const [alarmDatetime, setAlarmDatetime] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5);
      const localDateTime = now.toISOString().slice(0, 16);
      setAlarmDatetime(localDateTime);

      if (linkedPost) {
        setTitle(`Reminder: ${linkedPost.title}`);
        const postDate = 'scheduled_date' in linkedPost
          ? linkedPost.scheduled_date
          : linkedPost.suggested_date;
        const postTime = 'scheduled_time' in linkedPost
          ? linkedPost.scheduled_time
          : linkedPost.suggested_time;

        const postDateTime = new Date(`${postDate}T${postTime}`);
        postDateTime.setMinutes(postDateTime.getMinutes() - 15);
        setAlarmDatetime(postDateTime.toISOString().slice(0, 16));
        setNotes(`Reminder 15 minutes before: ${linkedPost.title}`);
      } else {
        setTitle('');
        setNotes('');
      }
    }
  }, [isOpen, linkedPost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !alarmDatetime) {
      alert('Please fill in all required fields');
      return;
    }

    const alarmDate = new Date(alarmDatetime);
    if (alarmDate <= new Date()) {
      alert('Please select a future date and time');
      return;
    }

    onCreateAlarm({
      title: title.trim(),
      alarmDatetime: new Date(alarmDatetime).toISOString(),
      scheduledPostId: linkedPost && 'scheduled_date' in linkedPost ? linkedPost.id : null,
      plannedPostId: linkedPost && 'suggested_date' in linkedPost ? linkedPost.id : null,
      soundEnabled,
      notificationEnabled,
      notes: notes.trim(),
    });

    setTitle('');
    setAlarmDatetime('');
    setNotes('');
    setSoundEnabled(true);
    setNotificationEnabled(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Set Alarm</h2>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alarm Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="e.g., Post Product Launch"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={alarmDatetime}
              onChange={(e) => setAlarmDatetime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Select any future date and time for your alarm
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder="Add any additional notes or reminders..."
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alarm Options
            </label>

            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="sound"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="sound" className="flex items-center gap-2 cursor-pointer flex-1">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-orange-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <div className="font-medium text-gray-800">Play Sound</div>
                  <div className="text-xs text-gray-500">Play a beep sound when alarm triggers</div>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="notification"
                checked={notificationEnabled}
                onChange={(e) => setNotificationEnabled(e.target.checked)}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="notification" className="flex items-center gap-2 cursor-pointer flex-1">
                <Bell className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-800">Browser Notification</div>
                  <div className="text-xs text-gray-500">Show a browser notification (requires permission)</div>
                </div>
              </label>
            </div>
          </div>

          {linkedPost && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Linked to:</span> {linkedPost.title}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all shadow-md"
            >
              Create Alarm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
