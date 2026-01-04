import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Users, 
  Lightbulb, 
  Target, 
  BarChart3, 
  Plus, 
  LogOut,
  Globe,
  TreePine,
  Megaphone
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import CreateChallengeForm from '@/components/CreateChallengeForm';

type EcoTip = Database['public']['Tables']['eco_tips']['Row'];
type Challenge = Database['public']['Tables']['eco_challenges']['Row'];

const NGODashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [ecoTips, setEcoTips] = useState<EcoTip[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTipForm, setShowTipForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);

  // Form states
  const [tipForm, setTipForm] = useState({
    title: '',
    content: '',
    category: '',
    difficulty_level: 'beginner',
    points_value: 10,
    estimated_impact: ''
  });

  useEffect(() => {
    if (user) {
      fetchNGOData();
    }
  }, [user]);

  const fetchNGOData = async () => {
    try {
      setLoading(true);
      
      // Fetch eco tips created by NGO
      const { data: tipsData } = await supabase
        .from('eco_tips')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });
      
      if (tipsData) setEcoTips(tipsData);

      // Fetch challenges created by NGO
      const { data: challengesData } = await supabase
        .from('eco_challenges')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });
      
      if (challengesData) setChallenges(challengesData);

    } catch (error) {
      console.error('Error fetching NGO data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('eco_tips')
        .insert([{
          ...tipForm,
          created_by: user?.id,
          tags: tipForm.category ? [tipForm.category] : []
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Eco tip created successfully.",
      });

      setTipForm({
        title: '',
        content: '',
        category: '',
        difficulty_level: 'beginner',
        points_value: 10,
        estimated_impact: ''
      });
      setShowTipForm(false);
      fetchNGOData();
    } catch (error) {
      console.error('Error creating tip:', error);
      toast({
        title: "Error",
        description: "Failed to create eco tip. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="h-12 w-12 text-orange-600 animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              NGO Impact Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome, {profile?.full_name || user?.email}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Heart className="h-4 w-4 mr-2" />
              NGO Member
            </Badge>
            <Button
              onClick={signOut}
              variant="outline"
              className="text-gray-600 hover:text-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tips">Eco Tips</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eco Tips Shared</CardTitle>
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ecoTips.length}</div>
                  <p className="text-xs text-muted-foreground">Knowledge shared</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Challenges Created</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{challenges.length}</div>
                  <p className="text-xs text-muted-foreground">Community challenges</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Community Reach</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Environmental Impact</CardTitle>
                  <Globe className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Share Eco Knowledge</CardTitle>
                  <CardDescription>Create educational content for the community</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowTipForm(true)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Eco Tip
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Launch Community Challenge</CardTitle>
                  <CardDescription>Mobilize communities for environmental action</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowChallengeForm(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Challenge
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tips">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Eco Tips Management</h2>
                <Button 
                  onClick={() => setShowTipForm(true)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Eco Tip
                </Button>
              </div>
              
              {/* Eco tips display content here */}
              <div className="grid gap-4">
                {ecoTips.map((tip) => (
                  <Card key={tip.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{tip.title}</h3>
                          <p className="text-gray-600">{tip.content}</p>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{tip.category}</Badge>
                            <Badge variant="secondary">{tip.difficulty_level}</Badge>
                            {tip.estimated_impact && (
                              <span className="text-sm text-gray-500">
                                Impact: {tip.estimated_impact}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            +{tip.points_value} pts
                          </Badge>
                          <p className="text-sm text-gray-500 mt-2">
                            {tip.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="challenges">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Community Challenges</h2>
                <Button 
                  onClick={() => setShowChallengeForm(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Challenge
                </Button>
              </div>
              
              {showChallengeForm && (
                <div className="mb-6">
                  <CreateChallengeForm onSuccess={() => {
                    setShowChallengeForm(false);
                    fetchNGOData();
                  }} />
                </div>
              )}

              <div className="space-y-4">
                {challenges.length === 0 ? (
                  <Card className="text-center p-8">
                    <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Challenges Created</h3>
                    <p className="text-muted-foreground">Create your first environmental challenge for the community!</p>
                  </Card>
                ) : (
                  challenges.map((challenge) => (
                    <Card key={challenge.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold text-lg">{challenge.title}</h3>
                            <p className="text-gray-600">{challenge.description}</p>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">{challenge.challenge_type}</Badge>
                              <Badge variant="secondary">Target: {challenge.target_value}</Badge>
                              {challenge.location_address && (
                                <Badge variant="outline" className="text-xs">
                                  📍 {challenge.location_address}
                                </Badge>
                              )}
                            </div>
                            {challenge.end_date && (
                              <p className="text-sm text-gray-500">
                                Ends: {new Date(challenge.end_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-2">
                            <Badge className={challenge.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {challenge.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <p className="text-sm text-gray-500">
                              +{challenge.points_reward} pts
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="community">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Community Engagement</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="text-lg font-semibold mb-2">Community Features</h3>
                    <p className="text-gray-600 mb-4">
                      Connect with community leaders and track engagement
                    </p>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="impact">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Environmental Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Impact Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Track the environmental impact of your initiatives
                    </p>
                    <Badge variant="outline">Coming Soon</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TreePine className="h-5 w-5 mr-2" />
                      Carbon Footprint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Measure carbon reduction from community actions
                    </p>
                    <Badge variant="outline">Coming Soon</Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NGODashboard;