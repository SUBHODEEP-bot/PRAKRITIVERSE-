import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Starting profile fetch for user:', userId);
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('Profile fetch completed in:', Date.now() - startTime, 'ms');

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listeners');
    let profileFetchController: AbortController | null = null;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session);
        
        // Cancel any pending profile fetch
        if (profileFetchController) {
          profileFetchController.abort();
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // Set loading to false immediately for faster UI
        
        if (session?.user) {
          // Create new controller for this fetch
          profileFetchController = new AbortController();
          
          // Fetch profile in background without blocking UI
          setTimeout(async () => {
            try {
              if (!profileFetchController?.signal.aborted) {
                await fetchProfile(session.user.id);
              }
            } catch (error) {
              if (!profileFetchController?.signal.aborted) {
                console.error('Background profile fetch failed:', error);
              }
            }
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    console.log('AuthProvider: Checking existing session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session found:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // Set loading to false immediately
      
      if (session?.user) {
        profileFetchController = new AbortController();
        setTimeout(async () => {
          try {
            if (!profileFetchController?.signal.aborted) {
              await fetchProfile(session.user.id);
            }
          } catch (error) {
            if (!profileFetchController?.signal.aborted) {
              console.error('Initial profile fetch failed:', error);
            }
          }
        }, 0);
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up');
      subscription.unsubscribe();
      if (profileFetchController) {
        profileFetchController.abort();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Navigate to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};