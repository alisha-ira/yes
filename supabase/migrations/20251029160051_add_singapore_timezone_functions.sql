/*
  # Add Singapore Timezone Conversion Functions

  ## Overview
  This migration adds database functions to convert date fields to Singapore timezone (Asia/Singapore)
  for scheduled_posts and planned_posts tables.

  ## New Functions

  ### `get_scheduled_posts_sg(p_user_id uuid)`
  Returns scheduled posts with dates converted to Singapore timezone
  - Converts `scheduled_date` from UTC to Asia/Singapore timezone
  - Returns results in YYYY-MM-DD format
  - Orders by scheduled_date and scheduled_time ascending

  ### `get_planned_posts_sg(p_user_id uuid)`
  Returns planned posts with dates converted to Singapore timezone
  - Converts `suggested_date` from UTC to Asia/Singapore timezone
  - Returns results in YYYY-MM-DD format
  - Orders by suggested_date ascending

  ## Notes
  - Uses PostgreSQL's AT TIME ZONE function for accurate timezone conversion
  - All date fields are stored as DATE type (no time component), but conversion ensures proper timezone handling
  - Returns all columns from the original tables with modified date fields
*/

-- Function to get scheduled posts with Singapore timezone
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
    TO_CHAR(
      (sp.scheduled_date::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore')::date,
      'YYYY-MM-DD'
    ) as scheduled_date,
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

-- Function to get planned posts with Singapore timezone
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
    TO_CHAR(
      (pp.suggested_date::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore')::date,
      'YYYY-MM-DD'
    ) as suggested_date,
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_scheduled_posts_sg(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_planned_posts_sg(uuid) TO authenticated;
