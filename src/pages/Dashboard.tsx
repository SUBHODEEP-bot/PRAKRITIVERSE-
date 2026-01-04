import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Leaf, 
  Heart, 
  Zap, 
  TrendingUp, 
  Award, 
  MessageCircle,
  BookOpen,
  Target,
  LogOut,
  Plus,
  Bell
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { AIChat } from '@/components/AIChat';
import { EcoActionForm } from '@/components/EcoActionForm';
import { Leaderboard } from '@/components/Leaderboard';
import { NotificationCenter } from '@/components/NotificationCenter';
import { EcoTipsDisplay } from '@/components/EcoTipsDisplay';
import { ChallengesDisplay } from '@/components/ChallengesDisplay';

type EcoPet = Database['public']['Tables']['eco_pets']['Row'];
type EcoAction = Database['public']['Tables']['eco_actions']['Row'];
type Achievement = Database['public']['Tables']['achievements']['Row'];
type Course = Database['public']['Tables']['eco_courses']['Row'];

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [ecoPet, setEcoPet] = useState<EcoPet | null>(null);
  const [recentActions, setRecentActions] = useState<EcoAction[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch eco pet
      const { data: petData } = await supabase
        .from('eco_pets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setEcoPet(petData);

      // Fetch recent actions
      const { data: actionsData } = await supabase
        .from('eco_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentActions(actionsData || []);

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      setAchievements(achievementsData || []);

      // Fetch available courses
      const { data: coursesData } = await supabase
        .from('eco_courses')
        .select('*')
        .eq('is_published', true)
        .limit(6);
      
      setCourses(coursesData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const feedEcoPet = async () => {
    if (!user || !ecoPet) return;

    try {
      // Call the function to update eco pet stats
      const { error } = await supabase.rpc('update_eco_pet_stats', {
        _user_id: user.id,
        _points: 10
      });

      if (error) throw error;

      // Refresh the eco pet data
      const { data: updatedPet } = await supabase
        .from('eco_pets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setEcoPet(updatedPet);

      toast({
        title: "Pet Fed!",
        description: "Your eco-pet is happy and growing stronger!"
      });
    } catch (error) {
      console.error('Error feeding pet:', error);
      toast({
        title: "Error",
        description: "Failed to feed your eco-pet",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Leaf className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your eco-dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800">
              Welcome back, {profile?.full_name || user?.email}!
            </h1>
            <p className="text-gray-600">Your eco-journey continues here</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Eco Score: {profile?.eco_score || 0}
            </Badge>
            <NotificationCenter />
            <Button onClick={() => setShowChat(true)} variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Coach
            </Button>
            <Button onClick={signOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pet">Eco Pet</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.total_points || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pet Level</CardTitle>
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ecoPet?.level || 1}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{achievements.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Actions Taken</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentActions.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Eco Actions</CardTitle>
                <CardDescription>Your latest environmental activities</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActions.length > 0 ? (
                  <div className="space-y-3">
                    {recentActions.map((action) => (
                      <div key={action.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                        <Badge>{action.points_earned} pts</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No actions recorded yet. Start your eco-journey!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-6 w-6 text-green-600 mr-2" />
                  {ecoPet?.name || 'Leafy'} - Level {ecoPet?.level || 1}
                </CardTitle>
                <CardDescription>Your virtual eco-companion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pet Image Placeholder */}
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center">
                    <Leaf className="h-16 w-16 text-green-600" />
                  </div>
                </div>

                {/* Pet Stats */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 text-red-500 mr-2" />
                        Health
                      </span>
                      <span>{ecoPet?.health || 85}%</span>
                    </div>
                    <Progress value={ecoPet?.health || 85} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                        Energy
                      </span>
                      <span>{ecoPet?.energy || 92}%</span>
                    </div>
                    <Progress value={ecoPet?.energy || 92} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                        Growth
                      </span>
                      <span>{ecoPet?.growth || 76}%</span>
                    </div>
                    <Progress value={ecoPet?.growth || 76} className="h-2" />
                  </div>
                </div>

                <Button onClick={feedEcoPet} className="w-full">
                  Feed with Eco-Actions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Eco Actions</h2>
              <Button onClick={() => setShowActionForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </div>
            
            <div className="grid gap-4">
              {recentActions.map((action) => (
                <Card key={action.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(action.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={action.verified ? "default" : "secondary"}>
                        {action.points_earned} pts
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <h2 className="text-2xl font-bold">Available Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      {course.title}
                    </CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="outline">{course.category}</Badge>
                      <span className="text-sm text-gray-500">{course.duration_minutes} min</span>
                    </div>
                    <Button className="w-full">
                      Start Course ({course.points_reward} pts)
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-6">
            <EcoTipsDisplay />
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <ChallengesDisplay />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chat Modal */}
      {showChat && (
        <AIChat 
          isOpen={showChat} 
          onClose={() => setShowChat(false)} 
        />
      )}

      {/* Eco Action Form Modal */}
      {showActionForm && (
        <EcoActionForm
          isOpen={showActionForm}
          onClose={() => setShowActionForm(false)}
          onSuccess={() => {
            setShowActionForm(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;