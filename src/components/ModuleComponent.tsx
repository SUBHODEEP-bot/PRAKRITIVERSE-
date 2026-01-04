import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  Clock,
  Star,
  Award,
  Users,
  Target
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  lessons: Lesson[];
  points_reward: number;
  prerequisites: string[];
  is_locked: boolean;
  progress: number;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'interactive' | 'quiz';
  duration: number;
  completed: boolean;
  content?: string;
}

interface UserProgress {
  module_id: string;
  completed_lessons: string[];
  progress_percentage: number;
  completed: boolean;
}

const ModuleComponent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchModulesAndProgress();
    }
  }, [user]);

  const fetchModulesAndProgress = async () => {
    try {
      setLoading(true);
      
      // Mock data for modules since we don't have a modules table yet
      const mockModules: Module[] = [
        {
          id: '1',
          title: 'Climate Change Fundamentals',
          description: 'Understanding the basics of climate change, its causes, and effects on our planet.',
          category: 'Climate Science',
          difficulty: 'Beginner',
          duration: 45,
          points_reward: 100,
          prerequisites: [],
          is_locked: false,
          progress: 0,
          lessons: [
            {
              id: '1-1',
              title: 'What is Climate Change?',
              type: 'video',
              duration: 10,
              completed: false,
              content: 'Introduction to climate change concepts and terminology.'
            },
            {
              id: '1-2',
              title: 'Greenhouse Effect Explained',
              type: 'reading',
              duration: 15,
              completed: false,
              content: 'Detailed explanation of how greenhouse gases trap heat in the atmosphere.'
            },
            {
              id: '1-3',
              title: 'Interactive Climate Model',
              type: 'interactive',
              duration: 15,
              completed: false,
              content: 'Hands-on exploration of climate variables and their interactions.'
            },
            {
              id: '1-4',
              title: 'Knowledge Check',
              type: 'quiz',
              duration: 5,
              completed: false,
              content: 'Test your understanding of climate change fundamentals.'
            }
          ]
        },
        {
          id: '2',
          title: 'Renewable Energy Systems',
          description: 'Explore different types of renewable energy and their applications in modern society.',
          category: 'Energy',
          difficulty: 'Intermediate',
          duration: 60,
          points_reward: 150,
          prerequisites: ['1'],
          is_locked: true,
          progress: 0,
          lessons: [
            {
              id: '2-1',
              title: 'Solar Power Technology',
              type: 'video',
              duration: 15,
              completed: false
            },
            {
              id: '2-2',
              title: 'Wind Energy Principles',
              type: 'reading',
              duration: 20,
              completed: false
            },
            {
              id: '2-3',
              title: 'Energy Storage Solutions',
              type: 'interactive',
              duration: 20,
              completed: false
            },
            {
              id: '2-4',
              title: 'Renewable Energy Quiz',
              type: 'quiz',
              duration: 5,
              completed: false
            }
          ]
        },
        {
          id: '3',
          title: 'Sustainable Living Practices',
          description: 'Learn practical ways to reduce your environmental impact in daily life.',
          category: 'Lifestyle',
          difficulty: 'Beginner',
          duration: 40,
          points_reward: 120,
          prerequisites: [],
          is_locked: false,
          progress: 0,
          lessons: [
            {
              id: '3-1',
              title: 'Reducing Household Waste',
              type: 'video',
              duration: 12,
              completed: false
            },
            {
              id: '3-2',
              title: 'Water Conservation at Home',
              type: 'reading',
              duration: 15,
              completed: false
            },
            {
              id: '3-3',
              title: 'Sustainable Transportation',
              type: 'interactive',
              duration: 10,
              completed: false
            },
            {
              id: '3-4',
              title: 'Lifestyle Assessment',
              type: 'quiz',
              duration: 3,
              completed: false
            }
          ]
        },
        {
          id: '4',
          title: 'Ecosystem Conservation',
          description: 'Understanding ecosystems and the importance of biodiversity conservation.',
          category: 'Conservation',
          difficulty: 'Advanced',
          duration: 75,
          points_reward: 200,
          prerequisites: ['1', '3'],
          is_locked: true,
          progress: 0,
          lessons: [
            {
              id: '4-1',
              title: 'Biodiversity and Ecosystems',
              type: 'video',
              duration: 20,
              completed: false
            },
            {
              id: '4-2',
              title: 'Threats to Biodiversity',
              type: 'reading',
              duration: 25,
              completed: false
            },
            {
              id: '4-3',
              title: 'Conservation Strategies',
              type: 'interactive',
              duration: 25,
              completed: false
            },
            {
              id: '4-4',
              title: 'Conservation Challenge',
              type: 'quiz',
              duration: 5,
              completed: false
            }
          ]
        }
      ];

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('enrollment_id', user?.id);

      // Update modules with progress and unlock status
      const updatedModules = mockModules.map(module => {
        const progress = progressData?.filter(p => p.module_id === module.id) || [];
        const completedLessons = progress.filter(p => p.completed).length;
        const progressPercentage = (completedLessons / module.lessons.length) * 100;
        
        // Check if prerequisites are met
        const prerequisitesMet = module.prerequisites.every(prereqId => {
          const prereqModule = mockModules.find(m => m.id === prereqId);
          if (!prereqModule) return true;
          const prereqProgress = progressData?.filter(p => p.module_id === prereqId) || [];
          const prereqCompleted = prereqProgress.filter(p => p.completed).length;
          return prereqCompleted === prereqModule.lessons.length;
        });

        return {
          ...module,
          progress: progressPercentage,
          is_locked: !prerequisitesMet,
          lessons: module.lessons.map(lesson => ({
            ...lesson,
            completed: progress.some(p => p.module_id === lesson.id && p.completed)
          }))
        };
      });

      setModules(updatedModules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast({
        title: "Error",
        description: "Failed to load learning modules. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startModule = (module: Module) => {
    if (module.is_locked) {
      toast({
        title: "Module Locked",
        description: "Complete the required prerequisites to unlock this module.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentModule(module);
    const firstIncompleteLesson = module.lessons.find(lesson => !lesson.completed);
    if (firstIncompleteLesson) {
      setCurrentLesson(firstIncompleteLesson);
    }
  };

  const completeLesson = async (lesson: Lesson) => {
    try {
      // In a real app, this would update the database
      // For now, we'll just show success and update local state
      
      if (currentModule) {
        const updatedLessons = currentModule.lessons.map(l => 
          l.id === lesson.id ? { ...l, completed: true } : l
        );
        
        const completedCount = updatedLessons.filter(l => l.completed).length;
        const progress = (completedCount / updatedLessons.length) * 100;
        
        const updatedModule = {
          ...currentModule,
          lessons: updatedLessons,
          progress
        };
        
        setCurrentModule(updatedModule);
        
        // Update modules list
        setModules(prev => prev.map(m => 
          m.id === updatedModule.id ? updatedModule : m
        ));
        
        // Find next lesson
        const nextLesson = updatedLessons.find(l => !l.completed);
        if (nextLesson) {
          setCurrentLesson(nextLesson);
        } else {
          // Module completed
          toast({
            title: "Module Completed! 🎉",
            description: `You earned ${currentModule.points_reward} points for completing ${currentModule.title}!`,
          });
          setCurrentModule(null);
          setCurrentLesson(null);
        }
        
        toast({
          title: "Lesson Completed!",
          description: `You've completed "${lesson.title}". Great job!`,
        });
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Error",
        description: "Failed to save lesson progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return PlayCircle;
      case 'reading': return BookOpen;
      case 'interactive': return Target;
      case 'quiz': return Award;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (currentModule && currentLesson) {
    const LessonIcon = getLessonIcon(currentLesson.type);
    const completedLessons = currentModule.lessons.filter(l => l.completed).length;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{currentModule.title}</h2>
            <p className="text-muted-foreground">
              Lesson {completedLessons + 1} of {currentModule.lessons.length}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setCurrentModule(null);
              setCurrentLesson(null);
            }}
          >
            Back to Modules
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <LessonIcon className="h-5 w-5" />
                {currentLesson.title}
              </CardTitle>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {currentLesson.duration} min
              </Badge>
            </div>
            <Progress value={(completedLessons / currentModule.lessons.length) * 100} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="min-h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
              {currentLesson.type === 'video' && (
                <div className="text-center">
                  <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>Video content would be displayed here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentLesson.content}
                  </p>
                </div>
              )}
              
              {currentLesson.type === 'reading' && (
                <div className="text-center max-w-md">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>Reading material would be displayed here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentLesson.content}
                  </p>
                </div>
              )}
              
              {currentLesson.type === 'interactive' && (
                <div className="text-center">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>Interactive content would be displayed here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentLesson.content}
                  </p>
                </div>
              )}
              
              {currentLesson.type === 'quiz' && (
                <div className="text-center">
                  <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>Quiz content would be displayed here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentLesson.content}
                  </p>
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => completeLesson(currentLesson)}
              className="w-full"
            >
              Complete Lesson
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Learning Modules</h2>
      <p className="text-muted-foreground">
        Structured learning paths to deepen your environmental knowledge
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Card 
            key={module.id} 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              module.is_locked ? 'opacity-60' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {module.is_locked ? (
                    <Lock className="h-5 w-5 text-gray-400" />
                  ) : module.progress === 100 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <BookOpen className="h-5 w-5" />
                  )}
                  {module.title}
                </CardTitle>
                <Badge className={getDifficultyColor(module.difficulty)}>
                  {module.difficulty}
                </Badge>
              </div>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {module.duration} minutes
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {module.points_reward} points
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Progress</span>
                    <span className="text-sm">{Math.round(module.progress)}%</span>
                  </div>
                  <Progress value={module.progress} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {module.category}
                  </Badge>
                  <Button 
                    onClick={() => startModule(module)}
                    disabled={module.is_locked}
                    size="sm"
                  >
                    {module.progress > 0 ? 'Continue' : 'Start Module'}
                  </Button>
                </div>
                
                {module.prerequisites.length > 0 && module.is_locked && (
                  <div className="text-xs text-muted-foreground">
                    Prerequisites: Complete modules {module.prerequisites.join(', ')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModuleComponent;