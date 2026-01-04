-- Enhanced database schema with additional production features

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- eco_score, weekly_points, monthly_actions, etc.
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  period TEXT NOT NULL DEFAULT 'all_time', -- all_time, monthly, weekly, daily
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, period)
);

-- Create user sessions table for analytics
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  pages_visited JSONB DEFAULT '[]'::jsonb,
  actions_taken INTEGER DEFAULT 0,
  device_info JSONB DEFAULT '{}'::jsonb
);

-- Create eco tips table for dynamic content
CREATE TABLE IF NOT EXISTS public.eco_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner',
  estimated_impact TEXT,
  points_value INTEGER DEFAULT 10,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge leaderboards
CREATE TABLE IF NOT EXISTS public.challenge_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.eco_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Create file uploads table for storage management
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  bucket_name TEXT NOT NULL,
  purpose TEXT NOT NULL, -- avatar, eco_action_proof, course_material, etc.
  related_entity_id UUID,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course progress tracking
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  time_spent_minutes INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enrollment_id, module_id)
);

-- Create achievement templates
CREATE TABLE IF NOT EXISTS public.achievement_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  criteria JSONB NOT NULL, -- conditions for earning achievement
  badge_icon TEXT,
  points_reward INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for leaderboards
CREATE POLICY "Anyone can view leaderboards" ON public.leaderboards
  FOR SELECT USING (true);

-- RLS Policies for user sessions
CREATE POLICY "Users can manage own sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for eco tips
CREATE POLICY "Anyone can view active eco tips" ON public.eco_tips
  FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers and admins can manage eco tips" ON public.eco_tips
  FOR ALL USING (
    public.has_role(auth.uid(), 'teacher') OR 
    public.has_role(auth.uid(), 'admin') OR
    auth.uid() = created_by
  );

-- RLS Policies for challenge leaderboards
CREATE POLICY "Anyone can view challenge leaderboards" ON public.challenge_leaderboards
  FOR SELECT USING (true);

-- RLS Policies for file uploads
CREATE POLICY "Users can view own files" ON public.file_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own files" ON public.file_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for analytics events
CREATE POLICY "Users can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for course progress
CREATE POLICY "Users can view own course progress" ON public.course_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE id = enrollment_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own course progress" ON public.course_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE id = enrollment_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for achievement templates
CREATE POLICY "Anyone can view achievement templates" ON public.achievement_templates
  FOR SELECT USING (is_active = true);

-- Create advanced functions

-- Function to calculate user rankings
CREATE OR REPLACE FUNCTION public.calculate_leaderboard_rankings()
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update eco score rankings
  WITH ranked_users AS (
    SELECT 
      user_id,
      eco_score as score,
      ROW_NUMBER() OVER (ORDER BY eco_score DESC) as rank
    FROM public.profiles 
    WHERE eco_score > 0
  )
  INSERT INTO public.leaderboards (user_id, category, score, rank, period, calculated_at)
  SELECT user_id, 'eco_score', score, rank, 'all_time', NOW()
  FROM ranked_users
  ON CONFLICT (user_id, category, period) 
  DO UPDATE SET 
    score = EXCLUDED.score,
    rank = EXCLUDED.rank,
    calculated_at = EXCLUDED.calculated_at;

  -- Update weekly points rankings
  WITH weekly_points AS (
    SELECT 
      user_id,
      SUM(points_earned) as total_points
    FROM public.eco_actions 
    WHERE created_at >= DATE_TRUNC('week', NOW())
    GROUP BY user_id
  ),
  ranked_weekly AS (
    SELECT 
      user_id,
      total_points as score,
      ROW_NUMBER() OVER (ORDER BY total_points DESC) as rank
    FROM weekly_points
  )
  INSERT INTO public.leaderboards (user_id, category, score, rank, period, calculated_at)
  SELECT user_id, 'weekly_points', score, rank, 'weekly', NOW()
  FROM ranked_weekly
  ON CONFLICT (user_id, category, period) 
  DO UPDATE SET 
    score = EXCLUDED.score,
    rank = EXCLUDED.rank,
    calculated_at = EXCLUDED.calculated_at;
END;
$$;

-- Function to award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(_user_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  template_record RECORD;
  user_stats RECORD;
  criteria_met BOOLEAN;
BEGIN
  -- Get user statistics
  SELECT 
    p.eco_score,
    p.total_points,
    COUNT(ea.id) as total_actions,
    ep.level as pet_level,
    COUNT(DISTINCT ea.action_type) as unique_action_types
  INTO user_stats
  FROM public.profiles p
  LEFT JOIN public.eco_actions ea ON ea.user_id = p.user_id
  LEFT JOIN public.eco_pets ep ON ep.user_id = p.user_id
  WHERE p.user_id = _user_id
  GROUP BY p.user_id, p.eco_score, p.total_points, ep.level;

  -- Check each achievement template
  FOR template_record IN 
    SELECT * FROM public.achievement_templates WHERE is_active = true
  LOOP
    criteria_met := false;
    
    -- Check criteria based on achievement type
    CASE template_record.achievement_type
      WHEN 'eco_score' THEN
        criteria_met := user_stats.eco_score >= (template_record.criteria->>'threshold')::INTEGER;
      WHEN 'total_actions' THEN
        criteria_met := user_stats.total_actions >= (template_record.criteria->>'threshold')::INTEGER;
      WHEN 'pet_level' THEN
        criteria_met := user_stats.pet_level >= (template_record.criteria->>'threshold')::INTEGER;
      WHEN 'action_variety' THEN
        criteria_met := user_stats.unique_action_types >= (template_record.criteria->>'threshold')::INTEGER;
      ELSE
        criteria_met := false;
    END CASE;

    -- Award achievement if criteria met and not already awarded
    IF criteria_met THEN
      INSERT INTO public.achievements (
        user_id, 
        achievement_type, 
        title, 
        description,
        badge_url
      )
      SELECT 
        _user_id,
        template_record.achievement_type,
        template_record.title,
        template_record.description,
        template_record.badge_icon
      WHERE NOT EXISTS (
        SELECT 1 FROM public.achievements 
        WHERE user_id = _user_id 
        AND achievement_type = template_record.achievement_type
        AND title = template_record.title
      );
    END IF;
  END LOOP;
END;
$$;

-- Function to track user session
CREATE OR REPLACE FUNCTION public.start_user_session(_user_id UUID, _device_info JSONB DEFAULT '{}'::jsonb)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_id UUID;
BEGIN
  INSERT INTO public.user_sessions (user_id, device_info)
  VALUES (_user_id, _device_info)
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;

-- Function to end user session
CREATE OR REPLACE FUNCTION public.end_user_session(_session_id UUID)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET 
    session_end = NOW(),
    duration_minutes = EXTRACT(EPOCH FROM (NOW() - session_start)) / 60
  WHERE id = _session_id;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _title TEXT,
  _message TEXT,
  _type TEXT DEFAULT 'info',
  _action_url TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, title, message, type, action_url, metadata
  )
  VALUES (_user_id, _title, _message, _type, _action_url, _metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Enhanced update eco pet stats function with achievements
CREATE OR REPLACE FUNCTION public.update_eco_pet_stats(_user_id UUID, _points INTEGER)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_exp INTEGER;
  new_level INTEGER;
  old_level INTEGER;
BEGIN
  -- Get current level before update
  SELECT level INTO old_level
  FROM public.eco_pets
  WHERE user_id = _user_id;
  
  -- Update eco pet experience and stats
  UPDATE public.eco_pets 
  SET 
    experience_points = experience_points + _points,
    health = LEAST(100, health + (_points / 5)),
    energy = LEAST(100, energy + (_points / 3)),
    growth = LEAST(100, growth + (_points / 4)),
    updated_at = NOW()
  WHERE user_id = _user_id;
  
  -- Calculate new level based on experience
  SELECT experience_points INTO current_exp
  FROM public.eco_pets
  WHERE user_id = _user_id;
  
  new_level := GREATEST(1, current_exp / 100 + 1);
  
  -- Update level if increased
  UPDATE public.eco_pets 
  SET level = new_level
  WHERE user_id = _user_id AND level < new_level;
  
  -- Update user eco score and total points
  UPDATE public.profiles
  SET 
    eco_score = eco_score + _points,
    total_points = total_points + _points,
    updated_at = NOW()
  WHERE user_id = _user_id;
  
  -- Create notification for level up
  IF new_level > old_level THEN
    PERFORM public.create_notification(
      _user_id,
      'Level Up! 🎉',
      format('Your eco-pet %s reached level %s!', 
        (SELECT name FROM public.eco_pets WHERE user_id = _user_id), 
        new_level
      ),
      'success',
      '/dashboard?tab=pet'
    );
  END IF;
  
  -- Check for achievements
  PERFORM public.check_and_award_achievements(_user_id);
END;
$$;

-- Insert achievement templates
INSERT INTO public.achievement_templates (title, description, achievement_type, criteria, points_reward) VALUES
('First Steps', 'Complete your first eco action', 'total_actions', '{"threshold": 1}', 25),
('Eco Warrior', 'Complete 10 eco actions', 'total_actions', '{"threshold": 10}', 50),
('Sustainability Champion', 'Complete 50 eco actions', 'total_actions', '{"threshold": 50}', 100),
('Eco Master', 'Complete 100 eco actions', 'total_actions', '{"threshold": 100}', 200),
('Rising Star', 'Reach 100 eco score', 'eco_score', '{"threshold": 100}', 50),
('Green Guardian', 'Reach 500 eco score', 'eco_score', '{"threshold": 500}', 100),
('Planet Protector', 'Reach 1000 eco score', 'eco_score', '{"threshold": 1000}', 200),
('Pet Trainer', 'Level up your eco-pet to level 5', 'pet_level', '{"threshold": 5}', 75),
('Pet Master', 'Level up your eco-pet to level 10', 'pet_level', '{"threshold": 10}', 150),
('Diversity Advocate', 'Try 5 different types of eco actions', 'action_variety', '{"threshold": 5}', 100)
ON CONFLICT DO NOTHING;

-- Insert sample eco tips
INSERT INTO public.eco_tips (title, content, category, difficulty_level, estimated_impact, points_value, tags) VALUES
('Switch to LED Bulbs', 'Replace incandescent bulbs with LED bulbs to reduce energy consumption by up to 80% and last 25 times longer.', 'energy', 'beginner', 'High', 20, ARRAY['energy', 'home', 'lighting']),
('Start Composting', 'Create a compost bin for organic waste to reduce landfill waste and create nutrient-rich soil for plants.', 'waste', 'intermediate', 'Medium', 30, ARRAY['waste', 'gardening', 'composting']),
('Use Reusable Bags', 'Replace single-use plastic bags with reusable shopping bags to reduce plastic waste.', 'waste', 'beginner', 'Medium', 15, ARRAY['waste', 'shopping', 'plastic']),
('Take Shorter Showers', 'Reduce shower time by 2-3 minutes to save water and energy used for heating.', 'water', 'beginner', 'Medium', 18, ARRAY['water', 'energy', 'bathroom']),
('Cycle or Walk Instead of Driving', 'Choose active transportation for short trips to reduce carbon emissions and improve health.', 'transport', 'beginner', 'High', 25, ARRAY['transport', 'health', 'emissions']),
('Unplug Electronics When Not in Use', 'Reduce phantom energy consumption by unplugging devices and chargers when not actively using them.', 'energy', 'beginner', 'Low', 12, ARRAY['energy', 'electronics', 'phantom']),
('Plant Native Species', 'Choose native plants for your garden to support local wildlife and reduce water usage.', 'biodiversity', 'intermediate', 'High', 35, ARRAY['biodiversity', 'gardening', 'native']),
('Buy Local and Seasonal Produce', 'Support local farmers and reduce transportation emissions by choosing seasonal, locally-grown food.', 'food', 'beginner', 'Medium', 22, ARRAY['food', 'local', 'seasonal']),
('Install a Rain Barrel', 'Collect rainwater for garden irrigation to reduce municipal water usage.', 'water', 'intermediate', 'Medium', 40, ARRAY['water', 'gardening', 'conservation']),
('Use Cold Water for Laundry', 'Wash clothes in cold water to reduce energy consumption while maintaining cleaning effectiveness.', 'energy', 'beginner', 'Medium', 15, ARRAY['energy', 'laundry', 'water'])
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at columns
CREATE OR REPLACE TRIGGER update_eco_tips_updated_at
  BEFORE UPDATE ON public.eco_tips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eco_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievements;