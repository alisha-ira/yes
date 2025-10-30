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
  posting_frequency?: string;
  posting_days?: string[];
  posting_times?: string[];
  content_themes?: string[];
  planning_preferences?: Record<string, any>;
}

export interface ContentPlan {
  id: string;
  user_id: string;
  brand_profile_id: string | null;
  plan_name: string;
  start_date: string;
  end_date: string;
  frequency: string;
  total_posts: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlannedPost {
  id: string;
  content_plan_id: string;
  user_id: string;
  title: string;
  suggested_date: string;
  suggested_time: string;
  rationale: string;
  content_generated: boolean;
  caption: string;
  hashtags: string[];
  platforms: string[];
  image_url: string;
  status: 'suggested' | 'approved' | 'generated' | 'scheduled' | 'posted';
  order_in_plan: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
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

export interface Alarm {
  id: string;
  user_id: string;
  title: string;
  alarm_datetime: string;
  scheduled_post_id: string | null;
  planned_post_id: string | null;
  status: 'active' | 'triggered' | 'dismissed';
  sound_enabled: boolean;
  notification_enabled: boolean;
  notes: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
