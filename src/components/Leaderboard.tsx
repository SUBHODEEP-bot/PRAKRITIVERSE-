import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp, Users, Leaf } from 'lucide-react';

export const Leaderboard = () => {
  const { user } = useAuth();
  const { leaderboard: ecoScoreBoard, userRank: ecoRank, loading: ecoLoading } = useLeaderboard('eco_score', 'all_time');
  const { leaderboard: weeklyBoard, userRank: weeklyRank, loading: weeklyLoading } = useLeaderboard('weekly_points', 'weekly');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  if (ecoLoading || weeklyLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="eco-score" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="eco-score" className="flex items-center">
            <Leaf className="w-4 h-4 mr-2" />
            Eco Score
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            This Week
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eco-score">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-primary" />
                Eco Score Champions
              </CardTitle>
              <CardDescription>
                Top environmental impact leaders of all time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* User's Rank */}
              {user && ecoRank.rank && (
                <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        {getRankIcon(ecoRank.rank)}
                      </div>
                      <div>
                        <p className="font-medium">Your Rank</p>
                        <p className="text-sm text-muted-foreground">#{ecoRank.rank} globally</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {ecoRank.score} points
                    </Badge>
                  </div>
                </div>
              )}

              {/* Leaderboard */}
              <div className="space-y-3">
                {ecoScoreBoard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.user_id === user?.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/50 hover:bg-muted/70'
                    } transition-colors`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        {getRankIcon(entry.rank || index + 1)}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {entry.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {entry.profiles?.full_name || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Environmental Leader
                        </p>
                      </div>
                    </div>
                    <Badge variant={entry.rank === 1 ? "default" : "secondary"}>
                      {entry.score} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-success" />
                Weekly Warriors
              </CardTitle>
              <CardDescription>
                Most active eco-champions this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* User's Weekly Rank */}
              {user && weeklyRank.rank && (
                <div className="mb-6 p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        {getRankIcon(weeklyRank.rank)}
                      </div>
                      <div>
                        <p className="font-medium">Your Weekly Rank</p>
                        <p className="text-sm text-muted-foreground">#{weeklyRank.rank} this week</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {weeklyRank.score} points
                    </Badge>
                  </div>
                </div>
              )}

              {/* Weekly Leaderboard */}
              <div className="space-y-3">
                {weeklyBoard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.user_id === user?.id 
                        ? 'bg-success/10 border border-success/20' 
                        : 'bg-muted/50 hover:bg-muted/70'
                    } transition-colors`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        {getRankIcon(entry.rank || index + 1)}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {entry.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {entry.profiles?.full_name || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Weekly Achiever
                        </p>
                      </div>
                    </div>
                    <Badge variant={entry.rank === 1 ? "default" : "secondary"}>
                      {entry.score} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};