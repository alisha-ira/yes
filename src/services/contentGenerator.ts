import type { GeneratedContent, BrandProfile } from '../types';
import { generateFormalCaption, generateCasualCaption, generateFunnyCaption, generateCTAVariations } from './captionGenerators';

interface ContentInput {
  companyName?: string;
  productName?: string;
  description: string;
}

export async function generateContent(
  input: string | ContentInput,
  brandProfile?: BrandProfile | null
): Promise<GeneratedContent> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  let parsedInfo: ParsedPromptInfo;
  let description: string;
  let companyName: string;
  let productName: string;

  if (typeof input === 'string') {
    parsedInfo = parsePrompt(input);
    description = input;
    companyName = parsedInfo.brandName || brandProfile?.name || 'We';
    productName = parsedInfo.productName || '';
  } else {
    companyName = input.companyName || brandProfile?.name || 'We';
    productName = input.productName || '';
    description = input.description;
    parsedInfo = parsePrompt(input.description);
    parsedInfo.brandName = companyName;
    parsedInfo.productName = productName;
  }

  const tone = detectToneAndEmotion(description);
  const keywords = extractKeywords(description);
  const hashtags = generateHashtags(keywords, description, brandProfile, parsedInfo);

  return {
    formal: generateFormalCaption(companyName, productName, description, brandProfile, tone, parsedInfo),
    casual: generateCasualCaption(companyName, productName, description, brandProfile, tone, parsedInfo),
    funny: generateFunnyCaption(companyName, productName, description, brandProfile, tone, parsedInfo),
    hashtags,
    ctaVariations: generateCTAVariations(companyName, productName, description, brandProfile, parsedInfo)
  };
}

interface ParsedPromptInfo {
  brandName?: string;
  productName?: string;
  eventName?: string;
  location?: string;
  date?: string;
  price?: string;
  percentage?: string;
  features?: string[];
  benefits?: string[];
}

function parsePrompt(description: string): ParsedPromptInfo {
  const info: ParsedPromptInfo = {
    features: [],
    benefits: []
  };

  const brandPatterns = [
    /brand\s+(?:name\s+)?(?:is\s+)?:?\s*([A-Z][a-zA-Z0-9\s&'-]+?)(?:\s+(?:is|has|offers|provides|announces|launches|presents)|[,.]|$)/i,
    /(?:for|by|from|at)\s+([A-Z][a-zA-Z0-9\s&'-]{2,}?)(?:\s+(?:is|has|offers|provides|announces|launches|presents)|[,.]|$)/,
    /^([A-Z][a-zA-Z0-9\s&'-]{2,}?)\s+(?:is|has|offers|provides|announces|launches|presents)/,
  ];

  for (const pattern of brandPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      info.brandName = match[1].trim();
      break;
    }
  }

  const productPatterns = [
    /product\s+(?:name\s+)?(?:is\s+)?:?\s*([A-Z][a-zA-Z0-9\s-]+?)(?:\s+(?:is|has|offers|provides)|[,.]|$)/i,
    /(?:new|latest|introducing)\s+([A-Z][a-zA-Z0-9\s-]{2,}?)(?:\s+(?:is|has|offers|provides)|[,.]|$)/i,
    /(?:called|named)\s+([A-Z][a-zA-Z0-9\s-]+?)(?:\s+(?:is|has|offers|provides)|[,.]|$)/i,
  ];

  for (const pattern of productPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      info.productName = match[1].trim();
      break;
    }
  }

  const eventPatterns = [
    /event\s+(?:name\s+)?(?:is\s+)?:?\s*([A-Z][a-zA-Z0-9\s-]+?)(?:\s+(?:on|at|is)|[,.]|$)/i,
    /(?:hosting|organizing|presenting)\s+([A-Z][a-zA-Z0-9\s-]{3,}?)(?:\s+(?:on|at|is)|[,.]|$)/i,
  ];

  for (const pattern of eventPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      info.eventName = match[1].trim();
      break;
    }
  }

  const locationMatch = description.match(/(?:location|at|in)\s+(?:is\s+)?:?\s*([A-Z][a-zA-Z\s,]+?)(?:\s+on|[,.]|$)/i);
  if (locationMatch) {
    info.location = locationMatch[1].trim();
  }

  const dateMatch = description.match(/(?:on|date)\s+(?:is\s+)?:?\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (dateMatch) {
    info.date = dateMatch[1].trim();
  }

  const priceMatch = description.match(/(?:price|costs?|priced at)\s+(?:is\s+)?:?\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
  if (priceMatch) {
    info.price = priceMatch[1];
  }

  const percentMatch = description.match(/(\d+)%\s*(?:off|discount|savings?)/i);
  if (percentMatch) {
    info.percentage = percentMatch[1];
  }

  const featurePatterns = [
    /features?\s+(?:include|are|is)?:?\s*([^.]+)/i,
    /(?:includes?|comes with|equipped with)\s+([^.]+)/i,
  ];

  for (const pattern of featurePatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      const features = match[1].split(/,|and/).map(f => f.trim()).filter(f => f.length > 0);
      info.features = features.slice(0, 3);
      break;
    }
  }

  const benefitPatterns = [
    /benefits?\s+(?:include|are)?:?\s*([^.]+)/i,
    /(?:helps?|allows?|enables?)\s+(?:you\s+)?(?:to\s+)?([^.]+)/i,
  ];

  for (const pattern of benefitPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      const benefits = match[1].split(/,|and/).map(b => b.trim()).filter(b => b.length > 0);
      info.benefits = benefits.slice(0, 3);
      break;
    }
  }

  return info;
}

function validateInput(description: string): string | null {
  const trimmed = description.trim();

  if (trimmed.length === 0) {
    return 'Your input seems unclear or invalid. Please provide a meaningful topic, idea, or sentence.';
  }

  if (trimmed.length < 5) {
    return 'Your input seems unclear or invalid. Please provide a meaningful topic, idea, or sentence.';
  }

  const spamPatterns = [
    /^(.)\1{10,}$/,
    /^[^a-zA-Z0-9\s]{20,}$/,
    /^(test|asdf|qwerty|12345)+$/i,
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(trimmed)) {
      return 'Your input seems unclear or invalid. Please provide a meaningful topic, idea, or sentence.';
    }
  }

  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) {
    return 'Your input seems unclear or invalid. Please provide a meaningful topic, idea, or sentence.';
  }

  const meaningfulWords = words.filter(w => /[a-zA-Z0-9]/.test(w));
  if (meaningfulWords.length === 0) {
    return 'Your input seems unclear or invalid. Please provide a meaningful topic, idea, or sentence.';
  }

  if (words.length === 1 && words[0].length < 3) {
    return 'Your input seems unclear or invalid. Please provide a meaningful topic, idea, or sentence.';
  }

  return null;
}

function detectToneAndEmotion(text: string): { tone: string; emotion: string; keywords: string[] } {
  const lowerText = text.toLowerCase();

  const excitingWords = ['excited', 'amazing', 'awesome', 'incredible', 'fantastic', 'thrilled', 'launch', 'new', 'announce'];
  const professionalWords = ['professional', 'business', 'corporate', 'enterprise', 'industry', 'solution', 'service'];
  const urgentWords = ['urgent', 'limited', 'hurry', 'now', 'today', 'sale', 'deal', 'discount'];
  const inspirationalWords = ['inspire', 'motivate', 'empower', 'transform', 'change', 'dream', 'achieve'];
  const celebratoryWords = ['celebrate', 'milestone', 'achievement', 'success', 'proud', 'congratulations'];

  let tone = 'neutral';
  let emotion = 'informative';
  const detectedKeywords: string[] = [];

  if (excitingWords.some(word => lowerText.includes(word))) {
    tone = 'enthusiastic';
    emotion = 'excited';
    detectedKeywords.push('exciting');
  }

  if (professionalWords.some(word => lowerText.includes(word))) {
    tone = 'professional';
    emotion = 'confident';
    detectedKeywords.push('professional');
  }

  if (urgentWords.some(word => lowerText.includes(word))) {
    tone = 'urgent';
    emotion = 'compelling';
    detectedKeywords.push('urgent');
  }

  if (inspirationalWords.some(word => lowerText.includes(word))) {
    tone = 'inspirational';
    emotion = 'uplifting';
    detectedKeywords.push('inspiring');
  }

  if (celebratoryWords.some(word => lowerText.includes(word))) {
    tone = 'celebratory';
    emotion = 'joyful';
    detectedKeywords.push('celebration');
  }

  return { tone, emotion, keywords: detectedKeywords };
}

function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'our', 'new',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  return [...new Set(words)].slice(0, 8);
}

function generateHashtags(keywords: string[], description: string, brandProfile?: BrandProfile | null, parsedInfo?: ParsedPromptInfo): string[] {
  const genericTags = new Set(['#fun', '#nice', '#amazing', '#good', '#great', '#cool', '#awesome', '#best']);
  const hashtags: string[] = [];

  if (parsedInfo?.brandName) {
    const brandTag = parsedInfo.brandName.replace(/\s+/g, '');
    if (brandTag.length > 2) {
      hashtags.push(`#${brandTag}`);
    }
  }

  if (parsedInfo?.productName) {
    const productTag = parsedInfo.productName.replace(/\s+/g, '');
    if (productTag.length > 2) {
      hashtags.push(`#${productTag}`);
    }
  }

  if (parsedInfo?.eventName) {
    const eventTag = parsedInfo.eventName.replace(/\s+/g, '');
    if (eventTag.length > 2) {
      hashtags.push(`#${eventTag}`);
    }
  }

  keywords.forEach(word => {
    if (word.length > 3) {
      const tag = `#${word.charAt(0).toUpperCase() + word.slice(1)}`;
      if (!genericTags.has(tag.toLowerCase())) {
        hashtags.push(tag);
      }
    }
  });

  const lowerDesc = description.toLowerCase();
  const contextHashtags: string[] = [];

  if (brandProfile?.industry) {
    const industryTag = brandProfile.industry.replace(/\s+/g, '');
    if (industryTag.length > 3) {
      contextHashtags.push(`#${industryTag.charAt(0).toUpperCase() + industryTag.slice(1)}`);
    }
  }

  if (brandProfile?.key_values && brandProfile.key_values.length > 0) {
    brandProfile.key_values.slice(0, 2).forEach(value => {
      const tag = value.replace(/\s+/g, '');
      if (tag.length > 3) {
        contextHashtags.push(`#${tag.charAt(0).toUpperCase() + tag.slice(1)}`);
      }
    });
  }

  if (lowerDesc.includes('launch') || lowerDesc.includes('introducing')) {
    contextHashtags.push('#ProductLaunch', '#NewRelease');
  } else if (lowerDesc.includes('eco') || lowerDesc.includes('sustainable') || lowerDesc.includes('environment')) {
    contextHashtags.push('#Sustainability', '#EcoFriendly');
  } else if (lowerDesc.includes('tech') || lowerDesc.includes('innovation') || lowerDesc.includes('digital')) {
    contextHashtags.push('#Innovation', '#Technology');
  } else if (lowerDesc.includes('health') || lowerDesc.includes('wellness') || lowerDesc.includes('fitness')) {
    contextHashtags.push('#HealthyLiving', '#Wellness');
  } else if (lowerDesc.includes('food') || lowerDesc.includes('recipe') || lowerDesc.includes('cooking')) {
    contextHashtags.push('#Foodie', '#Culinary');
  } else if (lowerDesc.includes('travel') || lowerDesc.includes('adventure') || lowerDesc.includes('explore')) {
    contextHashtags.push('#TravelGoals', '#Wanderlust');
  } else if (lowerDesc.includes('art') || lowerDesc.includes('design') || lowerDesc.includes('creative')) {
    contextHashtags.push('#CreativeDesign', '#ArtisticVision');
  } else if (lowerDesc.includes('business') || lowerDesc.includes('entrepreneur')) {
    contextHashtags.push('#BusinessGrowth', '#Entrepreneurship');
  }

  const allHashtags = [...hashtags, ...contextHashtags];
  const uniqueHashtags = [...new Set(allHashtags)].filter(tag => !genericTags.has(tag.toLowerCase()));

  return uniqueHashtags.slice(0, 10);
}
