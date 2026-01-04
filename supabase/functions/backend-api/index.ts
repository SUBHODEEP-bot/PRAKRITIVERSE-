import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, data = {} } = await req.json();

    let result;

    switch (action) {
      case 'get_leaderboard':
        const { category = 'eco_score', period = 'all_time', limit = 10 } = data;
        
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from('leaderboards')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .eq('category', category)
          .eq('period', period)
          .order('rank', { ascending: true })
          .limit(limit);

        if (leaderboardError) throw leaderboardError;
        result = { leaderboard: leaderboardData };
        break;

      case 'get_user_rank':
        const { data: userRank, error: rankError } = await supabase
          .from('leaderboards')
          .select('rank, score')
          .eq('user_id', user.id)
          .eq('category', data.category || 'eco_score')
          .eq('period', data.period || 'all_time')
          .single();

        result = { rank: userRank?.rank || null, score: userRank?.score || 0 };
        break;

      case 'get_notifications':
        const { data: notifications, error: notifError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(data.limit || 20);

        if (notifError) throw notifError;
        result = { notifications };
        break;

      case 'mark_notification_read':
        const { error: markReadError } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', data.notification_id)
          .eq('user_id', user.id);

        if (markReadError) throw markReadError;
        result = { success: true };
        break;

      case 'get_eco_tips':
        const { category: tipCategory, limit: tipLimit = 5 } = data;
        
        let query = supabase
          .from('eco_tips')
          .select('*')
          .eq('is_active', true);
        
        if (tipCategory) {
          query = query.eq('category', tipCategory);
        }
        
        const { data: ecoTips, error: tipsError } = await query
          .order('created_at', { ascending: false })
          .limit(tipLimit);

        if (tipsError) throw tipsError;
        result = { tips: ecoTips };
        break;

      case 'record_analytics_event':
        const { event_type, event_name, properties = {}, page_url } = data;
        
        const { error: analyticsError } = await supabase
          .from('analytics_events')
          .insert({
            user_id: user.id,
            event_type,
            event_name,
            properties,
            page_url,
            user_agent: req.headers.get('user-agent'),
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
          });

        if (analyticsError) throw analyticsError;
        result = { success: true };
        break;

      case 'start_session':
        const { device_info = {} } = data;
        
        const { data: sessionData, error: sessionError } = await supabase
          .rpc('start_user_session', {
            _user_id: user.id,
            _device_info: device_info
          });

        if (sessionError) throw sessionError;
        result = { session_id: sessionData };
        break;

      case 'end_session':
        const { session_id } = data;
        
        const { error: endSessionError } = await supabase
          .rpc('end_user_session', {
            _session_id: session_id
          });

        if (endSessionError) throw endSessionError;
        result = { success: true };
        break;

      case 'calculate_rankings':
        // Only allow admins or the system to trigger this
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profile?.role !== 'admin') {
          throw new Error('Unauthorized - admin access required');
        }

        const { error: rankingsError } = await supabase
          .rpc('calculate_leaderboard_rankings');

        if (rankingsError) throw rankingsError;
        result = { success: true };
        break;

      case 'get_user_achievements':
        const { data: achievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false });

        if (achievementsError) throw achievementsError;
        result = { achievements };
        break;

      case 'get_course_progress':
        const { course_id } = data;
        
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('course_enrollments')
          .select(`
            *,
            course_progress (*)
          `)
          .eq('user_id', user.id)
          .eq('course_id', course_id)
          .single();

        if (enrollmentError) throw enrollmentError;
        result = { enrollment };
        break;

      case 'update_course_progress':
        const { enrollment_id, module_id, completed, score, time_spent } = data;
        
        const { error: progressError } = await supabase
          .from('course_progress')
          .upsert({
            enrollment_id,
            module_id,
            completed,
            score,
            time_spent_minutes: time_spent,
            completed_at: completed ? new Date().toISOString() : null
          });

        if (progressError) throw progressError;
        result = { success: true };
        break;

      case 'enroll_in_course':
        const { course_id: enrollCourseId } = data;
        
        const { error: enrollError } = await supabase
          .from('course_enrollments')
          .insert({
            user_id: user.id,
            course_id: enrollCourseId
          });

        if (enrollError) throw enrollError;
        result = { success: true };
        break;

      case 'get_user_stats':
        const { data: stats, error: statsError } = await supabase
          .from('profiles')
          .select(`
            *,
            eco_pets (*),
            eco_actions (count),
            achievements (count),
            course_enrollments (count)
          `)
          .eq('user_id', user.id)
          .single();

        if (statsError) throw statsError;
        result = { stats };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`API action ${action} completed for user:`, user.id);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in backend API:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});