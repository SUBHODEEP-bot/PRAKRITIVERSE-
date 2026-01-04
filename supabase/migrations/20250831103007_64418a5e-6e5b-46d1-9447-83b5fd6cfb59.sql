-- Fix security warnings by updating functions with proper search_path

-- Update schedule_leaderboard_update function with proper search_path
CREATE OR REPLACE FUNCTION public.schedule_leaderboard_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can be called periodically to update leaderboards
  PERFORM public.calculate_leaderboard_rankings();
  
  -- Log the update
  INSERT INTO public.analytics_events (event_type, event_name, properties)
  VALUES ('system', 'leaderboard_updated', '{"scheduled": true}'::jsonb);
END;
$$;

-- Update create_welcome_notification function with proper search_path
CREATE OR REPLACE FUNCTION public.create_welcome_notification(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id, 
    title, 
    message, 
    type, 
    action_url,
    metadata
  ) VALUES (
    _user_id,
    'Welcome to PrakritiVerse! 🌍',
    'Start your sustainability journey by completing your first eco-action. Your virtual eco-pet is waiting to grow with you!',
    'welcome',
    '/dashboard?tab=actions',
    '{"welcome": true, "first_login": true}'::jsonb
  );
END;
$$;