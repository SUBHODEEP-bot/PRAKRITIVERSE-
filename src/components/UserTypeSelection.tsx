import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, Building, Shield, BookOpen, Heart, Briefcase, Settings } from "lucide-react";
const userTypes = [{
  icon: GraduationCap,
  title: "Student",
  description: "Learn, grow, and make a difference while building your eco-profile",
  features: ["AI Eco-Coach", "Gamified Learning", "Eco-Pet Companion", "Career Pathways"],
  badge: "Most Popular",
  gradient: "bg-gradient-primary",
  textColor: "text-primary"
}, {
  icon: BookOpen,
  title: "Teacher",
  description: "Empower your classroom with engaging sustainability curriculum",
  features: ["Classroom Dashboard", "Student Progress", "NEP 2020 Aligned", "Assessment Tools"],
  badge: "Educator",
  gradient: "bg-gradient-ocean",
  textColor: "text-secondary"
}, {
  icon: Heart,
  title: "NGO",
  description: "Connect with communities and track your environmental impact",
  features: ["Impact Analytics", "Community Outreach", "Funding Opportunities", "Volunteer Network"],
  badge: "Impact Focused",
  gradient: "bg-gradient-earth",
  textColor: "text-accent"
}, {
  icon: Building,
  title: "Institution",
  description: "Manage sustainability programs across your organization",
  features: ["Multi-campus Dashboard", "Policy Sandbox", "CSR Integration", "Data Analytics"],
  badge: "Enterprise",
  gradient: "bg-gradient-forest",
  textColor: "text-success"
}];
const UserTypeSelection = () => {
  const navigate = useNavigate();
  const handleGetStarted = (role: string) => {
    navigate(`/auth?role=${role}`);
  };
  return <section id="user-types" className="py-24 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            👥 Choose Your Journey
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join as
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            PrakritiVerse is designed for everyone in the sustainability ecosystem. 
            Choose your role and unlock personalized features tailored to your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {userTypes.map((type, index) => <Card key={index} className="group relative overflow-hidden glass border-white/20 hover:shadow-glow transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="p-6 text-center bg-slate-300">
                {type.badge && <Badge variant="outline" className="mb-4 text-xs bg-slate-50">
                    {type.badge}
                  </Badge>}
                
                <div className={`w-16 h-16 ${type.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <type.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className={`text-xl font-semibold mb-3 ${type.textColor} group-hover:text-primary transition-colors`}>
                  {type.title}
                </h3>
                
                <p className="mb-6 text-sm leading-relaxed text-purple-950 font-bold">
                  {type.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  {type.features.map((feature, idx) => <div key={idx} className="flex items-center text-sm text-muted-foreground bg-zinc-50 rounded-xl">
                      <div className={`w-1.5 h-1.5 ${type.gradient} rounded-full mr-2 flex-shrink-0`} />
                      {feature}
                    </div>)}
                </div>
                
                <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary transition-colors" onClick={() => handleGetStarted(type.title.toLowerCase())}>
                  Get Started
                </Button>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>)}
        </div>

        {/* Admin Access */}
        <div className="mt-12 text-center">
          <Card className="glass border-white/20 p-6 max-w-md mx-auto bg-pink-200 rounded-2xl">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">System Administrator</h3>
            <p className="text-sm mb-4 text-zinc-950">
              Platform management and analytics dashboard
            </p>
            <Button variant="ghost" size="sm" onClick={() => handleGetStarted('admin')} className="bg-rose-700 hover:bg-rose-600 text-zinc-950 font-bold">
              <Settings className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
          </Card>
        </div>
      </div>
    </section>;
};
export default UserTypeSelection;