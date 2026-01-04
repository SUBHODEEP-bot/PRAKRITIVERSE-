import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Challenge = Database['public']['Tables']['eco_challenges']['Row'];
type ChallengeParticipation = Database['public']['Tables']['challenge_participations']['Row'];

interface ExtendedChallenge extends Challenge {
  challenge_participations?: ChallengeParticipation[];
  challenge_leaderboards?: any[];
}

export const useChallenges = () => {
  const { user, session } = useAuth();
  const [challenges, setChallenges] = useState<ExtendedChallenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<ChallengeParticipation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveChallenges = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('challenge-management', {
        body: {
          action: 'get_active_challenges'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Error fetching active challenges:', error);
    }
  };

  const fetchUserChallenges = async (status: 'all' | 'active' | 'completed' = 'all') => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('challenge-management', {
        body: {
          action: 'get_user_challenges',
          data: { status }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      setUserChallenges(data.participations || []);
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!session) return false;

    try {
      const { error } = await supabase.functions.invoke('challenge-management', {
        body: {
          action: 'join_challenge',
          data: { challenge_id: challengeId }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      // Get challenge details to send notification to NGO
      const { data: challengeData } = await supabase
        .from('eco_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeData?.created_by) {
        // Create notification for NGO
        await supabase.rpc('create_notification', {
          _user_id: challengeData.created_by,
          _title: 'New Challenge Participant!',
          _message: `Someone joined your challenge: ${challengeData.title}`,
          _type: 'challenge_joined',
          _action_url: '/dashboard?tab=challenges',
          _metadata: { challenge_id: challengeId, participant_id: user?.id }
        });
      }

      // Refresh challenges
      await fetchActiveChallenges();
      await fetchUserChallenges();

      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      return false;
    }
  };

  const updateChallengeProgress = async (challengeId: string, progressValue: number, targetValue: number) => {
    if (!session) return false;

    try {
      const { error } = await supabase.functions.invoke('challenge-management', {
        body: {
          action: 'update_challenge_progress',
          data: { challenge_id: challengeId, progress_value: progressValue, target_value: targetValue }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      // Refresh user challenges
      await fetchUserChallenges();

      return true;
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      return false;
    }
  };

  const createChallenge = async (challengeData: {
    title: string;
    description: string;
    challenge_type: string;
    target_value: number;
    points_reward: number;
    end_date: string;
    location_lat?: number;
    location_lng?: number;
    location_address?: string;
    location_radius_km?: number;
    requires_location_verification?: boolean;
    verification_photos_required?: boolean;
  }) => {
    if (!session) return false;

    try {
      const { data, error } = await supabase.functions.invoke('challenge-management', {
        body: {
          action: 'create_challenge',
          data: challengeData
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      // Refresh challenges
      await fetchActiveChallenges();

      return data.challenge;
    } catch (error) {
      console.error('Error creating challenge:', error);
      return false;
    }
  };

  const getChallengeLeaderboard = async (challengeId: string, limit: number = 10) => {
    if (!session) return [];

    try {
      const { data, error } = await supabase.functions.invoke('challenge-management', {
        body: {
          action: 'get_challenge_leaderboard',
          data: { challenge_id: challengeId, limit }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      return data.leaderboard || [];
    } catch (error) {
      console.error('Error fetching challenge leaderboard:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchActiveChallenges();
      fetchUserChallenges();
    }
  }, [user, session]);

  return {
    challenges,
    userChallenges,
    loading,
    joinChallenge,
    updateChallengeProgress,
    createChallenge,
    getChallengeLeaderboard,
    refresh: () => {
      fetchActiveChallenges();
      fetchUserChallenges();
    }
  };
};