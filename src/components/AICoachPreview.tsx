import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Brain, MessageCircle, TrendingUp, Target, Lightbulb, CheckCircle, Clock, BarChart3 } from "lucide-react";
const AICoachPreview = () => {
  return <section id="ai-coach" className="py-24 px-6 bg-gradient-to-br from-background to-secondary/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* AI Coach Interface Demo */}
          <div className="relative">
            <Card className="glass border-white/20 p-6 bg-slate-300">
              <div className="flex items-center mb-6">
                <Avatar className="mr-4 bg-gradient-primary">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    <Brain className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">EcoBot AI</h3>
                  <Badge variant="outline" className="text-xs">Your Personal Coach</Badge>
                </div>
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                <div className="flex">
                  <div className="glass rounded-lg p-3 max-w-xs bg-gray-50">
                    <p className="text-sm">Hi! I've analyzed your activity and noticed you've been doing great with recycling. Ready for your next eco-challenge? 🌱</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Yes! What do you recommend?</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="glass rounded-lg p-3 max-w-xs bg-slate-50">
                    <p className="text-sm">Based on your location data, there's a community tree planting event this weekend. It matches your interests and will boost your Eco-Score by 150 points! 🌳</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  Set Goals
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  View Progress
                </Button>
              </div>
            </Card>

            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 glass p-4 rounded-2xl bg-lime-50">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 text-success mx-auto mb-1" />
                <div className="text-sm font-semibold text-success">+25%</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </div>
            </div>

            
          </div>

          {/* Content */}
          <div>
            <Badge variant="secondary" className="mb-4">
              🤖 AI-Powered Guidance
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-ocean bg-clip-text text-transparent">
              Your Personal AI Eco-Coach
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Meet your intelligent sustainability companion. Our AI coach analyzes your lifestyle, 
              learns from your habits, and provides personalized recommendations to maximize your 
              environmental impact while making it fun and achievable.
            </p>

            {/* Features List */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Smart Analysis</h3>
                  <p className="text-muted-foreground text-sm">
                    Analyzes your daily patterns, location data, and preferences to create personalized action plans
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Real-time Feedback</h3>
                  <p className="text-muted-foreground text-sm">
                    Get instant feedback on your actions and celebrate milestones with your AI companion
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Goal Optimization</h3>
                  <p className="text-muted-foreground text-sm">
                    Automatically adjusts your goals based on progress and suggests new challenges
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Showcase */}
            <Card className="glass border-white/20 p-6 mb-8">
              <h4 className="font-semibold mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                This Week's Progress
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Water Conservation</span>
                    <span className="text-success">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Energy Efficiency</span>
                    <span className="text-secondary">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Waste Reduction</span>
                    <span className="text-accent">91%</span>
                  </div>
                  <Progress value={91} className="h-2" />
                </div>
              </div>
            </Card>

            <Button variant="ocean" size="lg" className="text-lg px-8">
              Start AI Coaching
            </Button>
          </div>
        </div>
      </div>
    </section>;
};
export default AICoachPreview;