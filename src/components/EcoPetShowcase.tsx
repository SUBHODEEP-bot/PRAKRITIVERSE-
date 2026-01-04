import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ecoPet from "@/assets/eco-pet.png";
import { Heart, Zap, Leaf, Trophy, Star } from "lucide-react";
const EcoPetShowcase = () => {
  return <section className="py-24 px-6 bg-gradient-to-br from-muted/20 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="bg-gray-300 rounded-xl">
            <Badge variant="secondary" className="mb-4 rounded-xl">
              🌱 Meet Your Eco Companion
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-forest bg-clip-text text-transparent">
              Your Virtual Eco-Pet is Waiting
            </h2>
            <p className="text-xl mb-8 leading-relaxed text-zinc-950 text-center">
              Meet your personal sustainability companion! Your Eco-Pet grows stronger, 
              happier, and more vibrant as you complete real-world environmental actions. 
              It's not just a game - it's your journey towards a greener lifestyle.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Grows with Your Actions</h3>
                  <p className="text-muted-foreground">Plant trees, recycle, conserve energy - your pet evolves!</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Emotional Connection</h3>
                  <p className="text-muted-foreground">Build a bond that motivates real environmental change</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Unlock Abilities</h3>
                  <p className="text-muted-foreground">Gain special powers and unlock new eco-adventures</p>
                </div>
              </div>
            </div>

            <Button variant="hero" size="lg" className="text-lg px-8">
              Adopt Your Eco-Pet
            </Button>
          </div>

          {/* Eco-Pet Demo */}
          <div className="relative">
            <Card className="glass border-white/20 p-8 text-center bg-slate-300">
              <div className="relative mb-6">
                <img src={ecoPet} alt="Virtual Eco-Pet companion" className="w-48 h-48 mx-auto animate-pulse-eco" />
                <div className="absolute -top-2 -right-2">
                  <Badge variant="outline" className="bg-success text-success-foreground border-success">
                    Level 5
                  </Badge>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2 text-success">Leafy</h3>
              <p className="text-muted-foreground mb-6">Your Eco Companion</p>

              {/* Stats */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center"><Heart className="w-4 h-4 mr-1 text-destructive" />Health</span>
                    <span>85/100</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center"><Zap className="w-4 h-4 mr-1 text-warning" />Energy</span>
                    <span>92/100</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center"><Leaf className="w-4 h-4 mr-1 text-success" />Growth</span>
                    <span>76/100</span>
                  </div>
                  <Progress value={76} className="h-2" />
                </div>
              </div>

              {/* Achievements */}
              <div className="flex justify-center space-x-2 mb-6">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>Tree Planter</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Trophy className="w-3 h-3" />
                  <span>Eco Warrior</span>
                </Badge>
              </div>

              <Button variant="eco" className="w-full">
                Feed with Eco-Actions
              </Button>
            </Card>

            {/* Floating achievements */}
            <div className="absolute -top-4 left-4 animate-float">
              <div className="glass rounded-full p-3">
                <Leaf className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="absolute top-8 -right-4 animate-float" style={{
            animationDelay: "1s"
          }}>
              <div className="glass rounded-full p-3">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default EcoPetShowcase;