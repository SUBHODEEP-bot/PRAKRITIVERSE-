import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChallenges } from '@/hooks/useChallenges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Target, 
  Zap,
  Droplets,
  Recycle,
  TreePine,
  Clock,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import ChallengeSubmissionModal from './ChallengeSubmissionModal';
import { Database } from '@/integrations/supabase/types';

type Challenge = Database['public']['Tables']['eco_challenges']['Row'];

export const ChallengesDisplay = () => {
  const { user } = useAuth();
  const { 
    challenges, 
    userChallenges, 
    loading, 
    joinChallenge, 
    refresh 
  } = useChallenges();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'energy_saving': return <Zap className="w-5 h-5 text-warning" />;
      case 'water_conservation': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'waste_reduction': return <Recycle className="w-5 h-5 text-success" />;
      case 'tree_planting': return <TreePine className="w-5 h-5 text-green-600" />;
      default: return <Target className="w-5 h-5 text-primary" />;
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    
    if (end < now) {
      return 'Ended';
    }
    
    return formatDistanceToNow(end, { addSuffix: true });
  };

  const isParticipating = (challengeId: string) => {
    return userChallenges.some(p => p.challenge_id === challengeId);
  };

  const getParticipation = (challengeId: string) => {
    return userChallenges.find(p => p.challenge_id === challengeId);
  };

  const activechallenges = challenges.filter(c => new Date(c.end_date) > new Date());
  const endedChallenges = challenges.filter(c => new Date(c.end_date) <= new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Eco Challenges</h2>
          <p className="text-muted-foreground">Join global sustainability challenges and make a difference</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {activechallenges.length} Active
        </Badge>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Challenges ({activechallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Past Challenges ({endedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activechallenges.length === 0 ? (
            <Card className="text-center p-8">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Active Challenges</h3>
              <p className="text-muted-foreground">Check back later for new challenges to join!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activechallenges.map((challenge) => {
                const participation = getParticipation(challenge.id);
                const isJoined = isParticipating(challenge.id);
                const progress = participation ? 
                  Math.min((participation.current_progress / challenge.target_value) * 100, 100) : 0;

                return (
                  <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getChallengeIcon(challenge.challenge_type)}
                          <div>
                            <CardTitle className="text-lg">{challenge.title}</CardTitle>
                            <CardDescription className="flex items-center space-x-2 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span className="text-xs">
                                Ends {getTimeRemaining(challenge.end_date)}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant={isJoined ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {challenge.points_reward} pts
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {challenge.description}
                      </p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Target: {challenge.target_value}</span>
                          <span className="text-muted-foreground">
                            {format(new Date(challenge.end_date), 'MMM dd, yyyy')}
                          </span>
                        </div>

                        {isJoined && participation && (
                          <>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{participation.current_progress} / {challenge.target_value}</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                            
                            {participation.completed && (
                              <Badge variant="default" className="w-full justify-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed!
                              </Badge>
                            )}
                          </>
                        )}
                      </div>

                      {!isJoined ? (
                        <Button 
                          className="w-full" 
                          onClick={() => joinChallenge(challenge.id)}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Join Challenge
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          {!participation?.completed && (
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => {
                                setSelectedChallenge(challenge);
                                setShowSubmissionModal(true);
                              }}
                            >
                              Submit Completion
                            </Button>
                          )}
                          <div className="text-center">
                            <Badge variant="outline" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              Joined {formatDistanceToNow(new Date(participation?.joined_at || ''), { addSuffix: true })}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {endedChallenges.length === 0 ? (
            <Card className="text-center p-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Past Challenges</h3>
              <p className="text-muted-foreground">Completed challenges will appear here</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {endedChallenges.map((challenge) => {
                const participation = getParticipation(challenge.id);
                const isJoined = isParticipating(challenge.id);

                return (
                  <Card key={challenge.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getChallengeIcon(challenge.challenge_type)}
                          <div>
                            <CardTitle className="text-lg">{challenge.title}</CardTitle>
                            <CardDescription className="flex items-center space-x-2 mt-1">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">
                                Ended {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Ended
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {challenge.description}
                      </p>

                      {isJoined && participation ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Your Progress</span>
                            <span>{participation.current_progress} / {challenge.target_value}</span>
                          </div>
                          <Progress 
                            value={Math.min((participation.current_progress / challenge.target_value) * 100, 100)} 
                            className="h-2" 
                          />
                          {participation.completed && (
                            <Badge variant="default" className="w-full justify-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              You Completed This!
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          You didn't participate in this challenge
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Challenge Submission Modal */}
      {selectedChallenge && (
        <ChallengeSubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedChallenge(null);
          }}
          challenge={selectedChallenge}
          onSubmissionComplete={() => {
            refresh();
            setShowSubmissionModal(false);
            setSelectedChallenge(null);
          }}
        />
      )}
    </div>
  );
};