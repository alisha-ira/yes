import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, Clock } from 'lucide-react';
import type { ScheduledPost, PlannedPost } from '../types';
import { formatDateForDB } from '../utils/dateUtils';

interface CalendarPost {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'scheduled' | 'planned';
  status?: string;
  originalPost: ScheduledPost | PlannedPost;
}

interface CalendarProps {
  scheduledPosts: ScheduledPost[];
  plannedPosts: PlannedPost[];
  onDateSelect: (date: Date) => void;
  onPostClick: (post: any) => void;
  selectedDate: Date | null;
}

export function Calendar({ scheduledPosts, plannedPosts, onDateSelect, onPostClick, selectedDate }: CalendarProps) {
  const [allPosts, setAllPosts] = useState<CalendarPost[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    const combinedPosts: CalendarPost[] = [
      ...scheduledPosts
        .filter(post => post.scheduled_date)
        .map(post => ({
          id: post.id,
          date: post.scheduled_date,
          time: post.scheduled_time || '12:00',
          title: post.title || 'Scheduled Post',
          type: 'scheduled' as const,
          status: post.status,
          originalPost: post
        })),
      ...plannedPosts
        .filter(post => post.suggested_date)
        .map(post => ({
          id: post.id,
          date: post.suggested_date,
          time: post.suggested_time || '12:00',
          title: post.title || 'Planned Post',
          type: 'planned' as const,
          status: post.status,
          originalPost: post
        }))
    ];
    setAllPosts(combinedPosts);
  }, [scheduledPosts, plannedPosts]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const days: Date[] = [];
    const currentDay = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - currentDay + (currentDay === 0 ? -6 : 1));

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getPostsForDate = (date: Date) => {
    const dateStr = formatDateForDB(date);
    return allPosts.filter(post => post.date === dateStr);
  };

  const previousPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = view === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Content Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'month' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'week' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'
              }`}
            >
              Week
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousPeriod}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">
          {view === 'month'
            ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            : `Week of ${monthNames[days[0].getMonth()]} ${days[0].getDate()}, ${days[0].getFullYear()}`}
        </h3>
        <button
          onClick={nextPeriod}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const posts = getPostsForDate(day);
          const isTodayDate = isToday(day);
          const isSelectedDate = isSelected(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`aspect-square p-2 rounded-xl border-2 transition-all hover:border-blue-300 ${
                isSelectedDate
                  ? 'border-blue-500 bg-blue-50'
                  : isTodayDate
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col h-full">
                <span className={`text-sm font-medium mb-1 ${
                  isTodayDate ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {day.getDate()}
                </span>
                {posts.length > 0 && (
                  <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                    {posts.slice(0, 3).map(post => (
                      <button
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPostClick(post.originalPost);
                        }}
                        className={`w-full px-2 py-1 rounded text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1 ${
                          post.type === 'planned'
                            ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        }`}
                        title={`${post.title} at ${post.time} (${post.type})`}
                      >
                        {post.type === 'planned' ? (
                          <Sparkles className="w-3 h-3 flex-shrink-0" />
                        ) : (
                          <Clock className="w-3 h-3 flex-shrink-0" />
                        )}
                        <span className="truncate">{post.title}</span>
                      </button>
                    ))}
                    {posts.length > 3 && (
                      <span className="text-xs text-gray-500 font-medium">
                        +{posts.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
