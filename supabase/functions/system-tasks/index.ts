import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create admin client for system operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!);
    
    const { action, data = {} } = await req.json();

    let result;

    switch (action) {
      case 'update_leaderboards':
        // This can be called by cron or admin users
        const { error: leaderboardError } = await supabaseAdmin
          .rpc('calculate_leaderboard_rankings');

        if (leaderboardError) throw leaderboardError;
        
        console.log('Leaderboards updated successfully');
        result = { success: true, message: 'Leaderboards updated' };
        break;

      case 'check_achievements':
        // Check achievements for all users or specific user
        const { user_id } = data;
        
        if (user_id) {
          // Check for specific user
          const { error: achievementError } = await supabaseAdmin
            .rpc('check_and_award_achievements', { _user_id: user_id });

          if (achievementError) throw achievementError;
          result = { success: true, message: `Achievements checked for user ${user_id}` };
        } else {
          // Check for all users (batch operation)
          const { data: users, error: usersError } = await supabaseAdmin
            .from('profiles')
            .select('user_id');

          if (usersError) throw usersError;

          let processedUsers = 0;
          for (const user of users) {
            try {
              await supabaseAdmin.rpc('check_and_award_achievements', { 
                _user_id: user.user_id 
              });
              processedUsers++;
            } catch (error) {
              console.error(`Error checking achievements for user ${user.user_id}:`, error);
            }
          }

          result = { 
            success: true, 
            message: `Achievements checked for ${processedUsers}/${users.length} users` 
          };
        }
        break;

      case 'cleanup_old_sessions':
        // Clean up sessions older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { error: cleanupError } = await supabaseAdmin
          .from('user_sessions')
          .delete()
          .lt('session_start', thirtyDaysAgo.toISOString());

        if (cleanupError) throw cleanupError;

        result = { success: true, message: 'Old sessions cleaned up' };
        break;

      case 'generate_analytics_report':
        const { start_date, end_date, report_type = 'summary' } = data;
        
        // Generate analytics report
        const { data: analyticsData, error: analyticsError } = await supabaseAdmin
          .from('analytics_events')
          .select('*')
          .gte('created_at', start_date)
          .lte('created_at', end_date);

        if (analyticsError) throw analyticsError;

        // Process analytics data
        const report = {
          period: { start_date, end_date },
          total_events: analyticsData.length,
          unique_users: new Set(analyticsData.map(e => e.user_id)).size,
          event_breakdown: analyticsData.reduce((acc, event) => {
            acc[event.event_name] = (acc[event.event_name] || 0) + 1;
            return acc;
          }, {}),
          daily_activity: {}
        };

        // Group by day
        analyticsData.forEach(event => {
          const day = event.created_at.split('T')[0];
          if (!report.daily_activity[day]) {
            report.daily_activity[day] = { events: 0, users: new Set() };
          }
          report.daily_activity[day].events++;
          report.daily_activity[day].users.add(event.user_id);
        });

        // Convert sets to counts
        Object.keys(report.daily_activity).forEach(day => {
          report.daily_activity[day].unique_users = report.daily_activity[day].users.size;
          delete report.daily_activity[day].users;
        });

        result = { report };
        break;

      case 'send_bulk_notifications':
        const { user_ids, title, message, type = 'info', action_url } = data;
        
        if (!Array.isArray(user_ids) || user_ids.length === 0) {
          throw new Error('user_ids must be a non-empty array');
        }

        // Create notifications for all specified users
        const notifications = user_ids.map(user_id => ({
          user_id,
          title,
          message,
          type,
          action_url
        }));

        const { error: notificationError } = await supabaseAdmin
          .from('notifications')
          .insert(notifications);

        if (notificationError) throw notificationError;

        result = { 
          success: true, 
          message: `Notifications sent to ${user_ids.length} users` 
        };
        break;

      case 'archive_old_data':
        const { days_old = 365, table_name } = data;
        const archiveDate = new Date();
        archiveDate.setDate(archiveDate.getDate() - days_old);

        let deleteCount = 0;
        
        switch (table_name) {
          case 'analytics_events':
            const { count: analyticsCount, error: analyticsArchiveError } = await supabaseAdmin
              .from('analytics_events')
              .delete({ count: 'exact' })
              .lt('created_at', archiveDate.toISOString());
            
            if (analyticsArchiveError) throw analyticsArchiveError;
            deleteCount = analyticsCount || 0;
            break;

          case 'user_sessions':
            const { count: sessionsCount, error: sessionsArchiveError } = await supabaseAdmin
              .from('user_sessions')
              .delete({ count: 'exact' })
              .lt('session_start', archiveDate.toISOString());
            
            if (sessionsArchiveError) throw sessionsArchiveError;
            deleteCount = sessionsCount || 0;
            break;

          default:
            throw new Error(`Archiving not supported for table: ${table_name}`);
        }

        result = { 
          success: true, 
          message: `Archived ${deleteCount} records from ${table_name}` 
        };
        break;

      case 'health_check':
        // Basic health check
        const { data: profileCount, error: healthError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (healthError) throw healthError;

        result = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          user_count: profileCount,
          version: '1.0.0'
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`System task ${action} completed successfully`);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in system tasks:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});