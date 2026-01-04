import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: string;
  event_name: string;
  properties?: Record<string, any>;
  page_url?: string;
}

export const useAnalytics = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);

  const trackEvent = async (event: AnalyticsEvent) => {
    if (!session || !user) return;

    try {
      setLoading(true);

      const { error } = await supabase.functions.invoke('backend-api', {
        body: {
          action: 'record_analytics_event',
          data: {
            ...event,
            page_url: event.page_url || window.location.href
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackPageView = async (page: string) => {
    await trackEvent({
      event_type: 'page_view',
      event_name: 'page_viewed',
      properties: { page },
      page_url: window.location.href
    });
  };

  const trackUserAction = async (action: string, properties?: Record<string, any>) => {
    await trackEvent({
      event_type: 'user_action',
      event_name: action,
      properties
    });
  };

  const trackEcoAction = async (actionType: string, points: number) => {
    await trackEvent({
      event_type: 'eco_action',
      event_name: 'eco_action_completed',
      properties: { action_type: actionType, points }
    });
  };

  const trackPetInteraction = async (interactionType: string) => {
    await trackEvent({
      event_type: 'pet_interaction',
      event_name: 'pet_interaction',
      properties: { interaction_type: interactionType }
    });
  };

  const trackCourseProgress = async (courseId: string, moduleId: string, completed: boolean) => {
    await trackEvent({
      event_type: 'course_progress',
      event_name: completed ? 'module_completed' : 'module_started',
      properties: { course_id: courseId, module_id: moduleId }
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackEcoAction,
    trackPetInteraction,
    trackCourseProgress,
    loading
  };
};