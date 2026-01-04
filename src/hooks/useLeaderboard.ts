import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Leaderboard = Database['public']['Tables']['leaderboards']['Row'] & {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export const useLeaderboard = (category: string = 'eco_score', period: string = 'all_time') => {
  const { user, session } = useAuth();
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number | null; score: number }>({ rank: null, score: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    if (!session) return;

    try {
      setLoading(true);

      // Fetch leaderboard data
      const { data: leaderboardData, error: leaderboardError } = await supabase.functions.invoke('backend-api', {
        body: {
          action: 'get_leaderboard',
          data: { category, period, limit: 50 }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (leaderboardError) throw leaderboardError;

      setLeaderboard(leaderboardData.leaderboard || []);

      // Fetch user rank
      const { data: rankData, error: rankError } = await supabase.functions.invoke('backend-api', {
        body: {
          action: 'get_user_rank',
          data: { category, period }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (rankError) throw rankError;

      setUserRank(rankData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [user, session, category, period]);

  // Set up realtime subscription for leaderboard updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboards',
          filter: `category=eq.${category}`
        },
        () => {
          // Refresh leaderboard when there are changes
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, category, period]);

  return {
    leaderboard,
    userRank,
    loading,
    refresh: fetchLeaderboard
  };
};