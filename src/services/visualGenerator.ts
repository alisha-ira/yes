import type { BrandProfile } from '../types';

export interface VisualSuggestion {
  id: string;
  title: string;
  description: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  recommendedPlatforms: string[];
}

export interface PostOutline {
  hook: string;
  mainMessage: string;
  callToAction: string;
  structure: string[];
  bestTimeToPost: string;
}

export function generateVisualSuggestions(
  description: string,
  brandProfile?: BrandProfile | null
): VisualSuggestion[] {
  const lowerDesc = description.toLowerCase();
  const industry = brandProfile?.industry?.toLowerCase() || '';
  const tone = brandProfile?.tone || 'casual';
  const brandName = brandProfile?.name || 'your brand';

  const suggestions: VisualSuggestion[] = [];

  const styleMap: Record<string, string> = {
    professional: 'clean, minimalist, corporate aesthetic with professional lighting',
    casual: 'warm, approachable, lifestyle-oriented with natural lighting',
    playful: 'vibrant, colorful, dynamic with energetic composition',
    inspirational: 'dramatic, aspirational, cinematic with golden hour lighting',
    educational: 'clear, informative, diagram-friendly with neutral background'
  };

  const baseStyle = styleMap[tone] || styleMap.casual;

  if (lowerDesc.includes('launch') || lowerDesc.includes('new') || lowerDesc.includes('announce')) {
    suggestions.push({
      id: 'launch-hero',
      title: 'Product Hero Shot',
      description: 'Eye-catching hero image showcasing the new product',
      prompt: `Professional product photography of ${description}, ${baseStyle}, studio lighting, high resolution, product centered, brand colors, marketing material quality`,
      style: 'Product Photography',
      aspectRatio: '1:1 (Instagram), 16:9 (Twitter/LinkedIn)',
      recommendedPlatforms: ['Instagram', 'Twitter', 'LinkedIn']
    });

    suggestions.push({
      id: 'launch-lifestyle',
      title: 'Lifestyle Context',
      description: 'Product shown in real-world usage scenario',
      prompt: `Lifestyle photography showing ${description} being used in everyday context, ${baseStyle}, natural environment, authentic moment, relatable scene`,
      style: 'Lifestyle Photography',
      aspectRatio: '4:5 (Instagram), 16:9 (Others)',
      recommendedPlatforms: ['Instagram', 'Facebook']
    });
  }

  if (lowerDesc.includes('eco') || lowerDesc.includes('sustainable') || lowerDesc.includes('green')) {
    suggestions.push({
      id: 'eco-nature',
      title: 'Nature Integration',
      description: 'Eco-friendly visuals with natural elements',
      prompt: `${description} surrounded by natural elements, lush greenery, eco-conscious aesthetic, sustainable lifestyle, earth tones, organic textures, environmental harmony`,
      style: 'Nature & Sustainability',
      aspectRatio: '1:1 or 4:5',
      recommendedPlatforms: ['Instagram', 'Pinterest']
    });
  }

  if (lowerDesc.includes('tech') || lowerDesc.includes('innovation') || lowerDesc.includes('ai')) {
    suggestions.push({
      id: 'tech-modern',
      title: 'Modern Tech Aesthetic',
      description: 'Sleek, futuristic technology visualization',
      prompt: `Futuristic visualization of ${description}, modern tech aesthetic, glowing interfaces, blue and cyan tones, digital innovation, sleek design, cutting-edge technology`,
      style: 'Tech & Innovation',
      aspectRatio: '16:9 (LinkedIn), 1:1 (Instagram)',
      recommendedPlatforms: ['LinkedIn', 'Twitter']
    });
  }

  suggestions.push({
    id: 'brand-story',
    title: 'Brand Story Visual',
    description: 'Behind-the-scenes or brand narrative image',
    prompt: `Behind the scenes of ${brandName} creating ${description}, authentic brand story, team collaboration, creative process, brand values in action, ${baseStyle}`,
    style: 'Brand Storytelling',
    aspectRatio: '4:5 (Instagram Stories)',
    recommendedPlatforms: ['Instagram', 'Facebook', 'LinkedIn']
  });

  suggestions.push({
    id: 'text-overlay',
    title: 'Text-Based Graphic',
    description: 'Bold typography with key message',
    prompt: `Bold typography design featuring key message from ${description}, ${baseStyle}, strong visual hierarchy, brand colors, minimal background, quote card style, social media optimized`,
    style: 'Typography & Graphics',
    aspectRatio: '1:1 (All platforms)',
    recommendedPlatforms: ['Instagram', 'Twitter', 'LinkedIn', 'Facebook']
  });

  if (lowerDesc.includes('sale') || lowerDesc.includes('discount') || lowerDesc.includes('offer')) {
    suggestions.push({
      id: 'promo-urgency',
      title: 'Promotional Banner',
      description: 'Attention-grabbing promotional visual',
      prompt: `Promotional banner for ${description}, attention-grabbing design, bold colors, clear pricing or offer display, urgency indicators, sale graphics, marketing appeal`,
      style: 'Promotional Design',
      aspectRatio: '16:9 or 1:1',
      recommendedPlatforms: ['Twitter', 'Facebook', 'Instagram']
    });
  }

  suggestions.push({
    id: 'carousel-series',
    title: 'Carousel Series',
    description: 'Multi-image storytelling sequence',
    prompt: `Series of 3-5 images telling the story of ${description}, cohesive visual theme, progressive narrative, ${baseStyle}, unified color palette, carousel-optimized`,
    style: 'Multi-Image Series',
    aspectRatio: '1:1 (Instagram Carousel)',
    recommendedPlatforms: ['Instagram', 'LinkedIn']
  });

  return suggestions;
}

export function generatePostOutline(
  description: string,
  tone: string,
  brandProfile?: BrandProfile | null
): PostOutline {
  const brandName = brandProfile?.name || 'We';
  const targetAudience = brandProfile?.target_audience || 'our audience';

  const hooks: Record<string, string[]> = {
    professional: [
      `Industry insight: ${description}`,
      `Announcing a significant milestone...`,
      `What if you could transform the way you...`
    ],
    casual: [
      `You know what's exciting? ${description}`,
      `We've got news that'll make your day...`,
      `Real talk: ${description}`
    ],
    playful: [
      `Hold up! 🛑 ${description}`,
      `Plot twist incoming...`,
      `*Drumroll please* 🥁`
    ],
    inspirational: [
      `Imagine a world where...`,
      `Success isn't about perfection, it's about...`,
      `Every great achievement starts with...`
    ],
    educational: [
      `Here's what you need to know about...`,
      `3 things everyone should understand about...`,
      `The complete guide to...`
    ]
  };

  const selectedHooks = hooks[tone] || hooks.casual;
  const hook = selectedHooks[Math.floor(Math.random() * selectedHooks.length)];

  const ctaOptions = [
    'Learn more in our bio link',
    'Drop a 💙 if you agree',
    'Tag someone who needs to see this',
    'Share your thoughts in the comments',
    'Follow for more updates',
    'Visit our website to discover more',
    'DM us to get started'
  ];

  const cta = ctaOptions[Math.floor(Math.random() * ctaOptions.length)];

  const structure = [
    '1. Attention-grabbing hook',
    '2. Context or problem statement',
    '3. Main announcement or solution',
    '4. Key benefits or features (2-3 points)',
    '5. Social proof or credibility marker',
    '6. Clear call-to-action',
    '7. Relevant hashtags (8-10)'
  ];

  const timeRecommendations: Record<string, string> = {
    professional: 'Tuesday-Thursday, 9 AM - 11 AM or 1 PM - 3 PM',
    casual: 'Wednesday-Friday, 11 AM - 1 PM or 7 PM - 9 PM',
    playful: 'Any day, 12 PM - 3 PM or 7 PM - 10 PM',
    inspirational: 'Monday or Sunday, 6 AM - 9 AM',
    educational: 'Tuesday-Thursday, 10 AM - 12 PM'
  };

  return {
    hook,
    mainMessage: `${brandName} is ${description}. This represents our commitment to ${targetAudience}.`,
    callToAction: cta,
    structure,
    bestTimeToPost: timeRecommendations[tone] || timeRecommendations.casual
  };
}

export function getVideoOptimizationTips(platform: string): string[] {
  const tips: Record<string, string[]> = {
    instagram: [
      'Square (1:1) or Vertical (4:5) format performs best',
      'First 3 seconds are crucial - start with impact',
      'Keep videos under 60 seconds for feed posts',
      'Add captions - 85% watch without sound',
      'Use Stories for behind-the-scenes content (9:16)',
      'Reels should be 15-30 seconds for maximum engagement'
    ],
    twitter: [
      'Landscape (16:9) or Square (1:1) format recommended',
      'Maximum length: 2 minutes 20 seconds',
      'First frame should be compelling thumbnail',
      'Add captions for accessibility',
      'Keep file size under 512MB',
      'Native uploads perform better than YouTube links'
    ],
    linkedin: [
      'Landscape (16:9) format is standard',
      'Keep videos between 30 seconds and 3 minutes',
      'Add professional captions',
      'Start with text overlay introducing topic',
      'Include your brand logo/watermark',
      'Best performing: educational or thought leadership content'
    ],
    facebook: [
      'Square (1:1) format gets more engagement',
      'First 3 seconds determine if viewers continue',
      'Maximum recommended: 2-3 minutes',
      'Always add captions',
      'Upload natively (don\'t share from other platforms)',
      'Live videos get 6x more engagement'
    ]
  };

  return tips[platform.toLowerCase()] || tips.instagram;
}

export function generateImagePromptVariations(baseDescription: string, count: number = 4): string[] {
  const styles = [
    'photorealistic, high quality, detailed',
    'minimalist, clean design, modern aesthetic',
    'vibrant colors, energetic, dynamic composition',
    'soft lighting, dreamy atmosphere, ethereal',
    'bold contrast, dramatic lighting, cinematic',
    'flat design, vector art, illustrated style',
    'warm tones, cozy atmosphere, inviting',
    'futuristic, sci-fi aesthetic, tech-forward'
  ];

  const perspectives = [
    'from above (flat lay)',
    'eye-level perspective',
    'slightly elevated angle',
    'close-up detail shot',
    'wide environmental shot',
    'macro photography style'
  ];

  const variations: string[] = [];

  for (let i = 0; i < count; i++) {
    const style = styles[i % styles.length];
    const perspective = perspectives[i % perspectives.length];
    variations.push(`${baseDescription}, ${style}, ${perspective}, professional photography`);
  }

  return variations;
}
