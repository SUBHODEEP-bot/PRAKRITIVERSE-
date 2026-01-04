import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Users, Globe, Star, ArrowRight, CheckCircle } from "lucide-react";
const CallToAction = () => {
  return <section className="py-24 px-6 bg-gradient-aurora relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <Badge variant="outline" className="mb-6 border-white/30 text-white bg-white/10">
          🚀 Join the Movement
        </Badge>
        
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
          Ready to Transform Your
          <br />
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Sustainability Journey?
          </span>
        </h2>
        
        <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of students, educators, and organizations already making a difference. 
          Start your personalized eco-journey today and be part of the solution our planet needs.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Button variant="glass" size="lg" className="text-lg px-10 py-6 bg-white text-primary hover:bg-white/90">
            <Rocket className="w-5 h-5 mr-2" />
            Start Free Journey
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-white/30 text-white bg-gray-900 hover:bg-gray-800">
            Watch Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Social Proof */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <Users className="w-12 h-12 text-white mx-auto mb-4 opacity-80" />
            <div className="text-3xl font-bold text-white mb-2">10,000+</div>
            <div className="text-white/80">Active Learners</div>
          </div>
          <div className="text-center">
            <Globe className="w-12 h-12 text-white mx-auto mb-4 opacity-80" />
            <div className="text-3xl font-bold text-white mb-2">25+</div>
            <div className="text-white/80">Countries Reached</div>
          </div>
          <div className="text-center">
            <Star className="w-12 h-12 text-white mx-auto mb-4 opacity-80" />
            <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
            <div className="text-white/80">User Rating</div>
          </div>
        </div>

        {/* Feature Highlights */}
        <Card className="glass border-white/20 p-8 backdrop-blur-md bg-slate-800 rounded-2xl">
          <h3 className="text-2xl font-bold mb-6 text-white">What You Get Instantly</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <span className="text-white/90">Personal AI Eco-Coach</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <span className="text-white/90">Digital Eco-Credit Score</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <span className="text-white/90">Virtual Eco-Pet Companion</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <span className="text-white/90">Global Community Access</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <span className="text-white/90">Real-time Environmental Data</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <span className="text-white/90">Career Development Tools</span>
            </div>
          </div>
        </Card>

        {/* Urgency Element */}
        <div className="mt-12 text-center">
          <Badge variant="outline" className="border-white/30 text-white bg-white/10 mb-4">
            ⏰ Limited Beta Access
          </Badge>
          <p className="text-white/80 text-sm">
            Be among the first 1,000 users to shape the future of sustainability education
          </p>
        </div>
      </div>
    </section>;
};
export default CallToAction;