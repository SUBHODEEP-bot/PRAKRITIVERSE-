import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  Target, 
  Globe, 
  Heart,
  Brain,
  ArrowLeft,
  Award,
  Lightbulb,
  TreePine,
  Recycle,
  Zap
} from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Eco Team Lead",
      role: "Environmental Science Expert",
      description: "Leading the vision for sustainable education"
    },
    {
      name: "AI Developer",
      role: "Machine Learning Engineer", 
      description: "Building intelligent coaching systems"
    },
    {
      name: "Education Specialist",
      role: "Curriculum Designer",
      description: "Creating engaging learning experiences"
    },
    {
      name: "UX Designer",
      role: "User Experience Lead",
      description: "Designing intuitive and beautiful interfaces"
    }
  ];

  const achievements = [
    { icon: Users, label: "10,000+", description: "Active Learners" },
    { icon: Globe, label: "25+", description: "Countries Reached" },
    { icon: TreePine, label: "1M+", description: "Trees Saved" },
    { icon: Award, label: "50+", description: "Partner Institutions" }
  ];

  const mission = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To democratize environmental education through AI-powered learning, making sustainability accessible and engaging for everyone, everywhere."
    },
    {
      icon: Lightbulb,
      title: "Our Vision", 
      description: "A world where every individual is empowered with the knowledge and tools to create positive environmental impact through informed action."
    },
    {
      icon: Heart,
      title: "Our Values",
      description: "We believe in transparency, innovation, community-driven growth, and measurable impact. Every feature we build serves our planet's future."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-aurora text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Button 
            variant="ghost" 
            className="mb-6 text-white hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">About PrakritiVerse</h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Empowering the next generation with AI-driven sustainability education, 
              gamified learning, and real-world environmental impact tracking.
            </p>
            <Badge variant="outline" className="mt-4 border-white/30 text-white bg-white/10">
              SIH 2025 Project
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Mission, Vision, Values */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mission.map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Impact Stats */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Global Impact</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Together, our community is making measurable difference in environmental education and action.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <achievement.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">{achievement.label}</div>
                <div className="text-sm text-muted-foreground">{achievement.description}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* What Makes Us Different */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Makes Us Different</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We combine cutting-edge AI technology with proven educational methodologies to create unique learning experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-ocean rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle>AI-Powered Personalization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI coach adapts to your learning style, progress, and interests to provide truly personalized sustainability guidance.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-forest rounded-lg flex items-center justify-center mb-4">
                  <Recycle className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Real-World Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every action in our platform translates to measurable environmental impact, tracked and verified through our scoring system.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-earth rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Global Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with like-minded individuals, educators, and organizations worldwide to amplify your environmental impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Passionate experts from environmental science, technology, and education working together for a sustainable future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built with Modern Technology</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Leveraging the latest in web technology, AI, and cloud infrastructure to deliver a seamless experience.
            </p>
          </div>

          <Card className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">React & TypeScript</h4>
                <p className="text-sm text-muted-foreground">Modern frontend</p>
              </div>
              <div>
                <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Gemini AI</h4>
                <p className="text-sm text-muted-foreground">Smart coaching</p>
              </div>
              <div>
                <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Supabase</h4>
                <p className="text-sm text-muted-foreground">Backend & Database</p>
              </div>
              <div>
                <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Real-time Updates</h4>
                <p className="text-sm text-muted-foreground">Live synchronization</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-primary rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of learners, educators, and organizations making sustainability education accessible worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8"
            >
              Get Started Today
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/')}
              className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary"
            >
              Explore Platform
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;