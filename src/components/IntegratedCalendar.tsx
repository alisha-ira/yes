import { useState, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Edit, Trash2, Clock, Instagram, Twitter, Linkedin, Facebook, X, Calendar as CalendarIcon } from 'lucide-react';

const localizer = momentLocalizer(moment);

interface CalendarPost {
  id: string;
  title: string;
  caption: string;
  date: string;
  time: string;
  platforms: string[];
  status: string;
  type: 'scheduled' | 'planned';
  hashtags?: string[];
  rationale?: string;
  notes?: string;
}

interface IntegratedCalendarProps {
  posts: CalendarPost[];
  onEditPost: (post: CalendarPost) => void;
  onDeletePost: (id: string, type: 'scheduled' | 'planned') => void;
  onReschedulePost: (post: CalendarPost, newDate: Date) => void;
}

interface CalendarEvent extends Event {
  resource: CalendarPost;
}

export function IntegratedCalendar({ posts, onEditPost, onDeletePost, onReschedulePost }: IntegratedCalendarProps) {
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  const platformIcons = {
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    facebook: Facebook
  };

  const platformColors = {
    instagram: '#E1306C',
    twitter: '#1DA1F2',
    linkedin: '#0077B5',
    facebook: '#4267B2'
  };

  const events: CalendarEvent[] = useMemo(() => {
    return posts.map(post => {
      const dateTime = moment(`${post.date} ${post.time}`, 'YYYY-MM-DD HH:mm').toDate();

      return {
        title: post.title,
        start: dateTime,
        end: moment(dateTime).add(30, 'minutes').toDate(),
        resource: post,
        allDay: false
      };
    });
  }, [posts]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const post = event.resource;
    const primaryPlatform = post.platforms[0] || 'instagram';
    const color = platformColors[primaryPlatform as keyof typeof platformColors] || '#3174ad';

    const style = {
      backgroundColor: post.type === 'planned' ? '#10b981' : color,
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '13px',
      fontWeight: '500'
    };

    return { style };
  }, []);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedPost(event.resource);
    setShowDetailsModal(true);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    console.log('Selected slot:', start);
  };

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const label = () => {
      const date = moment(toolbar.date);
      return (
        <span className="text-lg font-bold text-gray-800">
          {date.format('MMMM YYYY')}
        </span>
      );
    };

    return (
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          {label()}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToBack}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            →
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          view={view}
          onView={(newView) => setView(newView as any)}
          components={{
            toolbar: CustomToolbar
          }}
        />

        <div className="mt-6 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Scheduled Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">AI Planned Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: platformColors.instagram }}></div>
            <span className="text-gray-600">Instagram</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: platformColors.twitter }}></div>
            <span className="text-gray-600">Twitter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: platformColors.linkedin }}></div>
            <span className="text-gray-600">LinkedIn</span>
          </div>
        </div>
      </div>

      {showDetailsModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">Post Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedPost.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedPost.type === 'planned'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedPost.type === 'planned' ? 'AI Planned' : 'Scheduled'}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                    {selectedPost.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {selectedPost.caption}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {moment(selectedPost.date).format('MMM DD, YYYY')} at {selectedPost.time}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                  <div className="flex items-center gap-2">
                    {selectedPost.platforms.map(platform => {
                      const Icon = platformIcons[platform as keyof typeof platformIcons];
                      const color = platformColors[platform as keyof typeof platformColors];
                      return Icon ? (
                        <div
                          key={platform}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: color }}
                          title={platform}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.hashtags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPost.rationale && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI Rationale</label>
                  <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg italic">
                    {selectedPost.rationale}
                  </p>
                </div>
              )}

              {selectedPost.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedPost.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    onEditPost(selectedPost);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Post
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this post?')) {
                      onDeletePost(selectedPost.id, selectedPost.type);
                      setShowDetailsModal(false);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
