import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroEarth from "@/assets/hero-earth.jpg";
import { Leaf, Globe, Users, TrendingUp } from "lucide-react";
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with parallax effect */}
      <div className="absolute inset-0 z-0">
        <img src={heroEarth} alt="Digital Earth representing global sustainability" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-aurora opacity-40"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="glass rounded-full p-4">
          <Leaf className="w-8 h-8 text-success" />
        </div>
      </div>
      <div className="absolute top-40 right-20 animate-float" style={{
      animationDelay: "1s"
    }}>
        <div className="glass rounded-full p-4">
          <Globe className="w-8 h-8 text-secondary" />
        </div>
      </div>
      <div className="absolute bottom-40 left-20 animate-float" style={{
      animationDelay: "2s"
    }}>
        <div className="glass rounded-full p-4">
          <Users className="w-8 h-8 text-accent" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <Badge variant="secondary" className="mb-6 glass border-white/20">
          🌍 AI-Powered Sustainability Platform
        </Badge>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-aurora bg-clip-text text-transparent leading-tight">
          PrakritiVerse
        </h1>
        
        <p className="text-xl md:text-2xl mb-4 max-w-4xl mx-auto text-emerald-950 font-semibold">
          Where Education meets Innovation for a Sustainable Future
        </p>
        
        <p className="text-lg mb-8 max-w-3xl mx-auto font-bold text-emerald-900">
          Join the ultimate ecosystem connecting students, institutions, and industry 
          to build environmental awareness through AI-driven learning and real-world impact.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button variant="hero" size="lg" className="text-lg px-8 py-6">
            Start Your Eco Journey
          </Button>
          <Button variant="glass" size="lg" className="text-lg px-8 py-6 bg-stone-500 hover:bg-stone-400 text-zinc-950">
            Explore Features
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="glass rounded-xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-success">10K+</div>
            <div className="text-sm text-muted-foreground">Eco Actions</div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-secondary">500+</div>
            <div className="text-sm text-muted-foreground">Institutions</div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <Globe className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent">25+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <Leaf className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-success">1M+</div>
            <div className="text-sm text-muted-foreground">Trees Saved</div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;