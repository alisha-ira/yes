import { useState, useEffect } from 'react';
import { Sparkles, Building2 } from 'lucide-react';
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
import { generateContent } from './services/contentGenerator';
import { resizeImageForPlatforms } from './services/imageResizer';
import { generateVisualSuggestions, generatePostOutline } from './services/visualGenerator';
import { supabase } from './lib/supabase';
import type { GeneratedContent, ToneType, BrandProfile, ResizedImages, ContentHistory as ContentHistoryType } from './types';

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

  useEffect(() => {
    loadBrandProfile();
    loadContentHistory();
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
      </div>

      <BrandProfileModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSave={saveBrandProfile}
        existingProfile={brandProfile}
      />
    </div>
  );
}

export default App;
