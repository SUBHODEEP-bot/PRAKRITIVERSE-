import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import UserTypeSelection from "@/components/UserTypeSelection";
import EcoPetShowcase from "@/components/EcoPetShowcase";
import AICoachPreview from "@/components/AICoachPreview";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import VoiceChatbot from "@/components/VoiceChatbot";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold text-green-800 mb-4">EcoLearn</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <div className="flex justify-center mb-8 pt-8">
          <Button 
            onClick={() => {
              console.log('Navigation: Clicking Get Started button');
              navigate('/auth');
            }}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
          >
            Get Started - Join EcoLearn
          </Button>
        </div>
        <HeroSection />
        <FeaturesSection />
        <UserTypeSelection />
        <EcoPetShowcase />
        <AICoachPreview />
        <CallToAction />
      </main>
      <Footer />
      <VoiceChatbot />
    </div>
  );
};

export default Index;
