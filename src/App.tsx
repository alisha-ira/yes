import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { InputSection } from './components/InputSection';
import { CaptionSelector } from './components/CaptionSelector';
import { HashtagDisplay } from './components/HashtagDisplay';
import { PlatformPreviews } from './components/PlatformPreviews';
import { ExportSection } from './components/ExportSection';
import { generateContent } from './services/contentGenerator';
import type { GeneratedContent, ToneType } from './types';

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneType>('casual');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const handleGenerate = async (description: string, uploadedImageUrl: string | null) => {
    setIsGenerating(true);
    setCurrentStep(1);

    try {
      const content = await generateContent(description);
      setGeneratedContent(content);
      setImageUrl(uploadedImageUrl);
      setCurrentStep(2);
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

  const getSelectedCaption = () => {
    if (!generatedContent) return '';
    return generatedContent[selectedTone];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AutoPostr
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            AI-Powered Social Media Content Generator
          </p>
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

        <InputSection onGenerate={handleGenerate} isGenerating={isGenerating} />

        {generatedContent && (
          <>
            <CaptionSelector content={generatedContent} onSelectTone={handleSelectTone} />
            <HashtagDisplay hashtags={generatedContent.hashtags} />
            <PlatformPreviews
              caption={getSelectedCaption()}
              hashtags={generatedContent.hashtags}
              imageUrl={imageUrl}
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
              Enter your campaign description to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
