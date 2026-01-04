import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, Leaf, Award } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: 'challenge' | 'achievement' | 'tip' | 'general';
  created_at: string;
  user_name?: string;
}

const NewsFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNewsFeed();
    }
  }, [user]);

  const fetchNewsFeed = async () => {
    try {
      setLoading(true);
      
      // Fetch recent challenges
      const { data: challenges } = await supabase
        .from('eco_challenges')
        .select('id, title, description, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('id, title, description, earned_at, user_id')
        .order('earned_at', { ascending: false })
        .limit(5);

      // Fetch recent eco tips
      const { data: tips } = await supabase
        .from('eco_tips')
        .select('id, title, content, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and format news items
      const combinedNews: NewsItem[] = [
        ...(challenges || []).map(item => ({
          id: `challenge-${item.id}`,
          title: `New Challenge: ${item.title}`,
          content: item.description || '',
          type: 'challenge' as const,
          created_at: item.created_at
        })),
        ...(achievements || []).map(item => ({
          id: `achievement-${item.id}`,
          title: `Achievement Unlocked: ${item.title}`,
          content: item.description || '',
          type: 'achievement' as const,
          created_at: item.earned_at,
          user_name: 'Someone'
        })),
        ...(tips || []).map(item => ({
          id: `tip-${item.id}`,
          title: `Eco Tip: ${item.title}`,
          content: item.content,
          type: 'tip' as const,
          created_at: item.created_at
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNewsItems(combinedNews);
    } catch (error) {
      console.error('Error fetching news feed:', error);
      toast({
        title: "Error",
        description: "Failed to load news feed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'challenge': return <Users className="h-4 w-4" />;
      case 'achievement': return <Award className="h-4 w-4" />;
      case 'tip': return <Leaf className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'challenge': return 'default';
      case 'achievement': return 'secondary';
      case 'tip': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">News Feed</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">News Feed</h2>
      <div className="space-y-4">
        {newsItems.length > 0 ? (
          newsItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(item.type)}
                    <CardTitle className="text-sm">{item.title}</CardTitle>
                  </div>
                  <Badge variant={getBadgeVariant(item.type)}>
                    {item.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm">
                  {item.content.length > 100 
                    ? `${item.content.substring(0, 100)}...` 
                    : item.content
                  }
                </CardDescription>
                <div className="flex items-center justify-between mt-3">
                  {item.user_name && (
                    <span className="text-xs text-muted-foreground">
                      by {item.user_name}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No recent activity to show</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;