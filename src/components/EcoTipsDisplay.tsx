import { useState } from 'react';
import { useEcoTips } from '@/hooks/useEcoTips';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  Leaf, 
  Droplets, 
  Zap, 
  Recycle, 
  TreePine,
  RefreshCw,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const categories = [
  { value: 'all', label: 'All Tips', icon: Lightbulb },
  { value: 'energy', label: 'Energy', icon: Zap },
  { value: 'water', label: 'Water', icon: Droplets },
  { value: 'waste', label: 'Waste', icon: Recycle },
  { value: 'transport', label: 'Transport', icon: TrendingUp },
  { value: 'biodiversity', label: 'Nature', icon: TreePine }
];

export const EcoTipsDisplay = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { tips, loading, refresh, generatePersonalizedTips } = useEcoTips(selectedCategory === 'all' ? undefined : selectedCategory);
  const [generatingTips, setGeneratingTips] = useState(false);

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.value === category);
    if (categoryData) {
      const Icon = categoryData.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Leaf className="w-4 h-4" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success text-success-foreground';
      case 'intermediate': return 'bg-warning text-warning-foreground';
      case 'advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const handleGeneratePersonalized = async () => {
    setGeneratingTips(true);
    try {
      await generatePersonalizedTips(5);
      await refresh();
    } finally {
      setGeneratingTips(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Eco Tips</h2>
          <p className="text-muted-foreground">Practical sustainability advice to boost your eco-score</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleGeneratePersonalized}
            disabled={generatingTips}
            variant="outline"
            size="sm"
          >
            {generatingTips ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate AI Tips
          </Button>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category.value} value={category.value} className="text-xs">
              <category.icon className="w-3 h-3 mr-1" />
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.value} value={category.value}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? 
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-4/5"></div>
                        <div className="h-3 bg-muted rounded w-3/5"></div>
                      </div>
                    </CardContent>
                  </Card>
                )) :
                tips.map((tip) => (
                  <Card key={tip.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(tip.category)}
                          <CardTitle className="text-base">{tip.title}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {tip.points_value} pts
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(tip.difficulty_level)}`}
                        >
                          {tip.difficulty_level}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {tip.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {tip.content}
                      </p>
                      
                      {tip.estimated_impact && (
                        <div className="mb-3 p-2 bg-success/10 rounded-lg">
                          <p className="text-xs text-success font-medium">
                            Impact: {tip.estimated_impact}
                          </p>
                        </div>
                      )}

                      {tip.tags && tip.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tip.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button size="sm" className="w-full">
                        Try This Tip
                      </Button>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
            
            {!loading && tips.length === 0 && (
              <Card className="text-center p-8">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No tips found</h3>
                <p className="text-muted-foreground mb-4">
                  Try generating personalized tips or selecting a different category.
                </p>
                <Button onClick={handleGeneratePersonalized} disabled={generatingTips}>
                  {generatingTips ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate AI Tips
                </Button>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};