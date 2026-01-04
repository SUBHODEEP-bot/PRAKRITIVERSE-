import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Gamepad2, 
  TreePine, 
  Droplets, 
  Wind, 
  Sun, 
  Recycle,
  Trophy,
  Star,
  Zap,
  Target
} from 'lucide-react';

interface GameStats {
  treesPlanted: number;
  waterSaved: number;
  carbonReduced: number;
  wasteRecycled: number;
  energySaved: number;
  level: number;
  xp: number;
  nextLevelXp: number;
}

interface MiniGame {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  difficulty: string;
}

const GameComponent = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [gameStats, setGameStats] = useState<GameStats>({
    treesPlanted: 0,
    waterSaved: 0,
    carbonReduced: 0,
    wasteRecycled: 0,
    energySaved: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 100
  });
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [loading, setLoading] = useState(true);

  const miniGames: MiniGame[] = [
    {
      id: 'tree-planter',
      title: 'Tree Planter',
      description: 'Plant virtual trees to combat deforestation!',
      icon: TreePine,
      points: 25,
      difficulty: 'Easy'
    },
    {
      id: 'water-saver',
      title: 'Water Conservation',
      description: 'Save water by fixing leaks and managing usage',
      icon: Droplets,
      points: 30,
      difficulty: 'Easy'
    },
    {
      id: 'carbon-fighter',
      title: 'Carbon Fighter',
      description: 'Reduce carbon emissions through smart choices',
      icon: Wind,
      points: 40,
      difficulty: 'Medium'
    },
    {
      id: 'recycling-master',
      title: 'Recycling Master',
      description: 'Sort waste correctly and maximize recycling',
      icon: Recycle,
      points: 35,
      difficulty: 'Medium'
    },
    {
      id: 'energy-saver',
      title: 'Energy Optimizer',
      description: 'Optimize energy usage in virtual buildings',
      icon: Zap,
      points: 50,
      difficulty: 'Hard'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchGameStats();
    }
  }, [user]);

  const fetchGameStats = async () => {
    try {
      setLoading(true);
      
      // Fetch user's eco actions to calculate game stats
      const { data: actions } = await supabase
        .from('eco_actions')
        .select('action_type, points_earned')
        .eq('user_id', user?.id);

      if (actions) {
        const stats = actions.reduce((acc, action) => {
          switch (action.action_type) {
            case 'tree_planting':
              acc.treesPlanted += 1;
              break;
            case 'water_conservation':
              acc.waterSaved += 10;
              break;
            case 'recycling':
              acc.wasteRecycled += 5;
              break;
            case 'energy_saving':
              acc.energySaved += 15;
              break;
            default:
              acc.carbonReduced += 2;
          }
          acc.xp += action.points_earned;
          return acc;
        }, {
          treesPlanted: 0,
          waterSaved: 0,
          carbonReduced: 0,
          wasteRecycled: 0,
          energySaved: 0,
          xp: 0
        });

        // Calculate level based on XP
        const level = Math.floor(stats.xp / 100) + 1;
        const nextLevelXp = level * 100;

        setGameStats({
          ...stats,
          level,
          nextLevelXp
        });
      }
    } catch (error) {
      console.error('Error fetching game stats:', error);
      toast({
        title: "Error",
        description: "Failed to load game stats. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startMiniGame = (gameId: string) => {
    setCurrentGame(gameId);
    setGameScore(0);
    setGameInProgress(true);
    
    // Start the mini-game simulation
    const gameInterval = setInterval(() => {
      setGameScore(prev => {
        const newScore = prev + Math.floor(Math.random() * 10) + 1;
        if (newScore >= 100) {
          clearInterval(gameInterval);
          completeGame(gameId, newScore);
          return 100;
        }
        return newScore;
      });
    }, 200);
  };

  const completeGame = async (gameId: string, finalScore: number) => {
    const game = miniGames.find(g => g.id === gameId);
    if (!game) return;

    try {
      // Create an eco action for the game completion
      const { error } = await supabase
        .from('eco_actions')
        .insert({
          user_id: user?.id,
          title: `Completed ${game.title}`,
          description: `Scored ${finalScore} points in ${game.title} mini-game`,
          action_type: 'gaming',
          points_earned: game.points,
          verified: true
        });

      if (error) throw error;

      // Update game stats
      setGameStats(prev => ({
        ...prev,
        xp: prev.xp + game.points,
        level: Math.floor((prev.xp + game.points) / 100) + 1
      }));

      setGameInProgress(false);
      setCurrentGame(null);

      toast({
        title: "Game Completed! 🎮",
        description: `You earned ${game.points} XP points! Final score: ${finalScore}`,
      });

      // Refresh game stats
      fetchGameStats();
    } catch (error) {
      console.error('Error completing game:', error);
      toast({
        title: "Error",
        description: "Failed to save game progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Eco Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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

  if (gameInProgress && currentGame) {
    const game = miniGames.find(g => g.id === currentGame);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{game?.title}</h2>
          <Button 
            variant="outline" 
            onClick={() => {
              setGameInProgress(false);
              setCurrentGame(null);
            }}
          >
            Exit Game
          </Button>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {game && <game.icon className="h-16 w-16 text-green-500" />}
            </div>
            <CardTitle>Playing {game?.title}</CardTitle>
            <CardDescription>Complete the challenge to earn XP!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {gameScore}%
              </div>
              <Progress value={gameScore} className="w-full h-4" />
            </div>
            
            <div className="text-center text-muted-foreground">
              {gameScore < 50 && "Keep going! You're making progress!"}
              {gameScore >= 50 && gameScore < 80 && "Great work! Almost there!"}
              {gameScore >= 80 && gameScore < 100 && "Excellent! Just a bit more!"}
              {gameScore === 100 && "Perfect! Game completed!"}
            </div>
            
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Reward: {game?.points} XP
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Eco Games</h2>
      <p className="text-muted-foreground">Play fun games while learning about environmental conservation!</p>
      
      {/* Player Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Gaming Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <TreePine className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{gameStats.treesPlanted}</div>
              <div className="text-sm text-muted-foreground">Trees Planted</div>
            </div>
            <div className="text-center">
              <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{gameStats.waterSaved}</div>
              <div className="text-sm text-muted-foreground">L Water Saved</div>
            </div>
            <div className="text-center">
              <Wind className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold">{gameStats.carbonReduced}</div>
              <div className="text-sm text-muted-foreground">kg CO₂ Reduced</div>
            </div>
            <div className="text-center">
              <Recycle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{gameStats.wasteRecycled}</div>
              <div className="text-sm text-muted-foreground">kg Recycled</div>
            </div>
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{gameStats.energySaved}</div>
              <div className="text-sm text-muted-foreground">kWh Saved</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Level {gameStats.level}
              </span>
              <span className="text-sm text-muted-foreground">
                {gameStats.xp} / {gameStats.nextLevelXp} XP
              </span>
            </div>
            <Progress 
              value={(gameStats.xp % 100)} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Mini Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {miniGames.map((game) => (
          <Card key={game.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <game.icon className="h-5 w-5" />
                  {game.title}
                </CardTitle>
                <Badge variant="outline">{game.difficulty}</Badge>
              </div>
              <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">{game.points} XP</span>
                </div>
                <Button onClick={() => startMiniGame(game.id)}>
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Play
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GameComponent;