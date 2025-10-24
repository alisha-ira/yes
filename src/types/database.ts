export interface Database {
  public: {
    Tables: {
      brand_profiles: {
        Row: {
          id: string;
          user_id: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          industry?: string;
          tone?: string;
          target_audience?: string;
          key_values?: string[];
          sample_posts?: string[];
          color_scheme?: {
            primary: string;
            secondary: string;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          industry?: string;
          tone?: string;
          target_audience?: string;
          key_values?: string[];
          sample_posts?: string[];
          color_scheme?: {
            primary: string;
            secondary: string;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      generated_content: {
        Row: {
          id: string;
          brand_profile_id: string | null;
          user_id: string;
          description: string;
          formal_caption: string;
          casual_caption: string;
          funny_caption: string;
          hashtags: string[];
          image_url: string;
          resized_images: Record<string, string>;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_profile_id?: string | null;
          user_id: string;
          description: string;
          formal_caption: string;
          casual_caption: string;
          funny_caption: string;
          hashtags?: string[];
          image_url?: string;
          resized_images?: Record<string, string>;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand_profile_id?: string | null;
          user_id?: string;
          description?: string;
          formal_caption?: string;
          casual_caption?: string;
          funny_caption?: string;
          hashtags?: string[];
          image_url?: string;
          resized_images?: Record<string, string>;
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
      content_templates: {
        Row: {
          id: string;
          brand_profile_id: string | null;
          user_id: string;
          name: string;
          description: string;
          template_type: string;
          caption_template: string;
          hashtag_groups: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_profile_id?: string | null;
          user_id: string;
          name: string;
          description?: string;
          template_type?: string;
          caption_template: string;
          hashtag_groups?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brand_profile_id?: string | null;
          user_id?: string;
          name?: string;
          description?: string;
          template_type?: string;
          caption_template?: string;
          hashtag_groups?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
