-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'ngo', 'institution', 'admin');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role app_role NOT NULL DEFAULT 'student',
  school_name TEXT,
  city TEXT,
  state TEXT,
  bio TEXT,
  eco_score INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create eco pets table
CREATE TABLE public.eco_pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Leafy',
  species TEXT NOT NULL DEFAULT 'plant',
  level INTEGER DEFAULT 1,
  health INTEGER DEFAULT 85,
  energy INTEGER DEFAULT 92,
  growth INTEGER DEFAULT 76,
  experience_points INTEGER DEFAULT 0,
  last_fed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create eco actions table
CREATE TABLE public.eco_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  points_earned INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  verified BOOLEAN DEFAULT FALSE,
  location TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  badge_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create eco courses table
CREATE TABLE public.eco_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner',
  duration_minutes INTEGER,
  points_reward INTEGER DEFAULT 10,
  content JSONB,
  created_by UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course enrollments table
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.eco_courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Create ai chat sessions table
CREATE TABLE public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_title TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create eco challenges table
CREATE TABLE public.eco_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL,
  target_value INTEGER,
  points_reward INTEGER DEFAULT 20,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge participations table
CREATE TABLE public.challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.eco_challenges(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for eco_pets
CREATE POLICY "Users can view own eco pet" ON public.eco_pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own eco pet" ON public.eco_pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own eco pet" ON public.eco_pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for eco_actions
CREATE POLICY "Users can view all eco actions" ON public.eco_actions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own eco actions" ON public.eco_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own eco actions" ON public.eco_actions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Users can view all achievements" ON public.achievements
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for eco_courses
CREATE POLICY "Anyone can view published courses" ON public.eco_courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Teachers and admins can manage courses" ON public.eco_courses
  FOR ALL USING (
    public.has_role(auth.uid(), 'teacher') OR 
    public.has_role(auth.uid(), 'admin') OR
    auth.uid() = created_by
  );

-- RLS Policies for course_enrollments
CREATE POLICY "Users can view own enrollments" ON public.course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own enrollments" ON public.course_enrollments
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for ai_chat_sessions
CREATE POLICY "Users can manage own chat sessions" ON public.ai_chat_sessions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for eco_challenges
CREATE POLICY "Anyone can view active challenges" ON public.eco_challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers and admins can manage challenges" ON public.eco_challenges
  FOR ALL USING (
    public.has_role(auth.uid(), 'teacher') OR 
    public.has_role(auth.uid(), 'admin') OR
    auth.uid() = created_by
  );

-- RLS Policies for challenge_participations
CREATE POLICY "Users can view own participations" ON public.challenge_participations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own participations" ON public.challenge_participations
  FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  
  INSERT INTO public.eco_pets (user_id, name)
  VALUES (NEW.id, 'Leafy');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update eco pet stats
CREATE OR REPLACE FUNCTION public.update_eco_pet_stats(_user_id UUID, _points INTEGER)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  current_exp INTEGER;
  new_level INTEGER;
BEGIN
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
END;
$$;

-- Insert sample courses
INSERT INTO public.eco_courses (title, description, category, difficulty_level, duration_minutes, points_reward, content) VALUES
('Introduction to Sustainable Living', 'Learn the basics of sustainable living and eco-friendly practices', 'basics', 'beginner', 30, 20, '{"modules": [{"title": "What is Sustainability?", "content": "Understanding the three pillars of sustainability"}, {"title": "Daily Eco Habits", "content": "Simple changes for a greener lifestyle"}]}'),
('Water Conservation Techniques', 'Master water-saving methods for home and community', 'water', 'intermediate', 45, 30, '{"modules": [{"title": "Water Cycle", "content": "Understanding water systems"}, {"title": "Conservation Methods", "content": "Practical water saving techniques"}]}'),
('Renewable Energy Basics', 'Explore solar, wind, and other renewable energy sources', 'energy', 'beginner', 60, 40, '{"modules": [{"title": "Solar Power", "content": "How solar energy works"}, {"title": "Wind Energy", "content": "Understanding wind power generation"}]}'),
('Waste Management & Recycling', 'Learn proper waste sorting and recycling techniques', 'waste', 'beginner', 40, 25, '{"modules": [{"title": "Waste Categories", "content": "Types of waste and proper disposal"}, {"title": "Recycling Process", "content": "How recycling works"}]}');

-- Insert sample challenges
INSERT INTO public.eco_challenges (title, description, challenge_type, target_value, points_reward, end_date) VALUES
('Plant 100 Trees', 'Community challenge to plant 100 trees this month', 'tree_planting', 100, 50, NOW() + INTERVAL '30 days'),
('Zero Waste Week', 'Try to produce zero waste for a full week', 'waste_reduction', 7, 75, NOW() + INTERVAL '14 days'),
('Energy Saver Challenge', 'Reduce your energy consumption by 20%', 'energy_saving', 20, 60, NOW() + INTERVAL '21 days'),
('Water Conservation Drive', 'Save 1000 liters of water through conservation', 'water_saving', 1000, 80, NOW() + INTERVAL '30 days');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_eco_pets_updated_at
    BEFORE UPDATE ON public.eco_pets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_chat_sessions_updated_at
    BEFORE UPDATE ON public.ai_chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();