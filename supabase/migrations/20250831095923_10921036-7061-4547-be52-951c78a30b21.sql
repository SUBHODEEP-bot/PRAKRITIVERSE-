-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student',
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
CREATE TABLE IF NOT EXISTS public.eco_pets (
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
CREATE TABLE IF NOT EXISTS public.eco_actions (
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
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  badge_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create eco courses table
CREATE TABLE IF NOT EXISTS public.eco_courses (
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
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.eco_courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for eco_pets
DROP POLICY IF EXISTS "Users can view own eco pet" ON public.eco_pets;
CREATE POLICY "Users can view own eco pet" ON public.eco_pets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own eco pet" ON public.eco_pets;
CREATE POLICY "Users can update own eco pet" ON public.eco_pets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own eco pet" ON public.eco_pets;
CREATE POLICY "Users can insert own eco pet" ON public.eco_pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for eco_actions
DROP POLICY IF EXISTS "Users can view all eco actions" ON public.eco_actions;
CREATE POLICY "Users can view all eco actions" ON public.eco_actions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own eco actions" ON public.eco_actions;
CREATE POLICY "Users can insert own eco actions" ON public.eco_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample courses
INSERT INTO public.eco_courses (title, description, category, difficulty_level, duration_minutes, points_reward, content) VALUES
('Introduction to Sustainable Living', 'Learn the basics of sustainable living and eco-friendly practices', 'basics', 'beginner', 30, 20, '{"modules": [{"title": "What is Sustainability?", "content": "Understanding the three pillars of sustainability"}, {"title": "Daily Eco Habits", "content": "Simple changes for a greener lifestyle"}]}'),
('Water Conservation Techniques', 'Master water-saving methods for home and community', 'water', 'intermediate', 45, 30, '{"modules": [{"title": "Water Cycle", "content": "Understanding water systems"}, {"title": "Conservation Methods", "content": "Practical water saving techniques"}]}'),
('Renewable Energy Basics', 'Explore solar, wind, and other renewable energy sources', 'energy', 'beginner', 60, 40, '{"modules": [{"title": "Solar Power", "content": "How solar energy works"}, {"title": "Wind Energy", "content": "Understanding wind power generation"}]}'),
('Waste Management & Recycling', 'Learn proper waste sorting and recycling techniques', 'waste', 'beginner', 40, 25, '{"modules": [{"title": "Waste Categories", "content": "Types of waste and proper disposal"}, {"title": "Recycling Process", "content": "How recycling works"}]}')
ON CONFLICT DO NOTHING;