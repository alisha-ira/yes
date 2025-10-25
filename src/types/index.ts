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

export interface BrandProfile {
  id: string;
  name: string;
  industry: string;
  tone: string;
  target_audience: string;
  key_values: string[];
  sample_posts: string[];
  color_scheme: {
    primary: string;
    secondary: string;
  };
}

export interface ResizedImages {
  instagram_square: string;
  instagram_portrait: string;
  twitter_post: string;
  linkedin_post: string;
}

export interface ContentHistory {
  id: string;
  description: string;
  formal_caption: string;
  casual_caption: string;
  funny_caption: string;
  hashtags: string[];
  image_url: string;
  resized_images: ResizedImages;
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  brand_profile_id: string | null;
  generated_content_id: string | null;
  title: string;
  caption: string;
  hashtags: string[];
  platforms: string[];
  image_url: string;
  scheduled_date: string;
  scheduled_time: string;
  timezone: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  notes: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
