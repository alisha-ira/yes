/*
  # Make content_plan_id nullable in planned_posts

  ## Overview
  This migration makes the content_plan_id column nullable in the planned_posts table
  to allow creating planned posts without a content plan (for Smart Schedule Planner integration).

  ## Changes
  - Alter planned_posts table to make content_plan_id nullable
  - This allows planned posts to be created independently of content plans
  - Maintains referential integrity with ON DELETE CASCADE when content_plan_id is set

  ## Use Cases
  - Smart Schedule Planner can create planned posts directly
  - AI Content Planner can still create posts linked to a content plan
  - Flexible workflow for different planning scenarios
*/

-- Make content_plan_id nullable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'planned_posts' 
    AND column_name = 'content_plan_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE planned_posts 
    ALTER COLUMN content_plan_id DROP NOT NULL;
  END IF;
END $$;
