import { useState, useEffect } from 'react';
import { Sparkles, Building2, CalendarDays } from 'lucide-react';
import { InputSection } from './components/InputSection';
import { CaptionSelector } from './components/CaptionSelector';
import { HashtagDisplay } from './components/HashtagDisplay';
import { PlatformPreviews } from './components/PlatformPreviews';
import { ExportSection } from './components/ExportSection';
import { BrandProfileModal } from './components/BrandProfileModal';
import { ContentHistory } from './components/ContentHistory';
import { VisualSuggestions } from './components/VisualSuggestions';
import { PostOutline } from './components/PostOutline';
import { VideoOptimizationTips } from './components/VideoOptimizationTips';
import { Calendar } from './components/Calendar';
import { ScheduleModal } from './components/ScheduleModal';
import { ScheduledPostsList } from './components/ScheduledPostsList';
import { ContentPlanGenerator } from './components/ContentPlanGenerator';
import { SmartSchedulePlanner } from './components/SmartSchedulePlanner';
import { generateContent } from './services/contentGenerator';
import { resizeImageForPlatforms } from './services/imageResizer';
import { generateVisualSuggestions, generatePostOutline } from './services/visualGenerator';
import { generateRecurringSchedule } from './services/scheduleGenerator';
import type { PlannedPost as PlannedPostServiceType } from './services/contentPlanner';
import { supabase } from './lib/supabase';
import type { GeneratedContent, ToneType, BrandProfile, ResizedImages, ContentHistory as ContentHistoryType, ScheduledPost, PlannedPost, ContentPlan } from './types';

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneType>('casual');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resizedImages, setResizedImages] = useState<ResizedImages | undefined>();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [currentDescription, setCurrentDescription] = useState('');

  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [contentHistory, setContentHistory] = useState<ContentHistoryType[]>([]);
  const [userId] = useState('demo-user-' + Math.random().toString(36).substring(7));

  const [visualSuggestions, setVisualSuggestions] = useState<ReturnType<typeof generateVisualSuggestions>>([]);
  const [postOutline, setPostOutline] = useState<ReturnType<typeof generatePostOutline> | null>(null);
  const [showVideoTips, setShowVideoTips] = useState(false);

  const [showScheduleView, setShowScheduleView] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [showSmartPlanner, setShowSmartPlanner] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [plannedPosts, setPlannedPosts] = useState<PlannedPost[]>([]);
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);

  useEffect(() => {
    loadBrandProfile();
    loadContentHistory();
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

  const loadContentHistory = async () => {
    const { data } = await supabase
      .from('generated_content')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setContentHistory(data as ContentHistoryType[]);
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

  const saveContentToHistory = async (
    description: string,
    content: GeneratedContent,
    imageUrl: string | null,
    resizedImages: ResizedImages | undefined
  ) => {
    await supabase
      .from('generated_content')
      .insert({
        user_id: userId,
        brand_profile_id: brandProfile?.id || null,
        description,
        formal_caption: content.formal,
        casual_caption: content.casual,
        funny_caption: content.funny,
        hashtags: content.hashtags,
        image_url: imageUrl || '',
        resized_images: resizedImages || {}
      });

    loadContentHistory();
  };

  const handleGenerate = async (description: string, uploadedImageUrl: string | null, imageFile?: File) => {
    setIsGenerating(true);
    setCurrentStep(1);
    setCurrentDescription(description);

    try {
      let resized: ResizedImages | undefined;

      if (imageFile) {
        resized = await resizeImageForPlatforms(imageFile);
        setResizedImages(resized as ResizedImages);
      }

      const content = await generateContent(description, brandProfile);
      setGeneratedContent(content);
      setImageUrl(uploadedImageUrl);
      setCurrentStep(2);

      const suggestions = generateVisualSuggestions(description, brandProfile);
      setVisualSuggestions(suggestions);

      const outline = generatePostOutline(description, brandProfile?.tone || 'casual', brandProfile);
      setPostOutline(outline);

      await saveContentToHistory(description, content, uploadedImageUrl, resized as ResizedImages | undefined);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTone = (tone: ToneType) => {
    setSelectedTone(tone);
    if (generatedContent) {
      setCurrentStep(3);
    }
  };

  const handleLoadContent = (content: ContentHistoryType) => {
    setGeneratedContent({
      formal: content.formal_caption,
      casual: content.casual_caption,
      funny: content.funny_caption,
      hashtags: content.hashtags
    });
    setImageUrl(content.image_url || null);
    setResizedImages(content.resized_images as ResizedImages);
    setCurrentDescription(content.description);
    setCurrentStep(2);

    const suggestions = generateVisualSuggestions(content.description, brandProfile);
    setVisualSuggestions(suggestions);

    const outline = generatePostOutline(content.description, brandProfile?.tone || 'casual', brandProfile);
    setPostOutline(outline);
  };

  const handleDeleteContent = async (id: string) => {
    await supabase
      .from('generated_content')
      .delete()
      .eq('id', id);

    loadContentHistory();
  };

  const handleSchedulePost = async (scheduleData: {
    title: string;
    scheduledDate: string;
    scheduledTime: string;
    platforms: string[];
    notes: string;
  }) => {
    if (!generatedContent) return;

    await supabase
      .from('scheduled_posts')
      .insert({
        user_id: userId,
        brand_profile_id: brandProfile?.id || null,
        title: scheduleData.title,
        caption: getSelectedCaption(),
        hashtags: generatedContent.hashtags,
        platforms: scheduleData.platforms,
        image_url: imageUrl || '',
        scheduled_date: scheduleData.scheduledDate,
        scheduled_time: scheduleData.scheduledTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'scheduled',
        notes: scheduleData.notes
      });

    loadScheduledPosts();
  };

  const handleDeleteScheduledPost = async (id: string) => {
    await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id);

    loadScheduledPosts();
  };

  const handleEditScheduledPost = (post: ScheduledPost) => {
    setEditingPost(post);
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
        order_in_plan: index
      }));

      await supabase.from('planned_posts').insert(plannedPostsData);
      await loadContentPlans();
      setShowScheduleView(true);
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
      scheduled_date: date.toISOString().split('T')[0],
      scheduled_time: scheduleData.preferredTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: 'draft' as const,
      notes: `Auto-generated ${scheduleData.frequency} schedule`
    }));

    await supabase.from('scheduled_posts').insert(scheduledPostsData);
    await loadScheduledPosts();
    setShowScheduleView(true);
  };

  const getSelectedCaption = () => {
    if (!generatedContent) return '';
    const baseCaption = generatedContent[selectedTone];
    const cta = generatedContent.ctaVariations?.[selectedTone];
    return cta ? `${baseCaption}\n\n${cta}` : baseCaption;
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
            AI-Powered Content Generator with Visual Suggestions
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowScheduleView(!showScheduleView)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm font-medium ${
                showScheduleView
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              {showScheduleView ? 'Content Generator' : 'Calendar View'}
            </button>
            <button
              onClick={() => setShowBrandModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm font-medium text-gray-700"
            >
              <Building2 className="w-4 h-4" />
              {brandProfile ? `Brand: ${brandProfile.name}` : 'Setup Brand Profile'}
            </button>
            <button
              onClick={() => setShowVideoTips(!showVideoTips)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm font-medium text-gray-700"
            >
              Video Tips
            </button>
          </div>
        </header>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-2 ${step <= currentStep ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white transition-all ${
                    step < currentStep
                      ? 'bg-green-500'
                      : step === currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                      : 'bg-gray-300'
                  }`}>
                    {step}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:inline">
                    {step === 1 && 'Input'}
                    {step === 2 && 'Generate'}
                    {step === 3 && 'Preview & Export'}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 rounded ${step < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {showVideoTips && <VideoOptimizationTips />}

        {!showScheduleView ? (
          <>
            <ContentHistory
              history={contentHistory}
              onLoadContent={handleLoadContent}
              onDeleteContent={handleDeleteContent}
            />

            <InputSection onGenerate={handleGenerate} isGenerating={isGenerating} />

            {generatedContent && (
              <>
                {visualSuggestions.length > 0 && (
                  <VisualSuggestions suggestions={visualSuggestions} />
                )}

                {postOutline && <PostOutline outline={postOutline} />}

                <CaptionSelector content={generatedContent} onSelectTone={handleSelectTone} />
                <HashtagDisplay hashtags={generatedContent.hashtags} />
                <PlatformPreviews
                  caption={getSelectedCaption()}
                  hashtags={generatedContent.hashtags}
                  imageUrl={imageUrl}
                  resizedImages={resizedImages}
                />

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Ready to schedule?</h3>
                      <p className="text-sm text-gray-600">Schedule this content for future posting</p>
                    </div>
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center gap-2"
                    >
                      <CalendarDays className="w-5 h-5" />
                      Schedule Post
                    </button>
                  </div>
                </div>

                <ExportSection content={generatedContent} selectedCaption={getSelectedCaption()} />
              </>
            )}

            {!generatedContent && !isGenerating && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">
                  {brandProfile
                    ? 'Enter your campaign description to generate on-brand content with AI visual suggestions'
                    : 'Setup your brand profile and start generating content'}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      Smart Schedule Planner
                    </h3>
                    <p className="text-sm text-gray-600">
                      Create recurring posting schedules automatically
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSmartPlanner(true)}
                    className="mt-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Generate Schedule
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      AI Content Planning
                    </h3>
                    <p className="text-sm text-gray-600">
                      Let AI optimize posting schedule based on your brand
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPlanGenerator(true)}
                    className="mt-auto px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all"
                  >
                    Create Content Plan
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <Calendar
                  scheduledPosts={scheduledPosts}
                  onDateSelect={setSelectedDate}
                  onPostClick={handleEditScheduledPost}
                  selectedDate={selectedDate}
                />
              </div>
              <div>
                <ScheduledPostsList
                  posts={scheduledPosts}
                  selectedDate={selectedDate}
                  onEdit={handleEditScheduledPost}
                  onDelete={handleDeleteScheduledPost}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <BrandProfileModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSave={saveBrandProfile}
        existingProfile={brandProfile}
      />

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleSchedulePost}
        prefilledData={{
          title: currentDescription,
          caption: getSelectedCaption()
        }}
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
