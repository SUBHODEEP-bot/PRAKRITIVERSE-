import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Trophy, 
  Camera, 
  CheckCircle, 
  Clock, 
  Plus,
  Target,
  Leaf,
  Recycle,
  Droplets,
  Zap,
  Trees
} from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PhotoSubmissionModal from './PhotoSubmissionModal';
import CreateChallengeForm from './CreateChallengeForm';
import { supabase } from '@/integrations/supabase/client';

const EnhancedChallengesDisplay = () => {
  const { challenges, userChallenges, loading, joinChallenge, refresh } = useChallenges();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyMode, setNearbyMode] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const getChallengeIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      cleanup: Leaf,
      tree_planting: Trees,
      waste_reduction: Recycle,
      recycling: Recycle,
      water_conservation: Droplets,
      energy_conservation: Zap,
      default: Target
    };
    
    const IconComponent = iconMap[type] || iconMap.default;
    return <IconComponent className="h-5 w-5" />;
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days left`;
    return `${hours} hours left`;
  };

  const isParticipating = (challengeId: string) => {
    return userChallenges.some(uc => uc.challenge_id === challengeId);
  };

  const getParticipation = (challengeId: string) => {
    return userChallenges.find(uc => uc.challenge_id === challengeId);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    const success = await joinChallenge(challengeId);
    if (success) {
      toast({
        title: "Challenge Joined! 🌍",
        description: "You've successfully joined the environmental challenge.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitChallenge = (challengeId: string) => {
    setSelectedChallenge(challengeId);
    setShowSubmissionModal(true);
  };

  const submitChallengeSubmission = async (data: {
    submission_text: string;
    photo_urls: string[];
    location?: { lat: number; lng: number; address: string };
  }) => {
    if (!selectedChallenge) return;

    try {
      const { error } = await supabase.functions.invoke('challenge-management', {
        body: {
          action: 'submit_challenge',
          data: {
            challenge_id: selectedChallenge,
            submission_text: data.submission_text,
            photo_urls: data.photo_urls,
            submission_location_lat: data.location?.lat,
            submission_location_lng: data.location?.lng,
            submission_location_address: data.location?.address
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Submission Successful! 🎉",
        description: "Your challenge submission has been sent for verification.",
      });

      refresh();
    } catch (error) {
      console.error('Submission error:', error);
      throw error;
    }
  };

  const canCreateChallenges = profile?.role && ['teacher', 'admin', 'ngo', 'institution'].includes(profile.role);

  const activeChallenges = challenges.filter(c => c.is_active);
  const endedChallenges = challenges.filter(c => !c.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin text-6xl">🌍</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-green-800">Eco Challenges</h2>
          <p className="text-muted-foreground">Join environmental challenges and make a difference</p>
        </div>
        
        {canCreateChallenges && (
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Challenge
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Challenges</p>
                <p className="text-2xl font-bold">{activeChallenges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="text-2xl font-bold">{userChallenges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {userChallenges.filter(uc => uc.completed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Challenges</TabsTrigger>
          <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
          <TabsTrigger value="completed">Past Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
                <p className="text-muted-foreground">
                  New environmental challenges will appear here. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeChallenges.map((challenge) => {
                const participation = getParticipation(challenge.id);
                const isJoined = isParticipating(challenge.id);
                
                return (
                  <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getChallengeIcon(challenge.challenge_type)}
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        </div>
                        <Badge variant="secondary">
                          {challenge.points_reward} pts
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      
                      <div className="space-y-2">
                        {challenge.location_address && (
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{challenge.location_address}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{getTimeRemaining(challenge.end_date || '')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Target: {challenge.target_value} participants</span>
                        </div>
                      </div>
                      
                      {challenge.verification_photos_required && (
                        <div className="flex items-center space-x-2 text-sm text-orange-600">
                          <Camera className="h-4 w-4" />
                          <span>Photo verification required</span>
                        </div>
                      )}
                      
                      {challenge.requires_location_verification && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600">
                          <MapPin className="h-4 w-4" />
                          <span>Location verification required</span>
                        </div>
                      )}
                      
                      {isJoined && participation && (
                        <div className="space-y-2">
                          {participation.completed ? (
                            <Badge variant="default" className="w-full justify-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => handleSubmitChallenge(challenge.id)}
                              className="w-full"
                              variant="outline"
                            >
                              Submit Challenge
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {!isJoined && (
                        <Button
                          onClick={() => handleJoinChallenge(challenge.id)}
                          className="w-full"
                        >
                          Join Challenge
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-challenges" className="space-y-4">
          {userChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Joined Challenges</h3>
                <p className="text-muted-foreground">
                  You haven't joined any challenges yet. Browse active challenges to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userChallenges.map((participation) => {
                const challenge = challenges.find(c => c.id === participation.challenge_id);
                if (!challenge) return null;
                
                return (
                  <Card key={participation.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getChallengeIcon(challenge.challenge_type)}
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        </div>
                        {participation.completed ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      
                      <div className="text-sm text-muted-foreground">
                        Joined: {new Date(participation.joined_at || '').toLocaleDateString()}
                      </div>
                      
                      {!participation.completed && challenge.is_active && (
                        <Button
                          onClick={() => handleSubmitChallenge(challenge.id)}
                          className="w-full"
                          variant="outline"
                        >
                          Submit Challenge
                        </Button>
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
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Past Challenges</h3>
                <p className="text-muted-foreground">
                  Completed challenges will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endedChallenges.map((challenge) => (
                <Card key={challenge.id} className="opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getChallengeIcon(challenge.challenge_type)}
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      </div>
                      <Badge variant="outline">Ended</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showSubmissionModal && selectedChallenge && (
        <PhotoSubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedChallenge(null);
          }}
          challengeId={selectedChallenge}
          challengeTitle={challenges.find(c => c.id === selectedChallenge)?.title || ''}
          requiresLocation={challenges.find(c => c.id === selectedChallenge)?.requires_location_verification || false}
          onSubmit={submitChallengeSubmission}
        />
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Create New Challenge</h2>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  ✕
                </Button>
              </div>
              <CreateChallengeForm
                onSuccess={() => {
                  setShowCreateForm(false);
                  refresh();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChallengesDisplay;