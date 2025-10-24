export interface GeneratedContent {
  formal: string;
  casual: string;
  funny: string;
  hashtags: string[];
}

export type ToneType = 'formal' | 'casual' | 'funny';

export interface PlatformPreview {
  platform: 'instagram' | 'twitter' | 'linkedin';
  caption: string;
  hashtags: string[];
}
