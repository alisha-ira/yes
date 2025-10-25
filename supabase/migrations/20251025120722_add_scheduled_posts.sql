/*
  # Add Scheduled Posts Feature

  ## Overview
  This migration adds scheduling functionality for social media posts, allowing users to plan and schedule their content for future publication.

  ## New Tables
  
  ### `scheduled_posts`
  Stores scheduled social media posts with platform and timing information
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `brand_profile_id` (uuid, foreign key) - Links to brand_profiles
  - `generated_content_id` (uuid, foreign key) - Links to generated_content
  - `title` (text) - Post title/description
  - `caption` (text) - Selected caption for the post
  - `hashtags` (text[]) - Hashtags for the post
  - `platforms` (text[]) - Target platforms (instagram, twitter, linkedin, facebook)
  - `image_url` (text) - Image URL if available
  - `scheduled_date` (date) - Date when post should be published
  - `scheduled_time` (time) - Time when post should be published
  - `timezone` (text) - User's timezone
  - `status` (text) - Status: draft, scheduled, published, failed
  - `notes` (text) - Optional notes for the post
  - `metadata` (jsonb) - Additional metadata
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on scheduled_posts table
  - Users can only access their own scheduled posts
  - All policies check authentication and ownership
*/

-- Create scheduled_posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_profile_id uuid REFERENCES brand_profiles(id) ON DELETE SET NULL,
  generated_content_id uuid REFERENCES generated_content(id) ON DELETE SET NULL,
  title text NOT NULL,
  caption text NOT NULL,
  hashtags text[] DEFAULT '{}',
  platforms text[] DEFAULT '{}',
  image_url text DEFAULT '',
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  timezone text DEFAULT 'UTC',
  status text DEFAULT 'draft',
  notes text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Policies for scheduled_posts
CREATE POLICY "Users can view own scheduled posts"
  ON scheduled_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled posts"
  ON scheduled_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled posts"
  ON scheduled_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled posts"
  ON scheduled_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_date ON scheduled_posts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_date ON scheduled_posts(user_id, scheduled_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scheduled_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_scheduled_posts_updated_at_trigger ON scheduled_posts;
CREATE TRIGGER update_scheduled_posts_updated_at_trigger
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_posts_updated_at();
