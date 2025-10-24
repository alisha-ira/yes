import type { GeneratedContent } from '../types';

export async function generateContent(description: string): Promise<GeneratedContent> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const keywords = extractKeywords(description);
  const hashtags = generateHashtags(keywords, description);

  return {
    formal: generateFormalCaption(description),
    casual: generateCasualCaption(description),
    funny: generateFunnyCaption(description),
    hashtags
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

function generateHashtags(keywords: string[], description: string): string[] {
  const baseHashtags = keywords.map(word => `#${word.charAt(0).toUpperCase() + word.slice(1)}`);

  const contextHashtags: string[] = [];
  const lowerDesc = description.toLowerCase();

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

function generateFormalCaption(description: string): string {
  const templates = [
    `We are pleased to announce: ${description} This represents our continued commitment to excellence and innovation. Join us on this exciting journey.`,
    `Introducing our latest initiative: ${description} We believe this will set new standards in the industry. Learn more about our vision.`,
    `${description} We're proud to share this milestone with our community. Thank you for your continued support and trust.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateCasualCaption(description: string): string {
  const emojis = ['✨', '🎉', '🚀', '💫', '🔥', '⚡'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  const templates = [
    `Hey everyone! ${emoji} ${description} We can't wait for you to check it out! What do you think? 💭`,
    `Exciting news! ${emoji} ${description} This is something we've been working on and we're so pumped to share it with you! 🙌`,
    `${emoji} Guess what? ${description} Drop a comment and let us know your thoughts! We'd love to hear from you! 💬`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateFunnyCaption(description: string): string {
  const templates = [
    `Plot twist: ${description} 🎬 We promise this is better than your ex's apology text. 😂 Who's ready?`,
    `Breaking news! 📢 ${description} (Yes, we're more excited than a dog seeing a squirrel 🐿️) Ready to join the fun?`,
    `${description} ...and no, we didn't spill coffee on the keyboard this time! ☕😅 Actually proud of this one! Who's in?`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}
