import { useState, useEffect } from 'react';
import { Sparkles, Calendar as CalendarIcon, Zap } from 'lucide-react';
import { IntegratedCalendar } from './components/IntegratedCalendar';
import { ContentPlanGenerator } from './components/ContentPlanGenerator';
import { SmartSchedulePlanner } from './components/SmartSchedulePlanner';
import { EditPostModal } from './components/EditPostModal';
import { generateRecurringSchedule } from './services/scheduleGenerator';
import type { PlannedPost as PlannedPostServiceType } from './services/contentPlanner';
import { supabase } from './lib/supabase';
import type { BrandProfile, ScheduledPost, PlannedPost } from './types';

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

function App() {
  const userId = 'demo-user-123';

  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [allPosts, setAllPosts] = useState<CalendarPost[]>([]);
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [showSmartPlanner, setShowSmartPlanner] = useState(false);
  const [editingPost, setEditingPost] = useState<CalendarPost | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadBrandProfile();
    loadAllPosts();
  }, []);

  const loadBrandProfile = async () => {
    const { data } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setBrandProfile(data as BrandProfile);
    }
  };

  const loadAllPosts = async () => {
    const [scheduledData, plannedData] = await Promise.all([
      supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_date', { ascending: true }),
      supabase
        .from('planned_posts')
        .select('*')
        .eq('user_id', userId)
        .order('suggested_date', { ascending: true })
    ]);

    const posts: CalendarPost[] = [];

    if (scheduledData.data) {
      scheduledData.data.forEach((post: ScheduledPost) => {
        posts.push({
          id: post.id,
          title: post.title,
          caption: post.caption,
          date: post.scheduled_date,
          time: post.scheduled_time,
          platforms: post.platforms,
          status: post.status,
          type: 'scheduled',
          hashtags: post.hashtags,
          notes: post.notes
        });
      });
    }

    if (plannedData.data) {
      plannedData.data.forEach((post: PlannedPost) => {
        posts.push({
          id: post.id,
          title: post.title,
          caption: post.caption || 'AI-generated content plan',
          date: post.suggested_date,
          time: post.suggested_time,
          platforms: post.platforms,
          status: post.status,
          type: 'planned',
          hashtags: post.hashtags,
          rationale: post.rationale
        });
      });
    }

    setAllPosts(posts);
  };

  const handleGenerateContentPlan = async (planData: {
    planName: string;
    startDate: string;
    endDate: string;
    frequency: string;
    posts: PlannedPostServiceType[];
  }) => {
    const { data: planRecord } = await supabase
      .from('content_plans')
      .insert({
        user_id: userId,
        brand_profile_id: brandProfile?.id || null,
        plan_name: planData.planName,
        start_date: planData.startDate,
        end_date: planData.endDate,
        frequency: planData.frequency,
        total_posts: planData.posts.length,
        status: 'active'
      })
      .select()
      .single();

    if (planRecord) {
      const plannedPostsData = planData.posts.map((post, index) => ({
        content_plan_id: planRecord.id,
        user_id: userId,
        title: post.title,
        suggested_date: post.suggestedDate.toISOString().split('T')[0],
        suggested_time: post.suggestedTime,
        rationale: post.rationale,
        platforms: post.platforms,
        status: 'suggested' as const,
        order_in_plan: index,
        caption: `${post.title} - AI generated content`,
        hashtags: []
      }));

      await supabase.from('planned_posts').insert(plannedPostsData);
      await loadAllPosts();
    }
  };

  const handleGenerateSmartSchedule = async (scheduleData: {
    frequency: string;
    preferredDay: string;
    preferredTime: string;
    numberOfPosts: number;
    startDate: string;
  }) => {
    const dates = generateRecurringSchedule(
      scheduleData.startDate,
      scheduleData.frequency as 'weekly' | 'biweekly' | 'monthly',
      scheduleData.preferredDay,
      scheduleData.numberOfPosts
    );

    const scheduledPostsData = dates.map((date, index) => ({
      user_id: userId,
      brand_profile_id: brandProfile?.id || null,
      title: `${scheduleData.frequency.charAt(0).toUpperCase() + scheduleData.frequency.slice(1)} Post #${index + 1}`,
      caption: 'Add your content here...',
      hashtags: [],
      platforms: ['instagram'],
      image_url: '',
      scheduled_date: date.toISOString().split('T')[0],
      scheduled_time: scheduleData.preferredTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: 'draft' as const,
      notes: `Auto-scheduled ${scheduleData.frequency} on ${scheduleData.preferredDay}s at ${scheduleData.preferredTime}`
    }));

    await supabase.from('scheduled_posts').insert(scheduledPostsData);
    await loadAllPosts();
  };

  const handleEditPost = (post: CalendarPost) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleSavePost = async (updatedPost: CalendarPost) => {
    if (updatedPost.type === 'scheduled') {
      await supabase
        .from('scheduled_posts')
        .update({
          title: updatedPost.title,
          caption: updatedPost.caption,
          scheduled_date: updatedPost.date,
          scheduled_time: updatedPost.time,
          platforms: updatedPost.platforms,
          notes: updatedPost.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedPost.id);
    } else {
      await supabase
        .from('planned_posts')
        .update({
          title: updatedPost.title,
          caption: updatedPost.caption,
          suggested_date: updatedPost.date,
          suggested_time: updatedPost.time,
          platforms: updatedPost.platforms,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedPost.id);
    }

    await loadAllPosts();
  };

  const handleDeletePost = async (id: string, type: 'scheduled' | 'planned') => {
    if (type === 'scheduled') {
      await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id);
    } else {
      await supabase
        .from('planned_posts')
        .delete()
        .eq('id', id);
    }

    await loadAllPosts();
  };

  const handleReschedulePost = async (post: CalendarPost, newDate: Date) => {
    const dateStr = newDate.toISOString().split('T')[0];

    if (post.type === 'scheduled') {
      await supabase
        .from('scheduled_posts')
        .update({
          scheduled_date: dateStr,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);
    } else {
      await supabase
        .from('planned_posts')
        .update({
          suggested_date: dateStr,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);
    }

    await loadAllPosts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AutoPostr
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            AI-Powered Social Media Content Planning & Scheduling
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  AI Content Planner
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generate optimized posting schedules based on your brand, industry, and target platforms. AI suggests best times and content themes.
                </p>
                <button
                  onClick={() => setShowPlanGenerator(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all"
                >
                  Create AI Content Plan
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Smart Scheduler
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Set your posting frequency and preferred times. Automatically generate recurring schedules for weeks or months ahead.
                </p>
                <button
                  onClick={() => setShowSmartPlanner(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Generate Smart Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-800">Content Calendar</h2>
          </div>
          <p className="text-gray-600">
            {allPosts.length} {allPosts.length === 1 ? 'post' : 'posts'} scheduled
          </p>
        </div>

        <IntegratedCalendar
          posts={allPosts}
          onEditPost={handleEditPost}
          onDeletePost={handleDeletePost}
          onReschedulePost={handleReschedulePost}
        />

        <ContentPlanGenerator
          isOpen={showPlanGenerator}
          onClose={() => setShowPlanGenerator(false)}
          onGeneratePlan={handleGenerateContentPlan}
          brandProfile={brandProfile}
        />

        <SmartSchedulePlanner
          isOpen={showSmartPlanner}
          onClose={() => setShowSmartPlanner(false)}
          onGenerateSchedule={handleGenerateSmartSchedule}
        />

        <EditPostModal
          isOpen={showEditModal}
          post={editingPost}
          onClose={() => {
            setShowEditModal(false);
            setEditingPost(null);
          }}
          onSave={handleSavePost}
        />
      </div>
    </div>
  );
}

export default App;
