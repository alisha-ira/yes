import type { BrandProfile } from '../types';

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

export function generateFormalCaption(companyName: string, productName: string, description: string, brandProfile?: BrandProfile | null, toneInfo?: { tone: string; emotion: string; keywords: string[] }, parsedInfo?: ParsedPromptInfo): string {
  const values = brandProfile?.key_values?.[0] || 'excellence and innovation';
  const cleanDesc = description.trim();

  let caption = '';

  if (parsedInfo?.location && parsedInfo?.date) {
    if (parsedInfo?.percentage) {
      caption = `${companyName} proudly presents ${productName}. ${cleanDesc} Join us in ${parsedInfo.location} on ${parsedInfo.date} and enjoy ${parsedInfo.percentage}% savings. This exclusive opportunity reflects our commitment to ${values}.`;
    } else if (parsedInfo?.price) {
      caption = `${companyName} is pleased to introduce ${productName}. ${cleanDesc} Available in ${parsedInfo.location} starting ${parsedInfo.date}, priced at $${parsedInfo.price}. Experience our dedication to ${values}.`;
    } else {
      caption = `${companyName} invites you to discover ${productName}. ${cleanDesc} Join us in ${parsedInfo.location} on ${parsedInfo.date}. This milestone represents our ongoing commitment to ${values}.`;
    }
  } else if (parsedInfo?.percentage) {
    if (toneInfo?.tone === 'urgent') {
      caption = `Important announcement from ${companyName}: ${productName} is now available with ${parsedInfo.percentage}% savings. ${cleanDesc} This limited opportunity reflects our dedication to providing exceptional value. We invite you to explore this offer today.`;
    } else {
      caption = `${companyName} is delighted to offer ${productName} with an exclusive ${parsedInfo.percentage}% discount. ${cleanDesc} This special promotion embodies our commitment to ${values} and our valued customers.`;
    }
  } else if (parsedInfo?.price) {
    caption = `${companyName} introduces ${productName}, thoughtfully priced at $${parsedInfo.price}. ${cleanDesc} This offering represents our dedication to delivering quality and ${values} to our community.`;
  } else if (toneInfo?.tone === 'celebratory') {
    caption = `${companyName} is thrilled to unveil ${productName}. ${cleanDesc} This achievement marks a significant milestone in our journey toward ${values}. Thank you for being part of our story.`;
  } else if (toneInfo?.tone === 'inspirational') {
    caption = `${companyName} presents ${productName}, designed to inspire. ${cleanDesc} We believe in the transformative power of ${values} to create meaningful impact in your life.`;
  } else {
    const templates = [
      `${companyName} is pleased to announce ${productName}. ${cleanDesc} This initiative embodies our steadfast commitment to ${values} and excellence.`,
      `Introducing ${productName} from ${companyName}. ${cleanDesc} We remain dedicated to ${values} and delivering exceptional experiences to our community.`,
      `${companyName} proudly presents ${productName}. ${cleanDesc} This development reflects our vision for ${values} and our commitment to innovation.`
    ];
    caption = templates[Math.floor(Math.random() * templates.length)];
  }

  return caption;
}

export function generateCasualCaption(companyName: string, productName: string, description: string, brandProfile?: BrandProfile | null, toneInfo?: { tone: string; emotion: string; keywords: string[] }, parsedInfo?: ParsedPromptInfo): string {
  const emojis = ['✨', '🎉', '🚀', '💫', '🔥', '⚡', '🌟'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const cleanDesc = description.trim();

  let caption = '';

  if (parsedInfo?.percentage && parsedInfo?.date) {
    caption = `Hey everyone! ${emoji} ${companyName} is dropping ${productName} with a HUGE ${parsedInfo.percentage}% discount! ${cleanDesc} This deal goes live on ${parsedInfo.date} - you don't want to miss this! Who's ready? 🙌`;
  } else if (parsedInfo?.percentage) {
    caption = `${emoji} Big news from ${companyName}! We're offering ${productName} at ${parsedInfo.percentage}% off! ${cleanDesc} This is seriously good - grab it while you can! 🔥`;
  } else if (parsedInfo?.location && parsedInfo?.date) {
    caption = `Exciting update! ${emoji} ${companyName} is bringing ${productName} to ${parsedInfo.location} on ${parsedInfo.date}! ${cleanDesc} Can't wait to see you all there! Who's coming? 📍`;
  } else if (toneInfo?.tone === 'enthusiastic') {
    caption = `${emoji} This is SO exciting! ${companyName} just launched ${productName}! ${cleanDesc} We've been working on this for ages and can't wait for you to try it! What do you think? 💭`;
  } else if (toneInfo?.tone === 'urgent') {
    caption = `⏰ Quick heads up! ${companyName}'s ${productName} is here! ${cleanDesc} Trust us, you don't want to miss out on this one. Let us know what you think! 🙌`;
  } else if (toneInfo?.tone === 'celebratory') {
    caption = `🎊 Celebration time! ${companyName} is thrilled to share ${productName} with you all! ${cleanDesc} This moment means everything to us. Drop a comment and let us know your thoughts! 💬`;
  } else {
    const templates = [
      `Hey friends! ${emoji} ${companyName} just dropped ${productName}! ${cleanDesc} We're super proud of this one and think you're gonna love it. What are your first thoughts? 💬`,
      `${emoji} Big reveal! Introducing ${productName} from ${companyName}! ${cleanDesc} This has been in the works and we're finally ready to share it with you! Tell us what you think! 🙌`,
      `Exciting news! ${emoji} ${companyName} is launching ${productName}! ${cleanDesc} Can't wait to hear what you all think about this! Share your feedback below! ✨`
    ];
    caption = templates[Math.floor(Math.random() * templates.length)];
  }

  return caption;
}

export function generateFunnyCaption(companyName: string, productName: string, description: string, brandProfile?: BrandProfile | null, toneInfo?: { tone: string; emotion: string; keywords: string[] }, parsedInfo?: ParsedPromptInfo): string {
  const cleanDesc = description.trim();

  let caption = '';

  if (parsedInfo?.percentage) {
    caption = `🚨 Alert! Alert! ${companyName} is literally giving away ${productName} at ${parsedInfo.percentage}% off! ${cleanDesc} (No, this isn't a drill, and yes, we're more excited than a kid in a candy store 🍭) Don't sleep on this one because we like you that much! 😎`;
  } else if (toneInfo?.tone === 'urgent') {
    caption = `⏰ BREAKING: ${companyName} just dropped ${productName} and the internet is about to lose its mind! ${cleanDesc} We're not saying it's going to change your life, but... okay yeah, we're totally saying that. Who's in? 🚀`;
  } else if (toneInfo?.tone === 'celebratory') {
    caption = `🎉 Hold the phone! ${companyName} is launching ${productName} and we're out here living our best life! ${cleanDesc} Join the party because FOMO is real and you don't want it. Who's ready to celebrate? 🥳`;
  } else {
    const templates = [
      `Plot twist nobody saw coming: ${companyName} just released ${productName}! ${cleanDesc} 🎬 We guarantee this is cooler than your favorite Netflix series. Ready to dive in?`,
      `Breaking news: ${companyName} introduces ${productName}! ${cleanDesc} 📢 (And nope, we didn't accidentally press send too early this time 😅) Actually super proud of this one! Who's in?`,
      `${companyName} presents ${productName}... because boring isn't in our vocabulary! ${cleanDesc} 🎪 We promise this is way more interesting than scrolling through your ex's vacation photos. Let's go! 🚀`
    ];
    caption = templates[Math.floor(Math.random() * templates.length)];
  }

  return caption;
}

export function generateCTAVariations(companyName: string, productName: string, description: string, brandProfile?: BrandProfile | null, parsedInfo?: ParsedPromptInfo) {
  const lowerDesc = description.toLowerCase();

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
    `DM ${companyName} to get started today! 💌`,
    'Tag a friend who would love this! 👥'
  ];

  const funnyCTAs = [
    `Slide into our DMs - we don't bite! 😁`,
    `Click the link before your coffee gets cold! ☕`,
    `Your future self will thank you for clicking that link! 🚀`,
    `Don't just scroll - double tap if you're in! ❤️`,
    `Tag that friend who needs this in their life ASAP! 🎯`
  ];

  if (lowerDesc.includes('buy') || lowerDesc.includes('purchase') || lowerDesc.includes('order')) {
    return {
      formal: 'Visit our website to place your order today.',
      casual: 'Grab yours now - link in bio! 🛒',
      funny: `Your cart is empty and sad. Let's fix that! 🛍️`
    };
  } else if (lowerDesc.includes('event') || lowerDesc.includes('webinar') || lowerDesc.includes('workshop')) {
    return {
      formal: 'Register for this event through the link provided.',
      casual: 'Save your spot - link in bio! 🎟️',
      funny: `RSVP before all the cool kids take the spots! 🎉`
    };
  } else if (lowerDesc.includes('launch') || lowerDesc.includes('release') || lowerDesc.includes('announcing')) {
    return {
      formal: 'Be among the first to experience this innovation.',
      casual: 'Get early access - link in bio! ✨',
      funny: `Join the hype train before it leaves the station! 🚂`
    };
  }

  return {
    formal: formalCTAs[Math.floor(Math.random() * formalCTAs.length)],
    casual: casualCTAs[Math.floor(Math.random() * casualCTAs.length)],
    funny: funnyCTAs[Math.floor(Math.random() * funnyCTAs.length)]
  };
}
