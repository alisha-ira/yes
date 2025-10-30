import { useState } from 'react';
import { Sparkles, Upload, X, AlertCircle } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (companyName: string, productName: string, description: string, imageUrl: string | null) => void;
  isGenerating: boolean;
}

export function InputSection({ onGenerate, isGenerating }: InputSectionProps) {
  const [companyName, setCompanyName] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleRemoveImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
  };

  const validateInput = (text: string): string | null => {
    const trimmed = text.trim();

    if (trimmed.length === 0) {
      return 'This field cannot be empty. Please provide meaningful information.';
    }

    if (trimmed.length < 5) {
      return 'Input is too short. Please provide at least 5 characters.';
    }

    const spamPatterns = [
      /^(.)\1{10,}$/,
      /^[^a-zA-Z0-9\s]{20,}$/,
      /^(test|asdf|qwerty|12345)+$/i,
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(trimmed)) {
        return 'Your input seems unclear or invalid. Please provide meaningful information.';
      }
    }

    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) {
      return 'Your input seems unclear or invalid. Please provide meaningful information.';
    }

    const meaningfulWords = words.filter(w => /[a-zA-Z0-9]/.test(w));
    if (meaningfulWords.length === 0) {
      return 'Your input seems unclear or invalid. Please provide meaningful information.';
    }

    if (words.length === 1 && words[0].length < 3) {
      return 'Input is too short. Please provide more detail.';
    }

    return null;
  };

  const handleGenerate = () => {
    setError(null);

    const companyError = validateInput(companyName);
    if (companyError) {
      setError(`Company Name: ${companyError}`);
      return;
    }

    const productError = validateInput(productName);
    if (productError) {
      setError(`Product Name: ${productError}`);
      return;
    }

    const descError = validateInput(description);
    if (descError) {
      setError(`Description: ${descError}`);
      return;
    }

    onGenerate(companyName, productName, description, imageUrl);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Create Your Campaign</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="companyName"
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="E.g., Nike, Apple, Tesla"
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              setError(null);
            }}
            disabled={isGenerating}
          />
        </div>

        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            id="productName"
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="E.g., Air Max, iPhone 15, Model 3"
            value={productName}
            onChange={(e) => {
              setProductName(e.target.value);
              setError(null);
            }}
            disabled={isGenerating}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="E.g., Launching our new eco-friendly water bottle! Made from 100% recycled materials, keeps drinks cold for 24 hours..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setError(null);
            }}
            disabled={isGenerating}
          />
          {error && (
            <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Image (Optional)
          </label>

          {!imageUrl ? (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 font-medium">Click to upload image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isGenerating}
              />
            </label>
          ) : (
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-300">
              <img
                src={imageUrl}
                alt="Campaign preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                disabled={isGenerating}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!companyName.trim() || !productName.trim() || !description.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
              Generating Content...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Content
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
