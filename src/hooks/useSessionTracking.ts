import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SessionData {
  session_id: string;
  start_time: Date;
}

export const useSessionTracking = () => {
  const { user, session } = useAuth();
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);

  const startSession = useCallback(async () => {
    if (!session || !user || currentSession) return;

    try {
      setLoading(true);

      const deviceInfo = {
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      };

      const { data, error } = await supabase.functions.invoke('backend-api', {
        body: {
          action: 'start_session',
          data: { device_info: deviceInfo }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      const sessionData = {
        session_id: data.session_id,
        start_time: new Date()
      };

      setCurrentSession(sessionData);
      
      // Store in sessionStorage for persistence across page reloads
      sessionStorage.setItem('eco_session', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setLoading(false);
    }
  }, [session, user, currentSession]);

  const endSession = useCallback(async () => {
    if (!session || !currentSession) return;

    try {
      const { error } = await supabase.functions.invoke('backend-api', {
        body: {
          action: 'end_session',
          data: { session_id: currentSession.session_id }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      setCurrentSession(null);
      sessionStorage.removeItem('eco_session');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [session, currentSession]);

  // Initialize session when user logs in
  useEffect(() => {
    if (user && session && !currentSession) {
      // Check if there's an existing session in sessionStorage
      const storedSession = sessionStorage.getItem('eco_session');
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          setCurrentSession({
            ...parsed,
            start_time: new Date(parsed.start_time)
          });
        } catch (error) {
          // Invalid stored session, start a new one
          startSession();
        }
      } else {
        startSession();
      }
    }
  }, [user, session, currentSession, startSession]);

  // End session when user logs out or closes the browser
  useEffect(() => {
    if (!user && currentSession) {
      endSession();
    }
  }, [user, currentSession, endSession]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSession) {
        // Use sendBeacon for reliable session ending on page unload
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yeixatqmspytlkiwiajl.supabase.co';
        navigator.sendBeacon(
          `${SUPABASE_URL}/functions/v1/backend-api`,
          JSON.stringify({
            action: 'end_session',
            data: { session_id: currentSession.session_id }
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentSession]);

  const getSessionDuration = () => {
    if (!currentSession) return 0;
    return Math.floor((Date.now() - currentSession.start_time.getTime()) / 1000 / 60); // minutes
  };

  return {
    currentSession,
    loading,
    startSession,
    endSession,
    getSessionDuration
  };
};