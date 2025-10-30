import { useState, useEffect } from 'react';
import { X, Clock, Calendar as CalendarIcon, Save, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import type { ScheduledPost, PlannedPost } from '../types';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, type: 'scheduled' | 'planned') => void;
  post: ScheduledPost | PlannedPost | null;
  type: 'scheduled' | 'planned';
}

export function EditPostModal({ isOpen, onClose, onSave, post, type }: EditPostModalProps) {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [platforms, setPlatforms] = useState<string[]>(['instagram']);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (post && isOpen) {
      setTitle(post.title || '');
      setCaption(post.caption || '');
      setPlatforms(post.platforms || ['instagram']);
      setHashtags(post.hashtags || []);

      if (type === 'scheduled') {
        const scheduledPost = post as ScheduledPost;
        setDate(scheduledPost.scheduled_date);
        setTime(scheduledPost.scheduled_time || '09:00');
        setNotes(scheduledPost.notes || '');
        setStatus(scheduledPost.status || 'draft');
      } else {
        const plannedPost = post as PlannedPost;
        setDate(plannedPost.suggested_date);
        setTime(plannedPost.suggested_time || '09:00');
        setStatus(plannedPost.status || 'suggested');
      }
    }
  }, [post, isOpen, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      id: post?.id,
      title,
      caption,
      platforms,
      hashtags,
      ...(type === 'scheduled'
        ? {
            scheduled_date: date,
            scheduled_time: time,
            notes,
            status
          }
        : {
            suggested_date: date,
            suggested_time: time,
            status
          }
      )
    };

    onSave(updateData, type);
    onClose();
  };

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleHashtagChange = (value: string) => {
    const tags = value.split(' ').filter(tag => tag.trim());
    setHashtags(tags);
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

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Edit {type === 'scheduled' ? 'Scheduled' : 'Planned'} Post
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Post Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Write your caption here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Platforms
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platformOptions.map(platform => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      platforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-1 ${
                      platforms.includes(platform.id) ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-xs font-medium ${
                      platforms.includes(platform.id) ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {platform.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={getMinDate()}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-2">
              Hashtags (space-separated)
            </label>
            <input
              id="hashtags"
              type="text"
              value={hashtags.join(' ')}
              onChange={(e) => handleHashtagChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="#hashtag1 #hashtag2 #hashtag3"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {type === 'scheduled' ? (
                <>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="failed">Failed</option>
                </>
              ) : (
                <>
                  <option value="suggested">Suggested</option>
                  <option value="approved">Approved</option>
                  <option value="generated">Generated</option>
                </>
              )}
            </select>
          </div>

          {type === 'scheduled' && (
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add any notes or reminders..."
              />
            </div>
          )}

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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
