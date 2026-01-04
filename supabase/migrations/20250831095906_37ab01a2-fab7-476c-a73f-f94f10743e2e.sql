-- Fix security definer functions search path warnings
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_eco_pet_stats(_user_id UUID, _points INTEGER)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;