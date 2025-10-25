/*
  # Add Content Planning Features

  ## Overview
  This migration adds content planning functionality, allowing users to set posting preferences
  and generate automated content schedules.

  ## Table Modifications
  
  ### `brand_profiles`
  Add content planning preferences
  - `posting_frequency` (text) - How often to post: daily, 3x_week, 2x_week, weekly, custom
  - `posting_days` (text[]) - Preferred days of week: monday, tuesday, etc.
  - `posting_times` (text[]) - Preferred posting times: morning, afternoon, evening, or specific times
  - `content_themes` (text[]) - Recurring content themes/topics
  - `planning_preferences` (jsonb) - Additional planning settings

  ## New Tables

  ### `content_plans`
  Stores generated content plans with multiple posts
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `brand_profile_id` (uuid, foreign key) - Links to brand_profiles
  - `plan_name` (text) - Name of the content plan
  - `start_date` (date) - Plan start date
  - `end_date` (date) - Plan end date
  - `frequency` (text) - Posting frequency for this plan
  - `total_posts` (integer) - Number of posts in plan
  - `status` (text) - Status: draft, active, completed, archived
  - `metadata` (jsonb) - Additional plan metadata
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `planned_posts`
  Individual posts within a content plan
  - `id` (uuid, primary key) - Unique identifier
  - `content_plan_id` (uuid, foreign key) - Links to content_plans
  - `user_id` (uuid, foreign key) - Links to auth.users
  - `title` (text) - Post title/topic
  - `suggested_date` (date) - AI-suggested posting date
  - `suggested_time` (time) - AI-suggested posting time
  - `rationale` (text) - Why this date/time was suggested
  - `content_generated` (boolean) - Whether content has been generated
  - `caption` (text) - Generated caption (if any)
  - `hashtags` (text[]) - Generated hashtags
  - `platforms` (text[]) - Target platforms
  - `image_url` (text) - Image URL if available
  - `status` (text) - Status: suggested, approved, generated, scheduled, posted
  - `order_in_plan` (integer) - Position in the plan
  - `metadata` (jsonb) - Additional metadata
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all new tables
  - Users can only access their own plans
  - All policies check authentication and ownership
*/

-- Add columns to brand_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_profiles' AND column_name = 'posting_frequency'
  ) THEN
    ALTER TABLE brand_profiles
      ADD COLUMN posting_frequency text DEFAULT 'weekly',
      ADD COLUMN posting_days text[] DEFAULT ARRAY['monday', 'wednesday', 'friday'],
      ADD COLUMN posting_times text[] DEFAULT ARRAY['morning'],
      ADD COLUMN content_themes text[] DEFAULT '{}',
      ADD COLUMN planning_preferences jsonb DEFAULT '{}';
  END IF;
END $$;

-- Create content_plans table
CREATE TABLE IF NOT EXISTS content_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_profile_id uuid REFERENCES brand_profiles(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  frequency text NOT NULL,
  total_posts integer DEFAULT 0,
  status text DEFAULT 'draft',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create planned_posts table
CREATE TABLE IF NOT EXISTS planned_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_plan_id uuid REFERENCES content_plans(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  suggested_date date NOT NULL,
  suggested_time time NOT NULL,
  rationale text DEFAULT '',
  content_generated boolean DEFAULT false,
  caption text DEFAULT '',
  hashtags text[] DEFAULT '{}',
  platforms text[] DEFAULT '{}',
  image_url text DEFAULT '',
  status text DEFAULT 'suggested',
  order_in_plan integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_posts ENABLE ROW LEVEL SECURITY;

-- Policies for content_plans
CREATE POLICY "Users can view own content plans"
  ON content_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content plans"
  ON content_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content plans"
  ON content_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content plans"
  ON content_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for planned_posts
CREATE POLICY "Users can view own planned posts"
  ON planned_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own planned posts"
  ON planned_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planned posts"
  ON planned_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own planned posts"
  ON planned_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_plans_user_id ON content_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_content_plans_dates ON content_plans(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_planned_posts_plan_id ON planned_posts(content_plan_id);
CREATE INDEX IF NOT EXISTS idx_planned_posts_user_id ON planned_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_posts_date ON planned_posts(suggested_date);
CREATE INDEX IF NOT EXISTS idx_planned_posts_status ON planned_posts(status);

-- Create trigger for content_plans updated_at
CREATE OR REPLACE FUNCTION update_content_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_content_plans_updated_at_trigger ON content_plans;
CREATE TRIGGER update_content_plans_updated_at_trigger
  BEFORE UPDATE ON content_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_content_plans_updated_at();

-- Create trigger for planned_posts updated_at
CREATE OR REPLACE FUNCTION update_planned_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_planned_posts_updated_at_trigger ON planned_posts;
CREATE TRIGGER update_planned_posts_updated_at_trigger
  BEFORE UPDATE ON planned_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_planned_posts_updated_at();
