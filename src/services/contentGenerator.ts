import type { GeneratedContent, BrandProfile } from '../types';

export async function generateContent(
  description: string,
  brandProfile?: BrandProfile | null
): Promise<GeneratedContent> {
  const validationError = validateInput(description);
  if (validationError) {
    throw new Error(validationError);
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  const parsedInfo = parsePrompt(description);
  const tone = detectToneAndEmotion(description);
  const keywords = extractKeywords(description);
  const hashtags = generateHashtags(keywords, description, brandProfile, parsedInfo);

  return {
    formal: generateFormalCaption(description, brandProfile, tone, parsedInfo),
    casual: generateCasualCaption(description, brandProfile, tone, parsedInfo),
    funny: generateFunnyCaption(description, brandProfile, tone, parsedInfo),
    hashtags,
    ctaVariations: generateCTAVariations(description, brandProfile, parsedInfo)
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

function generateFormalCaption(description: string, brandProfile?: BrandProfile | null, toneInfo?: { tone: string; emotion: string; keywords: string[] }, parsedInfo?: ParsedPromptInfo): string {
  const brandName = parsedInfo?.brandName || brandProfile?.name || 'We';
  const values = brandProfile?.key_values?.[0] || 'excellence and innovation';

  let cleanDesc = description.trim();
  const descCapitalized = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);

  let mainContent = descCapitalized;

  if (parsedInfo?.productName) {
    mainContent = `${parsedInfo.productName} - ${descCapitalized}`;
  } else if (parsedInfo?.eventName) {
    mainContent = `${parsedInfo.eventName} - ${descCapitalized}`;
  }

  if (parsedInfo?.location && parsedInfo?.date) {
    mainContent += ` Join us in ${parsedInfo.location} on ${parsedInfo.date}.`;
  } else if (parsedInfo?.location) {
    mainContent += ` Available in ${parsedInfo.location}.`;
  } else if (parsedInfo?.date) {
    mainContent += ` Mark your calendar for ${parsedInfo.date}.`;
  }

  if (parsedInfo?.price) {
    mainContent += ` Priced at $${parsedInfo.price}.`;
  } else if (parsedInfo?.percentage) {
    mainContent += ` Save ${parsedInfo.percentage}% on this exclusive offer.`;
  }

  if (toneInfo?.tone === 'urgent') {
    return `${brandName} presents an important update: ${mainContent} This timely initiative reflects our dedication to ${values}. We invite you to explore this opportunity.`;
  } else if (toneInfo?.tone === 'celebratory') {
    return `${brandName} is delighted to share: ${mainContent} This milestone represents our ongoing commitment to ${values}. Thank you for being part of our journey.`;
  } else if (toneInfo?.tone === 'inspirational') {
    return `${mainContent} At ${brandName}, we believe in the power of ${values} to create meaningful change. Join us in making a difference.`;
  }

  const templates = [
    `${brandName} is pleased to announce: ${mainContent} This initiative embodies our commitment to ${values} and reflects our vision for the future.`,
    `We are proud to introduce: ${mainContent} This development represents ${brandName}'s dedication to delivering exceptional value and maintaining the highest standards.`,
    `${mainContent} ${brandName} continues to prioritize ${values}, ensuring that we meet the evolving needs of our valued community.`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

function generateCasualCaption(description: string, brandProfile?: BrandProfile | null, toneInfo?: { tone: string; emotion: string; keywords: string[] }, parsedInfo?: ParsedPromptInfo): string {
  const emojis = ['✨', '🎉', '🚀', '💫', '🔥', '⚡', '��'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  let cleanDesc = description.trim();
  let descFormatted = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);

  if (parsedInfo?.productName) {
    descFormatted = `Check out ${parsedInfo.productName}! ${descFormatted}`;
  } else if (parsedInfo?.eventName) {
    descFormatted = `${parsedInfo.eventName} is happening! ${descFormatted}`;
  }

  if (parsedInfo?.percentage) {
    descFormatted += ` ${parsedInfo.percentage}% off right now! 🔥`;
  } else if (parsedInfo?.price) {
    descFormatted += ` Only $${parsedInfo.price}! 💰`;
  }

  if (parsedInfo?.date && parsedInfo?.location) {
    descFormatted += ` See you in ${parsedInfo.location} on ${parsedInfo.date}! 📍`;
  }

  if (toneInfo?.tone === 'enthusiastic') {
    return `${emoji} This is SO exciting! ${descFormatted} We've been working hard on this and can't wait for you to experience it! What are your thoughts? 💭`;
  } else if (toneInfo?.tone === 'urgent') {
    return `⏰ Quick heads up! ${descFormatted} Don't miss out on this - it's something special! Let us know what you think! 🙌`;
  } else if (toneInfo?.tone === 'celebratory') {
    return `🎊 Celebration time! ${descFormatted} We're so grateful for this moment and excited to share it with all of you! Drop a comment below! 💬`;
  }

  const templates = [
    `Hey everyone! ${emoji} ${descFormatted} This is something we're really proud of. Would love to hear your thoughts! 💬`,
    `${emoji} Big news! ${descFormatted} We've been working on this and think you're going to love it! Let us know what you think! 🙌`,
    `Exciting update! ${emoji} ${descFormatted} Can't wait to see what you all think about this! Share your feedback below! ✨`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

function generateFunnyCaption(description: string, brandProfile?: BrandProfile | null, toneInfo?: { tone: string; emotion: string; keywords: string[] }, parsedInfo?: ParsedPromptInfo): string {
  const brandName = parsedInfo?.brandName || brandProfile?.name || 'We';

  let cleanDesc = description.trim();
  let descFormatted = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);

  if (parsedInfo?.productName) {
    descFormatted = `Introducing ${parsedInfo.productName} - ${descFormatted}`;
  } else if (parsedInfo?.eventName) {
    descFormatted = `${parsedInfo.eventName} alert! ${descFormatted}`;
  }

  if (parsedInfo?.percentage) {
    descFormatted += ` ${parsedInfo.percentage}% off because we like you that much! 😎`;
  }

  if (toneInfo?.tone === 'urgent') {
    return `🚨 Alert! Alert! ${descFormatted} (No, this isn't a drill, and yes, we're more excited than a kid in a candy store 🍭) Don't sleep on this one!`;
  } else if (toneInfo?.tone === 'celebratory') {
    return `🎉 Hold the phone! ${descFormatted} ${brandName} is out here living our best life, and we want you to join the party! Who's ready to celebrate? 🥳`;
  }

  const templates = [
    `Plot twist nobody saw coming: ${descFormatted} 🎬 ${brandName} guarantees this is cooler than your favorite Netflix series. Ready to dive in?`,
    `Breaking: ${descFormatted} 📢 (And nope, we didn't accidentally press send too early this time 😅) Actually super proud of this one! Who's in?`,
    `${descFormatted} ...because ${brandName} doesn't do boring! 🎪 We promise this is more interesting than scrolling through your ex's vacation photos. Let's go! 🚀`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

function generateCTAVariations(description: string, brandProfile?: BrandProfile | null, parsedInfo?: ParsedPromptInfo) {
  const lowerDesc = description.toLowerCase();
  const brandName = parsedInfo?.brandName || brandProfile?.name || 'us';

  const formalCTAs = [
    'Visit our website to learn more about this initiative.',
    'Connect with our team to discover how this can benefit you.',
    'Register your interest through the link in our bio.',
    'Schedule a consultation to explore this opportunity.',
    'Download our comprehensive guide for detailed insights.'
  ];

  const casualCTAs = [
    'Check out the link in bio to learn more! 🔗',
    'Drop a comment and let us know what you think! 💬',
    'Share this with someone who needs to see it! 📲',
    'Follow for more updates coming soon! ✨',
    `DM ${brandName} to get started today! 💌`,
    'Tag a friend who would love this! 👥'
  ];

  const funnyCTAs = [
    `Slide into our DMs - we don't bite! 😁`,
    `Click the link before your coffee gets cold! ☕`,
    `Your future self will thank you for clicking that link! 🚀`,
    `Don't just scroll - double tap if you're in! ❤️`,
    `Tag that friend who needs this in their life ASAP! 🎯`
  ];

  let selectedFormal = formalCTAs[0];
  let selectedCasual = casualCTAs[0];
  let selectedFunny = funnyCTAs[0];

  if (lowerDesc.includes('sale') || lowerDesc.includes('discount')) {
    selectedFormal = 'Take advantage of this limited-time offer through our website.';
    selectedCasual = 'Grab this deal before it\'s gone! Link in bio 🔥';
    selectedFunny = 'Your wallet called - it wants you to check this out! 💸';
  } else if (lowerDesc.includes('launch') || lowerDesc.includes('new')) {
    selectedFormal = 'Be among the first to experience this innovation.';
    selectedCasual = 'Get early access through our link! 🚀';
    selectedFunny = 'Don\'t be the last one to the party! Click that link! 🎉';
  } else if (lowerDesc.includes('learn') || lowerDesc.includes('guide') || lowerDesc.includes('how')) {
    selectedFormal = 'Access our comprehensive resources through the link provided.';
    selectedCasual = 'Learn more in our latest guide - link in bio! 📚';
    selectedFunny = 'Level up your knowledge - click here! 🧠';
  }

  return {
    formal: selectedFormal,
    casual: selectedCasual,
    funny: selectedFunny
  };
}
