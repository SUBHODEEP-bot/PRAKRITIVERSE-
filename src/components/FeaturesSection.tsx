import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Users, Gamepad2, GraduationCap, Globe, Leaf, Zap, Target, BookOpen, Trophy, Heart } from "lucide-react";
const features = [{
  icon: Brain,
  title: "AI Personal Eco-Coach",
  description: "Get personalized sustainability roadmaps based on your lifestyle, activities, and goals. Your AI companion guides you towards a greener future.",
  badge: "AI Powered",
  color: "text-secondary",
  bgGradient: "bg-gradient-ocean"
}, {
  icon: TrendingUp,
  title: "Digital Eco-Credit Score",
  description: "Build a verified, trackable environmental impact score. Use it in your CV, academic portfolios, and job applications.",
  badge: "Verified",
  color: "text-success",
  bgGradient: "bg-gradient-forest"
}, {
  icon: Gamepad2,
  title: "Eco-Pet Companion",
  description: "Your virtual eco-pet grows only when you complete real-world environmental tasks. Watch it thrive as you make a difference!",
  badge: "Gamified",
  color: "text-accent",
  bgGradient: "bg-gradient-earth"
}, {
  icon: Globe,
  title: "Satellite Data Integration",
  description: "Visualize real-time pollution, deforestation, and climate data using ISRO/NASA datasets. See the world's environmental pulse.",
  badge: "Real-time",
  color: "text-secondary",
  bgGradient: "bg-gradient-ocean"
}, {
  icon: GraduationCap,
  title: "NEP 2020 Aligned Courses",
  description: "Curriculum-linked micro-courses on sustainability, renewable energy, and environmental science. Learn while earning credits.",
  badge: "Educational",
  color: "text-primary",
  bgGradient: "bg-gradient-primary"
}, {
  icon: Users,
  title: "Global Community",
  description: "Connect with students, teachers, NGOs, and environmental leaders worldwide. Collaborate on projects that matter.",
  badge: "Community",
  color: "text-success",
  bgGradient: "bg-gradient-forest"
}];
const FeaturesSection = () => {
  return <section id="features" className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            🚀 Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-aurora bg-clip-text text-transparent">
            Everything You Need for Eco Excellence
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover powerful tools designed to make sustainability learning engaging, 
            measurable, and impactful for the next generation of environmental leaders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => <Card key={index} className="group relative overflow-hidden glass border-white/20 hover:shadow-glow transition-all duration-500 hover:scale-105">
              <div className="p-6 bg-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${feature.bgGradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 text-white`} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <Button variant="ghost" size="sm" className="group-hover:text-primary transition-colors">
                  Learn More →
                </Button>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>)}
        </div>

        {/* Additional Features Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center glass rounded-xl p-6 hover:shadow-glow transition-all">
            <Target className="w-8 h-8 text-success mx-auto mb-3" />
            <h4 className="font-semibold text-success mb-2">Goal Tracking</h4>
            <p className="text-sm text-muted-foreground">Set and achieve your environmental goals</p>
          </div>
          
          <div className="text-center glass rounded-xl p-6 hover:shadow-glow transition-all">
            <BookOpen className="w-8 h-8 text-secondary mx-auto mb-3" />
            <h4 className="font-semibold text-secondary mb-2">Smart Learning</h4>
            <p className="text-sm text-muted-foreground">Adaptive content based on your progress</p>
          </div>
          
          <div className="text-center glass rounded-xl p-6 hover:shadow-glow transition-all">
            <Trophy className="w-8 h-8 text-accent mx-auto mb-3" />
            <h4 className="font-semibold text-accent mb-2">Achievements</h4>
            <p className="text-sm text-muted-foreground">Earn badges and certificates</p>
          </div>
          
          <div className="text-center glass rounded-xl p-6 hover:shadow-glow transition-all">
            <Heart className="w-8 h-8 text-destructive mx-auto mb-3" />
            <h4 className="font-semibold text-destructive mb-2">Wellness</h4>
            <p className="text-sm text-muted-foreground">Eco-therapy and mindfulness</p>
          </div>
        </div>
      </div>
    </section>;
};
export default FeaturesSection;