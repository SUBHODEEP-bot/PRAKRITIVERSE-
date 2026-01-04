import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, BookOpen, Users, Brain, Trophy, MessageCircle, Menu } from "lucide-react";
import { useState } from "react";
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PrakritiVerse
              </h1>
              <Badge variant="outline" className="text-xs border-success/50 text-success">
                BETA
              </Badge>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
              <BookOpen className="w-4 h-4" />
              <span>Features</span>
            </a>
            <a href="#user-types" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
              <Users className="w-4 h-4" />
              <span>Join As</span>
            </a>
            <a href="#ai-coach" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
              <Brain className="w-4 h-4" />
              <span>AI Coach</span>
            </a>
            <a href="/about" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
              <Trophy className="w-4 h-4" />
              <span>About</span>
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={() => window.location.href = '/auth'} className="bg-indigo-400 hover:bg-indigo-300 text-slate-950 font-semibold">Sign In</Button>
            <Button variant="eco" onClick={() => window.location.href = '/auth'}>Join Now</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden mt-6 space-y-4 glass rounded-lg p-6 border border-white/20">
            <a href="#features" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2">
              <BookOpen className="w-4 h-4" />
              <span>Features</span>
            </a>
            <a href="#user-types" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2">
              <Users className="w-4 h-4" />
              <span>Join As</span>
            </a>
            <a href="#ai-coach" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2">
              <Brain className="w-4 h-4" />
              <span>AI Coach</span>
            </a>
            <a href="/about" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2">
              <Trophy className="w-4 h-4" />
              <span>About</span>
            </a>
            <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
              <Button variant="ghost" className="justify-start" onClick={() => window.location.href = '/auth'}>Sign In</Button>
              <Button variant="eco" className="justify-start" onClick={() => window.location.href = '/auth'}>Join Now</Button>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navigation;