import { useState, useEffect } from 'react';
import { Sparkles, Building2, CalendarDays } from 'lucide-react';
import { BrandProfileModal } from './components/BrandProfileModal';
import { Calendar } from './components/Calendar';
import { ScheduledPostsList } from './components/ScheduledPostsList';
import { ContentPlanGenerator } from './components/ContentPlanGenerator';
import { SmartSchedulePlanner } from './components/SmartSchedulePlanner';
import type { PlannedPost as PlannedPostServiceType } from './services/contentPlanner';
import { supabase } from './lib/supabase';
import type { BrandProfile, ScheduledPost, PlannedPost, ContentPlan } from './types';
import { formatDateForDB } from './utils/dateUtils';

function App() {
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [userId] = useState('demo-user-' + Math.random().toString(36).substring(7));

  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [showSmartPlanner, setShowSmartPlanner] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [plannedPosts, setPlannedPosts] = useState<PlannedPost[]>([]);
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);

  useEffect(() => {
    loadBrandProfile();
    loadScheduledPosts();
    loadContentPlans();
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


  const loadScheduledPosts = async () => {
    const { data } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (data) {
      setScheduledPosts(data as ScheduledPost[]);
    }
  };

  const loadContentPlans = async () => {
    const [plansData, postsData] = await Promise.all([
      supabase
        .from('content_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('planned_posts')
        .select('*')
        .eq('user_id', userId)
        .order('suggested_date', { ascending: true })
    ]);

    if (plansData.data) {
      setContentPlans(plansData.data as ContentPlan[]);
    }
    if (postsData.data) {
      setPlannedPosts(postsData.data as PlannedPost[]);
    }
  };

  const saveBrandProfile = async (profile: Partial<BrandProfile>) => {
    if (brandProfile?.id) {
      const { data } = await supabase
        .from('brand_profiles')
        .update({ ...profile, updated_at: new Date().toISOString() })
        .eq('id', brandProfile.id)
        .select()
        .single();

      if (data) {
        setBrandProfile(data as BrandProfile);
      }
    } else {
      const { data } = await supabase
        .from('brand_profiles')
        .insert({
          user_id: userId,
          ...profile
        })
        .select()
        .single();

      if (data) {
        setBrandProfile(data as BrandProfile);
      }
    }
  };


  const handleDeleteScheduledPost = async (id: string) => {
    await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id);

    loadScheduledPosts();
  };

  const handleDeletePlannedPost = async (id: string) => {
    await supabase
      .from('planned_posts')
      .delete()
      .eq('id', id);

    loadContentPlans();
  };

  const handleDeletePost = async (id: string, type: 'scheduled' | 'planned') => {
    if (type === 'scheduled') {
      await handleDeleteScheduledPost(id);
    } else {
      await handleDeletePlannedPost(id);
    }
  };

  const handleEditScheduledPost = (post: ScheduledPost | PlannedPost) => {
    setEditingPost(post as ScheduledPost);
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
        suggested_date: formatDateForDB(post.suggestedDate),
        suggested_time: post.suggestedTime,
        rationale: post.rationale,
        platforms: post.platforms,
        status: 'suggested' as const,
        order_in_plan: index
      }));

      await supabase.from('planned_posts').insert(plannedPostsData);

      await loadContentPlans();
      setShowPlanGenerator(false);
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
      title: `Scheduled Post #${index + 1}`,
      caption: 'Content to be generated',
      hashtags: [],
      platforms: ['instagram'],
      image_url: '',
      scheduled_date: formatDateForDB(date),
      scheduled_time: scheduleData.preferredTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: 'draft' as const,
      notes: `Auto-generated ${scheduleData.frequency} schedule`
    }));

    await supabase.from('scheduled_posts').insert(scheduledPostsData);

    await loadScheduledPosts();
    setShowSmartPlanner(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AutoPostr
            </h1>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            AI-Powered Content Scheduling
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowBrandModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm font-medium text-gray-700"
            >
              <Building2 className="w-4 h-4" />
              {brandProfile ? `Brand: ${brandProfile.name}` : 'Setup Brand Profile'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Calendar
              scheduledPosts={scheduledPosts}
              plannedPosts={plannedPosts}
              onDateSelect={setSelectedDate}
              onPostClick={handleEditScheduledPost}
              selectedDate={selectedDate}
            />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <CalendarDays className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Generate Smart Schedule
                  </h3>
                  <p className="text-gray-600 mb-6 flex-1">
                    Create recurring posting schedules automatically based on frequency and timing
                  </p>
                  <button
                    onClick={() => setShowSmartPlanner(true)}
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Generate Schedule
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    AI Content Generator
                  </h3>
                  <p className="text-gray-600 mb-6 flex-1">
                    Let AI optimize your posting schedule based on your brand and audience
                  </p>
                  <button
                    onClick={() => setShowPlanGenerator(true)}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Create Content Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <ScheduledPostsList
              scheduledPosts={scheduledPosts}
              plannedPosts={plannedPosts}
              selectedDate={selectedDate}
              onEdit={handleEditScheduledPost}
              onDelete={handleDeletePost}
            />
          </div>
        </div>
      </div>

      <BrandProfileModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSave={saveBrandProfile}
        existingProfile={brandProfile}
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
    </div>
  );
}

export default App;
