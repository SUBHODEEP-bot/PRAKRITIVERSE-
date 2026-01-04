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
  Bell,
  Menu,
  Home,
  Gamepad2,
  Brain,
  GraduationCap,
  Rss
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { AIChat } from '@/components/AIChat';
import { EcoActionForm } from '@/components/EcoActionForm';
import { Leaderboard } from '@/components/Leaderboard';
import { NotificationCenter } from '@/components/NotificationCenter';
import { EcoTipsDisplay } from '@/components/EcoTipsDisplay';
import EnhancedChallengesDisplay from '@/components/EnhancedChallengesDisplay';
import QuizComponent from '@/components/QuizComponent';
import GameComponent from '@/components/GameComponent';
import ModuleComponent from '@/components/ModuleComponent';
import NewsFeed from '@/components/NewsFeed';
import EcoPetShowcase from '@/components/EcoPetShowcase';

type EcoPet = Database['public']['Tables']['eco_pets']['Row'];
type EcoAction = Database['public']['Tables']['eco_actions']['Row'];
type Achievement = Database['public']['Tables']['achievements']['Row'];
type Course = Database['public']['Tables']['eco_courses']['Row'];

const StudentDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [ecoPet, setEcoPet] = useState<EcoPet | null>(null);
  const [recentActions, setRecentActions] = useState<EcoAction[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch eco pet
      const { data: petData } = await supabase
        .from('eco_pets')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (petData) setEcoPet(petData);

      // Fetch recent actions
      const { data: actionsData } = await supabase
        .from('eco_actions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (actionsData) setRecentActions(actionsData);

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false });
      
      if (achievementsData) setAchievements(achievementsData);

      // Fetch available courses
      const { data: coursesData } = await supabase
        .from('eco_courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (coursesData) setCourses(coursesData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const feedEcoPet = async () => {
    try {
      const { error } = await supabase.rpc('update_eco_pet_stats', {
        _user_id: user?.id,
        _points: 10
      });

      if (error) throw error;

      // Refresh pet data
      const { data: petData } = await supabase
        .from('eco_pets')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (petData) setEcoPet(petData);

      toast({
        title: "Pet Fed! 🌱",
        description: "Your eco-pet loves the attention and grew stronger!",
      });
    } catch (error) {
      console.error('Error feeding pet:', error);
      toast({
        title: "Error",
        description: "Failed to feed your pet. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse">
          <Leaf className="h-12 w-12 text-green-600 animate-bounce" />
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'ecopet', label: 'Eco Pet', icon: Leaf },
    { id: 'actions', label: 'Actions', icon: Target },
    { id: 'tips', label: 'Tips', icon: BookOpen },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award },
    { id: 'newsfeed', label: 'News Feed', icon: Rss },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">EcoLearn</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSidebarItem === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSidebarItem(activeSidebarItem === item.id ? null : item.id)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {profile?.full_name || user?.email}!
                  </h1>
                  <p className="text-gray-600 text-sm">Your eco-journey continues here</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  Eco Score: {profile?.eco_score || 0}
                </Badge>
                <NotificationCenter />
                <Button
                  onClick={() => setShowChat(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  AI Coach
                </Button>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
            {activeSidebarItem ? (
              <div>
                {activeSidebarItem === 'ecopet' && (
                  <EcoPetShowcase />
                )}
                {activeSidebarItem === 'actions' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Your Eco Actions</h2>
                      <Button 
                        onClick={() => setShowActionForm(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Action
                      </Button>
                    </div>
                    
                    <div className="grid gap-4">
                      {recentActions.map((action) => (
                        <Card key={action.id}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-lg">{action.title}</h3>
                                <p className="text-gray-600">{action.description}</p>
                                <div className="flex items-center gap-4">
                                  <Badge variant="outline">{action.action_type}</Badge>
                                  <span className="text-sm text-gray-500">
                                    {new Date(action.created_at).toLocaleDateString()}
                                  </span>
                                  {action.location && (
                                    <span className="text-sm text-gray-500">📍 {action.location}</span>
                                  )}
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-800">
                                +{action.points_earned} pts
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {activeSidebarItem === 'tips' && <EcoTipsDisplay />}
                {activeSidebarItem === 'leaderboard' && <Leaderboard />}
                {activeSidebarItem === 'newsfeed' && <NewsFeed />}
              </div>
            ) : (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="challenges" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Challenges
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Quiz
                  </TabsTrigger>
                  <TabsTrigger value="games" className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4" />
                    Games
                  </TabsTrigger>
                  <TabsTrigger value="modules" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Modules
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{profile?.total_points || 0}</div>
                        <p className="text-xs text-muted-foreground">Lifetime earned</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pet Level</CardTitle>
                        <Leaf className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{ecoPet?.level || 1}</div>
                        <p className="text-xs text-muted-foreground">{ecoPet?.name || 'Leafy'}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                        <Award className="h-4 w-4 text-yellow-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{achievements.length}</div>
                        <p className="text-xs text-muted-foreground">Badges earned</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Actions</CardTitle>
                        <Target className="h-4 w-4 text-blue-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{recentActions.length}</div>
                        <p className="text-xs text-muted-foreground">Eco actions taken</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Eco Actions</CardTitle>
                      <CardDescription>Your latest contributions to the environment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recentActions.length > 0 ? (
                        <div className="space-y-4">
                          {recentActions.map((action) => (
                            <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-semibold">{action.title}</h4>
                                <p className="text-sm text-gray-600">{action.description}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(action.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="secondary">+{action.points_earned} pts</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No eco actions yet. Start your journey today!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="challenges">
                  <EnhancedChallengesDisplay />
                </TabsContent>

                <TabsContent value="quiz">
                  <QuizComponent />
                </TabsContent>

                <TabsContent value="games">
                  <GameComponent />
                </TabsContent>

                <TabsContent value="modules">
                  <ModuleComponent />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showChat && <AIChat isOpen={showChat} onClose={() => setShowChat(false)} />}
      {showActionForm && <EcoActionForm isOpen={showActionForm} onClose={() => setShowActionForm(false)} onSuccess={() => { setShowActionForm(false); fetchDashboardData(); }} />}
    </div>
  );
};

export default StudentDashboard;