import { Clock, Instagram, Twitter, Linkedin, Facebook, Edit, Trash2, CheckCircle, AlertCircle, Sparkles, Bell } from 'lucide-react';
import type { ScheduledPost, PlannedPost } from '../types';

interface ScheduledPostsListProps {
  scheduledPosts: ScheduledPost[];
  plannedPosts: PlannedPost[];
  selectedDate: Date | null;
  onEdit: (post: ScheduledPost | PlannedPost) => void;
  onDelete: (id: string, type: 'scheduled' | 'planned') => void;
  onSetAlarm: (post: ScheduledPost | PlannedPost) => void;
}

export function ScheduledPostsList({ scheduledPosts, plannedPosts, selectedDate, onEdit, onDelete, onSetAlarm }: ScheduledPostsListProps) {
  const platformIcons = {
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    facebook: Facebook
  };

  const platformColors = {
    instagram: 'from-purple-500 to-pink-500',
    twitter: 'from-blue-400 to-cyan-500',
    linkedin: 'from-blue-600 to-blue-800',
    facebook: 'from-blue-500 to-indigo-600'
  };

  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Edit },
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Clock },
    published: { label: 'Published', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    suggested: { label: 'AI Suggested', color: 'bg-green-100 text-green-700', icon: Sparkles },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    generated: { label: 'Generated', color: 'bg-purple-100 text-purple-700', icon: Sparkles }
  };

  const allPosts = [
    ...scheduledPosts.map(post => ({
      ...post,
      type: 'scheduled' as const,
      date: post.scheduled_date,
      time: post.scheduled_time
    })),
    ...plannedPosts.map(post => ({
      ...post,
      type: 'planned' as const,
      date: post.suggested_date,
      time: post.suggested_time,
      platforms: post.platforms || [],
      caption: post.caption || 'AI-generated content plan'
    }))
  ];

  const filteredPosts = selectedDate
    ? allPosts.filter(post => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const selectedDateStr = `${year}-${month}-${day}`;
        return post.date === selectedDateStr;
      })
    : allPosts;

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (sortedPosts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {selectedDate ? 'No posts scheduled for this date' : 'No scheduled posts'}
        </h3>
        <p className="text-gray-600 text-sm">
          {selectedDate
            ? 'Select another date or create a new scheduled post'
            : 'Create your first scheduled post to see it here'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {selectedDate ? `Posts for ${formatDate(selectedDate.toISOString())}` : 'All Scheduled Posts'}
      </h3>

      <div className="space-y-4">
        {sortedPosts.map(post => {
          const StatusIcon = statusConfig[post.status].icon;
          return (
            <div
              key={post.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800 truncate">{post.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[post.status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[post.status].label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.caption}</p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(post.date)} at {formatTime(post.time)}</span>
                    </div>
                    {post.type === 'planned' && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Plan
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      {post.platforms.map(platform => {
                        const Icon = platformIcons[platform as keyof typeof platformIcons];
                        const color = platformColors[platform as keyof typeof platformColors];
                        return Icon ? (
                          <div
                            key={platform}
                            className={`w-6 h-6 bg-gradient-to-br ${color} rounded flex items-center justify-center`}
                            title={platform}
                          >
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {'notes' in post && post.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic">Note: {post.notes}</p>
                  )}
                  {'rationale' in post && post.rationale && (
                    <p className="text-xs text-gray-500 mt-2 italic">AI Rationale: {post.rationale}</p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onSetAlarm(post)}
                    className="p-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    title="Set alarm for this post"
                  >
                    <Bell className="w-4 h-4 text-orange-600" />
                  </button>
                  <button
                    onClick={() => onEdit(post)}
                    className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit post"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => onDelete(post.id, post.type)}
                    className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
