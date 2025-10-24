export interface GeneratedContent {
  formal: string;
  casual: string;
  funny: string;
  hashtags: string[];
  ctaVariations?: {
    formal: string;
    casual: string;
    funny: string;
  };
}

export type ToneType = 'formal' | 'casual' | 'funny';

export interface PlatformPreview {
  platform: 'instagram' | 'twitter' | 'linkedin';
  caption: string;
  hashtags: string[];
}
