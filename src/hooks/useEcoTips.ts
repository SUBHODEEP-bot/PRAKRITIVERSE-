import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type EcoTip = Database['public']['Tables']['eco_tips']['Row'];

export const useEcoTips = (category?: string) => {
  const { user, session } = useAuth();
  const [tips, setTips] = useState<EcoTip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTips = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('backend-api', {
        body: {
          action: 'get_eco_tips',
          data: { category, limit: 10 }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      setTips(data.tips || []);
    } catch (error) {
      console.error('Error fetching eco tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedTips = async (count: number = 3) => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('generate-eco-tips', {
        body: {
          category: category || 'general',
          count
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      return data.tips || [];
    } catch (error) {
      console.error('Error generating personalized tips:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchTips();
    }
  }, [user, session, category]);

  return {
    tips,
    loading,
    refresh: fetchTips,
    generatePersonalizedTips
  };
};