-- Populate the database with sample data to make the application fully functional

-- Insert sample achievement templates
INSERT INTO public.achievement_templates (title, description, achievement_type, criteria, points_reward, badge_icon) VALUES
('First Steps', 'Complete your first eco action', 'total_actions', '{"threshold": 1}', 50, '🌱'),
('Eco Novice', 'Reach 100 eco score points', 'eco_score', '{"threshold": 100}', 75, '🌿'),
('Green Warrior', 'Complete 10 eco actions', 'total_actions', '{"threshold": 10}', 100, '⚔️'),
('Sustainability Expert', 'Reach 500 eco score points', 'eco_score', '{"threshold": 500}', 200, '🏆'),
('Pet Master', 'Raise your eco-pet to level 5', 'pet_level', '{"threshold": 5}', 150, '🐾'),
('Action Hero', 'Try 5 different types of eco actions', 'action_variety', '{"threshold": 5}', 125, '🦸');

-- Insert sample eco tips
INSERT INTO public.eco_tips (title, content, category, points_value, difficulty_level, estimated_impact, tags) VALUES
('Switch to LED Bulbs', 'Replace incandescent bulbs with LED alternatives. LEDs use up to 80% less energy and last 25 times longer, reducing both electricity bills and waste.', 'energy', 25, 'beginner', 'High - Can reduce household energy consumption by 10-15%', ARRAY['energy', 'home', 'easy']),
('Start Composting', 'Create a compost bin for food scraps and yard waste. Composting reduces landfill waste by 30% and creates nutrient-rich soil for plants.', 'waste', 30, 'beginner', 'Medium - Diverts 30% of household waste from landfills', ARRAY['waste', 'gardening', 'organic']),
('Use Reusable Bags', 'Bring reusable bags when shopping to reduce plastic waste. A single reusable bag can replace hundreds of plastic bags over its lifetime.', 'waste', 15, 'beginner', 'Medium - Prevents 100+ plastic bags from entering ecosystems annually', ARRAY['waste', 'shopping', 'plastic']),
('Take Shorter Showers', 'Reduce shower time by 2-3 minutes to conserve water and energy. This simple change can save over 1,000 gallons of water per year.', 'water', 20, 'beginner', 'High - Saves 1,000+ gallons annually per person', ARRAY['water', 'energy', 'daily']),
('Plant Native Species', 'Choose native plants for landscaping. They require less water, support local wildlife, and are naturally pest-resistant.', 'biodiversity', 35, 'intermediate', 'High - Supports local ecosystems and reduces water usage by 50%', ARRAY['gardening', 'biodiversity', 'water']),
('Use Public Transport', 'Choose public transportation, biking, or walking instead of driving when possible. This reduces carbon emissions and air pollution.', 'transport', 40, 'beginner', 'Very High - Can reduce personal carbon footprint by 20%', ARRAY['transport', 'carbon', 'health']);

-- Insert sample eco courses
INSERT INTO public.eco_courses (title, description, category, duration_minutes, points_reward, difficulty_level, content) VALUES
('Introduction to Sustainability', 'Learn the fundamentals of sustainable living and environmental responsibility. Perfect for beginners starting their eco journey.', 'general', 45, 50, 'beginner', 
'{"modules": [
  {"title": "What is Sustainability?", "duration": 15, "content": "Understanding the three pillars of sustainability: environmental, social, and economic."},
  {"title": "Your Carbon Footprint", "duration": 15, "content": "Calculate and understand your personal environmental impact."},
  {"title": "Simple Daily Changes", "duration": 15, "content": "Easy actions you can take today to start living more sustainably."}
]}'),

('Renewable Energy Basics', 'Explore solar, wind, and other renewable energy sources. Understand how clean energy works and its benefits.', 'energy', 60, 75, 'beginner',
'{"modules": [
  {"title": "Types of Renewable Energy", "duration": 20, "content": "Solar, wind, hydro, and geothermal energy explained."},
  {"title": "Benefits and Challenges", "duration": 20, "content": "Environmental and economic advantages of clean energy."},
  {"title": "Home Energy Solutions", "duration": 20, "content": "How to incorporate renewable energy in your home."}
]}'),

('Waste Management & Recycling', 'Master the art of reducing, reusing, and recycling. Create a zero-waste lifestyle plan.', 'waste', 40, 60, 'intermediate',
'{"modules": [
  {"title": "The 5 Rs", "duration": 15, "content": "Refuse, Reduce, Reuse, Recycle, Rot - the complete waste hierarchy."},
  {"title": "Recycling Right", "duration": 15, "content": "Understanding recycling symbols and proper sorting techniques."},
  {"title": "Zero Waste Goals", "duration": 10, "content": "Creating a personal zero-waste action plan."}
]}'),

('Climate Change Science', 'Understand the science behind climate change, its impacts, and solutions. Advanced course for serious learners.', 'climate', 90, 100, 'advanced',
'{"modules": [
  {"title": "Climate Science Basics", "duration": 30, "content": "Greenhouse effect, global warming, and climate systems."},
  {"title": "Environmental Impacts", "duration": 30, "content": "Effects on ecosystems, weather patterns, and human societies."},
  {"title": "Solutions and Mitigation", "duration": 30, "content": "Technologies and policies for addressing climate change."}
]}');

-- Insert sample eco challenges
INSERT INTO public.eco_challenges (title, description, challenge_type, target_value, points_reward, start_date, end_date) VALUES
('30-Day Plastic Free Challenge', 'Eliminate single-use plastics from your daily routine for 30 days. Track your progress and share tips with the community.', 'waste_reduction', 30, 200, NOW(), NOW() + INTERVAL '30 days'),
('Plant a Tree Campaign', 'Plant or sponsor 5 trees in your local community. Help combat deforestation and improve air quality.', 'tree_planting', 5, 150, NOW(), NOW() + INTERVAL '60 days'),
('Energy Saver Week', 'Reduce your household energy consumption by 20% for one week. Use energy-efficient practices and track your savings.', 'energy_saving', 20, 100, NOW(), NOW() + INTERVAL '7 days'),
('Water Conservation Month', 'Implement water-saving techniques and reduce water usage by 25% over 30 days.', 'water_conservation', 25, 175, NOW(), NOW() + INTERVAL '30 days');

-- Create a function to run periodic leaderboard updates
CREATE OR REPLACE FUNCTION public.schedule_leaderboard_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can be called periodically to update leaderboards
  PERFORM public.calculate_leaderboard_rankings();
  
  -- Log the update
  INSERT INTO public.analytics_events (event_type, event_name, properties)
  VALUES ('system', 'leaderboard_updated', '{"scheduled": true}'::jsonb);
END;
$$;

-- Add some sample notifications function
CREATE OR REPLACE FUNCTION public.create_welcome_notification(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update the handle_new_user function to create welcome notification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public 
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, full_name, role, school_name, city, state)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')::app_role,
    NEW.raw_user_meta_data ->> 'school_name',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state'
  );
  
  -- Insert eco pet
  INSERT INTO public.eco_pets (user_id, name)
  VALUES (NEW.id, 'Leafy');
  
  -- Create welcome notification
  PERFORM public.create_welcome_notification(NEW.id);
  
  RETURN NEW;
END;
$$;