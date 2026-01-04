import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  Database, 
  BarChart3, 
  Settings, 
  LogOut,
  Crown,
  Activity,
  Globe,
  TrendingUp
} from 'lucide-react';
import { Database as DatabaseType } from '@/integrations/supabase/types';

type Profile = DatabaseType['public']['Tables']['profiles']['Row'];
type EcoAction = DatabaseType['public']['Tables']['eco_actions']['Row'];
type Course = DatabaseType['public']['Tables']['eco_courses']['Row'];
type Challenge = DatabaseType['public']['Tables']['eco_challenges']['Row'];

const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [recentActions, setRecentActions] = useState<EcoAction[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActions: 0,
    totalCourses: 0,
    totalChallenges: 0,
    studentsCount: 0,
    teachersCount: 0,
    ngoCount: 0,
    institutionCount: 0
  });

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users/profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesData) {
        setUsers(profilesData);
        setStats(prev => ({
          ...prev,
          totalUsers: profilesData.length,
          studentsCount: profilesData.filter(p => p.role === 'student').length,
          teachersCount: profilesData.filter(p => p.role === 'teacher').length,
          ngoCount: profilesData.filter(p => p.role === 'ngo').length,
          institutionCount: profilesData.filter(p => p.role === 'institution').length,
        }));
      }

      // Fetch recent eco actions
      const { data: actionsData } = await supabase
        .from('eco_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (actionsData) {
        setRecentActions(actionsData);
      }

      // Fetch all actions count
      const { count: actionsCount } = await supabase
        .from('eco_actions')
        .select('*', { count: 'exact', head: true });

      // Fetch all courses
      const { data: coursesData, count: coursesCount } = await supabase
        .from('eco_courses')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      if (coursesData) setCourses(coursesData);

      // Fetch all challenges
      const { data: challengesData, count: challengesCount } = await supabase
        .from('eco_challenges')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      if (challengesData) setChallenges(challengesData);

      setStats(prev => ({
        ...prev,
        totalActions: actionsCount || 0,
        totalCourses: coursesCount || 0,
        totalChallenges: challengesCount || 0
      }));

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'ngo': return 'bg-orange-100 text-orange-800';
      case 'institution': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="animate-pulse">
          <Shield className="h-12 w-12 text-red-600 animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              System Administration
            </h1>
            <p className="text-gray-600 mt-1">Welcome, {profile?.full_name || user?.email}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Crown className="h-4 w-4 mr-2" />
              System Admin
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
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eco Actions</CardTitle>
                  <Activity className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalActions}</div>
                  <p className="text-xs text-muted-foreground">Total actions logged</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Content Created</CardTitle>
                  <Database className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCourses + stats.totalChallenges}</div>
                  <p className="text-xs text-muted-foreground">Courses & challenges</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98%</div>
                  <p className="text-xs text-muted-foreground">System uptime</p>
                </CardContent>
              </Card>
            </div>

            {/* User Role Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Role Distribution</CardTitle>
                  <CardDescription>Breakdown of user types on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Students
                      </span>
                      <span className="font-semibold">{stats.studentsCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Teachers
                      </span>
                      <span className="font-semibold">{stats.teachersCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        NGO Members
                      </span>
                      <span className="font-semibold">{stats.ngoCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        Institutions
                      </span>
                      <span className="font-semibold">{stats.institutionCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest eco actions on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActions.slice(0, 5).map((action) => (
                      <div key={action.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium truncate max-w-48">{action.title}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(action.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          +{action.points_earned}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
                <Badge variant="outline">{users.length} Total Users</Badge>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Eco Score</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name || 'N/A'}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.eco_score}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Content Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Courses</CardTitle>
                    <CardDescription>{courses.length} courses available</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {courses.map((course) => (
                        <div key={course.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium truncate max-w-48">{course.title}</p>
                            <p className="text-sm text-gray-500">{course.category}</p>
                          </div>
                          <Badge variant={course.is_published ? "default" : "secondary"}>
                            {course.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Challenges</CardTitle>
                    <CardDescription>{challenges.length} challenges created</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {challenges.map((challenge) => (
                        <div key={challenge.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium truncate max-w-48">{challenge.title}</p>
                            <p className="text-sm text-gray-500">{challenge.challenge_type}</p>
                          </div>
                          <Badge variant={challenge.is_active ? "default" : "secondary"}>
                            {challenge.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>Comprehensive platform analytics and reporting (Coming Soon)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Advanced Analytics</h3>
                  <p className="text-gray-500">
                    Detailed platform analytics, user engagement metrics, and system performance reports are being developed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Platform configuration and system management (Coming Soon)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">System Configuration</h3>
                  <p className="text-gray-500">
                    Advanced system settings, security configurations, and platform management tools are coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;