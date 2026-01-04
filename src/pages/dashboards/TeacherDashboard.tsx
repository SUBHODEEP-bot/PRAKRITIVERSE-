import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  BarChart3, 
  Plus, 
  LogOut,
  Award,
  Target,
  PenTool
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Course = Database['public']['Tables']['eco_courses']['Row'];
type Challenge = Database['public']['Tables']['eco_challenges']['Row'];

const TeacherDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'beginner',
    duration_minutes: 30,
    points_reward: 10
  });

  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    challenge_type: 'individual',
    target_value: 1,
    points_reward: 20,
    end_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses created by teacher
      const { data: coursesData } = await supabase
        .from('eco_courses')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });
      
      if (coursesData) setCourses(coursesData);

      // Fetch challenges created by teacher
      const { data: challengesData } = await supabase
        .from('eco_challenges')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });
      
      if (challengesData) setChallenges(challengesData);

    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('eco_courses')
        .insert([{
          ...courseForm,
          created_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Course created successfully.",
      });

      setCourseForm({
        title: '',
        description: '',
        category: '',
        difficulty_level: 'beginner',
        duration_minutes: 30,
        points_reward: 10
      });
      setShowCourseForm(false);
      fetchTeacherData();
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('eco_challenges')
        .insert([{
          ...challengeForm,
          created_by: user?.id,
          end_date: challengeForm.end_date ? new Date(challengeForm.end_date).toISOString() : null
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Challenge created successfully.",
      });

      setChallengeForm({
        title: '',
        description: '',
        challenge_type: 'individual',
        target_value: 1,
        points_reward: 20,
        end_date: ''
      });
      setShowChallengeForm(false);
      fetchTeacherData();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-pulse">
          <GraduationCap className="h-12 w-12 text-blue-600 animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome, {profile?.full_name || user?.email}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <GraduationCap className="h-4 w-4 mr-2" />
              Teacher
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
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="challenges">My Challenges</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Courses Created</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courses.length}</div>
                  <p className="text-xs text-muted-foreground">Active courses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Challenges Created</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{challenges.length}</div>
                  <p className="text-xs text-muted-foreground">Active challenges</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Students Reached</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
                  <Award className="h-4 w-4 text-yellow-600" />
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
                  <CardTitle>Create New Course</CardTitle>
                  <CardDescription>Design engaging sustainability curriculum</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowCourseForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Create New Challenge</CardTitle>
                  <CardDescription>Motivate students with eco-challenges</CardDescription>
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

          <TabsContent value="courses">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Courses</h2>
                <Button 
                  onClick={() => setShowCourseForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>
              
              {showCourseForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateCourse} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                          id="title"
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={courseForm.category}
                            onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                            placeholder="e.g., Climate Change, Recycling"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="difficulty">Difficulty Level</Label>
                          <Select 
                            value={courseForm.difficulty_level}
                            onValueChange={(value) => setCourseForm({...courseForm, difficulty_level: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={courseForm.duration_minutes}
                            onChange={(e) => setCourseForm({...courseForm, duration_minutes: parseInt(e.target.value)})}
                            min="1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="points">Points Reward</Label>
                          <Input
                            id="points"
                            type="number"
                            value={courseForm.points_reward}
                            onChange={(e) => setCourseForm({...courseForm, points_reward: parseInt(e.target.value)})}
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                          Create Course
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowCourseForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <p className="text-gray-600">{course.description}</p>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{course.category}</Badge>
                            <Badge variant="secondary">{course.difficulty_level}</Badge>
                            <span className="text-sm text-gray-500">
                              {course.duration_minutes} minutes
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-100 text-blue-800">
                            +{course.points_reward} pts
                          </Badge>
                          <p className="text-sm text-gray-500 mt-2">
                            {course.is_published ? 'Published' : 'Draft'}
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
                <h2 className="text-2xl font-bold">My Challenges</h2>
                <Button 
                  onClick={() => setShowChallengeForm(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Challenge
                </Button>
              </div>
              
              {showChallengeForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Challenge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateChallenge} className="space-y-4">
                      <div>
                        <Label htmlFor="challenge-title">Challenge Title</Label>
                        <Input
                          id="challenge-title"
                          value={challengeForm.title}
                          onChange={(e) => setChallengeForm({...challengeForm, title: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="challenge-description">Description</Label>
                        <Textarea
                          id="challenge-description"
                          value={challengeForm.description}
                          onChange={(e) => setChallengeForm({...challengeForm, description: e.target.value})}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="challenge-type">Challenge Type</Label>
                          <Select 
                            value={challengeForm.challenge_type}
                            onValueChange={(value) => setChallengeForm({...challengeForm, challenge_type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">Individual</SelectItem>
                              <SelectItem value="team">Team</SelectItem>
                              <SelectItem value="class">Class</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="target-value">Target Value</Label>
                          <Input
                            id="target-value"
                            type="number"
                            value={challengeForm.target_value}
                            onChange={(e) => setChallengeForm({...challengeForm, target_value: parseInt(e.target.value)})}
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="challenge-points">Points Reward</Label>
                          <Input
                            id="challenge-points"
                            type="number"
                            value={challengeForm.points_reward}
                            onChange={(e) => setChallengeForm({...challengeForm, points_reward: parseInt(e.target.value)})}
                            min="1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="end-date">End Date (Optional)</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={challengeForm.end_date}
                            onChange={(e) => setChallengeForm({...challengeForm, end_date: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                          Create Challenge
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowChallengeForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {challenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{challenge.title}</h3>
                          <p className="text-gray-600">{challenge.description}</p>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{challenge.challenge_type}</Badge>
                            <span className="text-sm text-gray-500">
                              Target: {challenge.target_value}
                            </span>
                            {challenge.end_date && (
                              <span className="text-sm text-gray-500">
                                Ends: {new Date(challenge.end_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800">
                            +{challenge.points_reward} pts
                          </Badge>
                          <p className="text-sm text-gray-500 mt-2">
                            {challenge.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>View and manage your students (Coming Soon)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Student Management</h3>
                  <p className="text-gray-500">
                    Advanced student tracking and management features are coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>View detailed analytics and reports (Coming Soon)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-500">
                    Comprehensive analytics and reporting features are being developed.
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

export default TeacherDashboard;