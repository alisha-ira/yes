/*
  # Fix Date Display Consistency

  ## Overview
  This migration fixes the date conversion functions to ensure dates display exactly as stored,
  without timezone shifts that cause calendar display mismatches.

  ## Changes
  - Updates `get_scheduled_posts_sg` to return dates without timezone conversion
  - Updates `get_planned_posts_sg` to return dates without timezone conversion
  - Dates are stored as DATE type and should display as-is

  ## Notes
  - Since scheduled_date and suggested_date are DATE types (not timestamp), they don't need timezone conversion
  - This ensures the date shown in the calendar matches the date selected when scheduling
*/

-- Function to get scheduled posts with dates as-is
CREATE OR REPLACE FUNCTION get_scheduled_posts_sg(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  brand_profile_id uuid,
  generated_content_id uuid,
  title text,
  caption text,
  hashtags text[],
  platforms text[],
  image_url text,
  scheduled_date text,
  scheduled_time time,
  timezone text,
  status text,
  notes text,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id,
    sp.user_id,
    sp.brand_profile_id,
    sp.generated_content_id,
    sp.title,
    sp.caption,
    sp.hashtags,
    sp.platforms,
    sp.image_url,
    sp.scheduled_date::text as scheduled_date,
    sp.scheduled_time,
    sp.timezone,
    sp.status,
    sp.notes,
    sp.metadata,
    sp.created_at,
    sp.updated_at
  FROM scheduled_posts sp
  WHERE sp.user_id = p_user_id
  ORDER BY sp.scheduled_date ASC, sp.scheduled_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get planned posts with dates as-is
CREATE OR REPLACE FUNCTION get_planned_posts_sg(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  content_plan_id uuid,
  user_id uuid,
  title text,
  suggested_date text,
  suggested_time time,
  rationale text,
  content_generated boolean,
  caption text,
  hashtags text[],
  platforms text[],
  image_url text,
  status text,
  order_in_plan integer,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.id,
    pp.content_plan_id,
    pp.user_id,
    pp.title,
    pp.suggested_date::text as suggested_date,
    pp.suggested_time,
    pp.rationale,
    pp.content_generated,
    pp.caption,
    pp.hashtags,
    pp.platforms,
    pp.image_url,
    pp.status,
    pp.order_in_plan,
    pp.metadata,
    pp.created_at,
    pp.updated_at
  FROM planned_posts pp
  WHERE pp.user_id = p_user_id
  ORDER BY pp.suggested_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
