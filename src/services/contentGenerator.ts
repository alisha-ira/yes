import type { GeneratedContent, BrandProfile } from '../types';

export async function generateContent(
  description: string,
  brandProfile?: BrandProfile | null
): Promise<GeneratedContent> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const keywords = extractKeywords(description);
  const hashtags = generateHashtags(keywords, description, brandProfile);

  return {
    formal: generateFormalCaption(description, brandProfile),
    casual: generateCasualCaption(description, brandProfile),
    funny: generateFunnyCaption(description, brandProfile),
    hashtags,
    ctaVariations: generateCTAVariations(description, brandProfile)
  };
}

function extractKeywords(text: string): string[] {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'our', 'new']);
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  return [...new Set(words)].slice(0, 5);
}

function generateHashtags(keywords: string[], description: string, brandProfile?: BrandProfile | null): string[] {
  const baseHashtags = keywords.map(word => `#${word.charAt(0).toUpperCase() + word.slice(1)}`);

  const contextHashtags: string[] = [];
  const lowerDesc = description.toLowerCase();

  if (brandProfile?.key_values) {
    brandProfile.key_values.forEach(value => {
      const tag = value.replace(/\s+/g, '');
      contextHashtags.push(`#${tag.charAt(0).toUpperCase() + tag.slice(1)}`);
    });
  }

  if (brandProfile?.industry) {
    const industryTag = brandProfile.industry.replace(/\s+/g, '');
    if (industryTag) {
      contextHashtags.push(`#${industryTag.charAt(0).toUpperCase() + industryTag.slice(1)}`);
    }
  }

  if (lowerDesc.includes('launch') || lowerDesc.includes('new')) {
    contextHashtags.push('#NewRelease', '#LaunchDay');
  }
  if (lowerDesc.includes('eco') || lowerDesc.includes('sustainable') || lowerDesc.includes('green')) {
    contextHashtags.push('#Sustainable', '#EcoFriendly', '#GoGreen');
  }
  if (lowerDesc.includes('sale') || lowerDesc.includes('discount')) {
    contextHashtags.push('#Sale', '#Deals', '#Shopping');
  }
  if (lowerDesc.includes('tech') || lowerDesc.includes('innovation')) {
    contextHashtags.push('#Innovation', '#TechNews');
  }

  contextHashtags.push('#Marketing', '#Business', '#BrandStory');

  const allHashtags = [...baseHashtags, ...contextHashtags];
  return [...new Set(allHashtags)].slice(0, 10);
}

function generateFormalCaption(description: string, brandProfile?: BrandProfile | null): string {
  const brandName = brandProfile?.name || 'We';
  const values = brandProfile?.key_values?.[0] || 'excellence and innovation';

  const templates = [
    `${brandName} is pleased to announce: ${description} This represents our continued commitment to ${values}. Join us on this exciting journey.`,
    `Introducing our latest initiative: ${description} We believe this will set new standards in the industry. Learn more about our vision.`,
    `${description} We're proud to share this milestone with our community. Thank you for your continued support and trust in ${brandName}.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateCasualCaption(description: string, brandProfile?: BrandProfile | null): string {
  const emojis = ['✨', '🎉', '🚀', '💫', '🔥', '⚡'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const audience = brandProfile?.target_audience ? 'friends' : 'everyone';

  const templates = [
    `Hey ${audience}! ${emoji} ${description} We can't wait for you to check it out! What do you think? 💭`,
    `Exciting news! ${emoji} ${description} This is something we've been working on and we're so pumped to share it with you! 🙌`,
    `${emoji} Guess what? ${description} Drop a comment and let us know your thoughts! We'd love to hear from you! 💬`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateFunnyCaption(description: string, brandProfile?: BrandProfile | null): string {
  const brandName = brandProfile?.name || 'We';

  const templates = [
    `Plot twist: ${description} 🎬 ${brandName} promises this is better than your ex's apology text. 😂 Who's ready?`,
    `Breaking news! 📢 ${description} (Yes, we're more excited than a dog seeing a squirrel 🐿️) Ready to join the fun?`,
    `${description} ...and no, we didn't spill coffee on the keyboard this time! ☕😅 Actually proud of this one! Who's in?`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateCTAVariations(description: string, brandProfile?: BrandProfile | null) {
  const lowerDesc = description.toLowerCase();
  const brandName = brandProfile?.name || 'us';

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
