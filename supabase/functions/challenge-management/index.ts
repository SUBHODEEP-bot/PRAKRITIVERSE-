import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Helper function to calculate distance between two coordinates
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a client for auth checks
    let supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Recreate client with the user's JWT so RLS policies evaluate correctly
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { action, data = {} } = await req.json();

    let result;

    switch (action) {
      case 'create_challenge':
        const { title, description, challenge_type, target_value, points_reward, end_date, location_lat, location_lng, location_address, location_radius_km, requires_location_verification, verification_photos_required } = data;
        
        // Check if user has permission to create challenges
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (!['teacher', 'admin', 'ngo'].includes(profile?.role)) {
          throw new Error('Insufficient permissions to create challenges');
        }

        const { data: newChallenge, error: challengeError } = await supabase
          .from('eco_challenges')
          .insert({
            title,
            description,
            challenge_type,
            target_value,
            points_reward,
            end_date,
            created_by: user.id,
            is_active: true,
            location_lat,
            location_lng,
            location_address,
            location_radius_km: location_radius_km || 5,
            requires_location_verification: requires_location_verification || false,
            verification_photos_required: verification_photos_required || false
          })
          .select()
          .single();

        if (challengeError) throw challengeError;

        result = { challenge: newChallenge };
        break;

      case 'join_challenge':
        const { challenge_id } = data;
        
        const { error: joinError } = await supabase
          .from('challenge_participations')
          .insert({
            user_id: user.id,
            challenge_id
          });

        if (joinError) throw joinError;

        result = { success: true, message: 'Successfully joined challenge' };
        break;

      case 'update_challenge_progress':
        const { challenge_id: progressChallengeId, progress_value } = data;
        
        const { error: progressError } = await supabase
          .from('challenge_participations')
          .update({
            current_progress: progress_value,
            completed: progress_value >= data.target_value,
            completed_at: progress_value >= data.target_value ? new Date().toISOString() : null
          })
          .eq('user_id', user.id)
          .eq('challenge_id', progressChallengeId);

        if (progressError) throw progressError;

        // Update leaderboard
        if (progress_value >= data.target_value) {
          const { error: leaderboardError } = await supabase
            .from('challenge_leaderboards')
            .upsert({
              challenge_id: progressChallengeId,
              user_id: user.id,
              score: progress_value,
              completed_at: new Date().toISOString()
            });

          if (leaderboardError) throw leaderboardError;
        }

        result = { success: true };
        break;

      case 'get_active_challenges':
        const { data: activeChallenges, error: getError } = await supabase
          .from('eco_challenges')
          .select(`
            *,
            challenge_participations!left (
              current_progress,
              completed,
              joined_at
            ),
            challenge_leaderboards!left (
              user_id,
              score,
              rank,
              completed_at
            )
          `)
          .eq('is_active', true)
          .eq('challenge_participations.user_id', user.id)
          .order('created_at', { ascending: false });

        if (getError) throw getError;

        result = { challenges: activeChallenges };
        break;

      case 'get_challenge_leaderboard':
        const { challenge_id: leaderboardChallengeId, limit = 10 } = data;
        
        const { data: leaderboard, error: leaderboardError } = await supabase
          .from('challenge_leaderboards')
          .select('*')
          .eq('challenge_id', leaderboardChallengeId)
          .order('score', { ascending: false })
          .limit(limit);

        if (leaderboardError) throw leaderboardError;

        // Calculate ranks
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

        result = { leaderboard: rankedLeaderboard };
        break;

      case 'get_user_challenges':
        const { status = 'all' } = data; // all, active, completed
        
        let query = supabase
          .from('challenge_participations')
          .select(`
            *,
            eco_challenges (*)
          `)
          .eq('user_id', user.id);

        if (status === 'active') {
          query = query.eq('completed', false);
        } else if (status === 'completed') {
          query = query.eq('completed', true);
        }

        const { data: userChallenges, error: userChallengesError } = await query
          .order('joined_at', { ascending: false });

        if (userChallengesError) throw userChallengesError;

        result = { participations: userChallenges };
        break;

      case 'submit_challenge':
        const { challenge_id: submitChallengeId, submission_text, photo_urls, submission_location_lat, submission_location_lng, submission_location_address } = data;
        
        // Check if user is participating in the challenge
        const { data: participation } = await supabase
          .from('challenge_participations')
          .select('id')
          .eq('user_id', user.id)
          .eq('challenge_id', submitChallengeId)
          .single();

        if (!participation) {
          throw new Error('You must join the challenge before submitting');
        }

        // Create submission
        const { data: submission, error: submissionError } = await supabase
          .from('challenge_submissions')
          .insert({
            participation_id: participation.id,
            user_id: user.id,
            challenge_id: submitChallengeId,
            submission_text,
            photo_urls: photo_urls || [],
            submission_location_lat,
            submission_location_lng,
            submission_location_address
          })
          .select()
          .single();

        if (submissionError) throw submissionError;

        result = { submission, success: true, message: 'Submission created successfully' };
        break;

      case 'verify_submission':
        const { submission_id, verification_status: newStatus, verification_notes } = data;
        
        // Check if user has permission to verify
        const { data: submissionData } = await supabase
          .from('challenge_submissions')
          .select(`
            *,
            eco_challenges!inner (created_by)
          `)
          .eq('id', submission_id)
          .single();

        const { data: verifierProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (submissionData?.eco_challenges?.created_by !== user.id && 
            !['admin', 'ngo'].includes(verifierProfile?.role)) {
          throw new Error('Insufficient permissions to verify this submission');
        }

        const { error: verifyError } = await supabase
          .from('challenge_submissions')
          .update({
            verification_status: newStatus,
            verified_by: user.id,
            verified_at: new Date().toISOString(),
            verification_notes
          })
          .eq('id', submission_id);

        if (verifyError) throw verifyError;

        // If approved, update challenge progress
        if (newStatus === 'approved') {
          const { error: progressError } = await supabase
            .from('challenge_participations')
            .update({
              completed: true,
              completed_at: new Date().toISOString()
            })
            .eq('id', submissionData.participation_id);

          if (progressError) throw progressError;

          // Add to leaderboard
          const { error: leaderboardError } = await supabase
            .from('challenge_leaderboards')
            .upsert({
              challenge_id: submissionData.challenge_id,
              user_id: submissionData.user_id,
              score: 100,
              completed_at: new Date().toISOString()
            });

          if (leaderboardError) throw leaderboardError;
        }

        result = { success: true, message: 'Submission verified successfully' };
        break;

      case 'get_challenge_submissions':
        const { challenge_id: submissionsChallengeId } = data;
        
        // Check if user created the challenge or is admin
        const { data: challengeOwner } = await supabase
          .from('eco_challenges')
          .select('created_by')
          .eq('id', submissionsChallengeId)
          .single();

        const { data: requestorProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (challengeOwner?.created_by !== user.id && 
            !['admin', 'ngo'].includes(requestorProfile?.role)) {
          throw new Error('Insufficient permissions to view submissions');
        }

        const { data: submissions, error: submissionsError } = await supabase
          .from('challenge_submissions')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .eq('challenge_id', submissionsChallengeId)
          .order('created_at', { ascending: false });

        if (submissionsError) throw submissionsError;

        result = { submissions };
        break;

      case 'get_nearby_challenges':
        const { lat, lng, radius_km = 50 } = data;
        
        if (!lat || !lng) {
          throw new Error('Location coordinates are required');
        }

        // Use Supabase's PostGIS functions for distance calculation
        const { data: nearbyChallenges, error: nearbyError } = await supabase
          .from('eco_challenges')
          .select(`
            *,
            challenge_participations!left (
              current_progress,
              completed,
              joined_at
            )
          `)
          .eq('is_active', true)
          .not('location_lat', 'is', null)
          .not('location_lng', 'is', null)
          .eq('challenge_participations.user_id', user.id)
          .order('created_at', { ascending: false });

        if (nearbyError) throw nearbyError;

        // Filter by distance (simple calculation for now)
        const filteredChallenges = nearbyChallenges?.filter(challenge => {
          if (!challenge.location_lat || !challenge.location_lng) return false;
          
          const distance = getDistanceFromLatLonInKm(
            lat, lng, 
            challenge.location_lat, challenge.location_lng
          );
          
          return distance <= (challenge.location_radius_km || radius_km);
        }) || [];

        result = { challenges: filteredChallenges };
        break;

      case 'end_challenge':
        const { challenge_id: endChallengeId } = data;
        
        // Check if user created the challenge or is admin
        const { data: challengeData } = await supabase
          .from('eco_challenges')
          .select('created_by')
          .eq('id', endChallengeId)
          .single();

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (challengeData?.created_by !== user.id && userProfile?.role !== 'admin') {
          throw new Error('Insufficient permissions to end this challenge');
        }

        const { error: endError } = await supabase
          .from('eco_challenges')
          .update({
            is_active: false,
            end_date: new Date().toISOString()
          })
          .eq('id', endChallengeId);

        if (endError) throw endError;

        result = { success: true, message: 'Challenge ended successfully' };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Challenge action ${action} completed for user:`, user.id);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in challenge management:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});