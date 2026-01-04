import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Brain, CheckCircle, XCircle, Trophy } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  points_reward: number;
  difficulty: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

const QuizComponent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      
      // Mock quiz data since we don't have a quiz table yet
      const mockQuizzes: Quiz[] = [
        {
          id: '1',
          title: 'Climate Change Basics',
          description: 'Test your knowledge about climate change and its effects',
          points_reward: 50,
          difficulty: 'Beginner',
          questions: [
            {
              id: '1',
              question: 'What is the main cause of climate change?',
              options: [
                'Natural weather patterns',
                'Greenhouse gas emissions from human activities',
                'Solar flares',
                'Ocean currents'
              ],
              correct_answer: 1,
              explanation: 'Human activities, particularly burning fossil fuels, release greenhouse gases that trap heat in the atmosphere.'
            },
            {
              id: '2',
              question: 'Which gas contributes most to global warming?',
              options: [
                'Oxygen',
                'Nitrogen',
                'Carbon Dioxide',
                'Argon'
              ],
              correct_answer: 2,
              explanation: 'Carbon dioxide (CO2) is the most significant greenhouse gas contributing to global warming.'
            },
            {
              id: '3',
              question: 'What can individuals do to reduce their carbon footprint?',
              options: [
                'Use more plastic bags',
                'Drive larger vehicles',
                'Use renewable energy and reduce consumption',
                'Leave lights on all day'
              ],
              correct_answer: 2,
              explanation: 'Using renewable energy, reducing consumption, and making sustainable choices help reduce individual carbon footprints.'
            }
          ]
        },
        {
          id: '2',
          title: 'Renewable Energy Quiz',
          description: 'Learn about different types of renewable energy sources',
          points_reward: 75,
          difficulty: 'Intermediate',
          questions: [
            {
              id: '1',
              question: 'Which is NOT a renewable energy source?',
              options: [
                'Solar power',
                'Wind power',
                'Coal',
                'Hydroelectric power'
              ],
              correct_answer: 2,
              explanation: 'Coal is a fossil fuel and is not renewable, unlike solar, wind, and hydroelectric power.'
            },
            {
              id: '2',
              question: 'What percentage of global energy consumption should renewables reach by 2050?',
              options: [
                '25%',
                '50%',
                '75%',
                '90%'
              ],
              correct_answer: 3,
              explanation: 'According to climate goals, renewables should reach about 90% of global energy consumption by 2050.'
            }
          ]
        }
      ];

      setQuizzes(mockQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: "Error",
        description: "Failed to load quizzes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
    setScore(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < currentQuiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz completed
      const correctAnswers = newAnswers.filter((answer, index) => 
        answer === currentQuiz!.questions[index].correct_answer
      ).length;
      
      setScore(correctAnswers);
      setQuizCompleted(true);
      setShowResult(true);
      
      // Award points for completion
      if (correctAnswers > currentQuiz!.questions.length / 2) {
        awardQuizPoints(currentQuiz!.points_reward);
      }
    }
  };

  const awardQuizPoints = async (points: number) => {
    try {
      // In a real app, this would update the user's points in the database
      toast({
        title: "Quiz Completed! 🎉",
        description: `You earned ${points} points for completing the quiz!`,
      });
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (currentQuiz && !showResult) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{currentQuiz.title}</h2>
          <Button variant="outline" onClick={resetQuiz}>
            Back to Quizzes
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </CardTitle>
              <Badge variant="secondary">
                {Math.round(((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className="w-full text-left justify-start h-auto p-4"
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="mr-3 font-semibold">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}
            </div>
            
            <Button 
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              {currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult && currentQuiz) {
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    const passed = percentage >= 50;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Quiz Results</h2>
          <Button variant="outline" onClick={resetQuiz}>
            Back to Quizzes
          </Button>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {passed ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <Brain className="h-16 w-16 text-gray-400" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {passed ? 'Congratulations!' : 'Keep Learning!'}
            </CardTitle>
            <CardDescription>
              You scored {score} out of {currentQuiz.questions.length} ({percentage}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passed && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-green-800">You earned {currentQuiz.points_reward} points!</p>
              </div>
            )}
            
            <div className="space-y-4">
              <h3 className="font-semibold">Review Answers:</h3>
              {currentQuiz.questions.map((question, index) => (
                <div key={question.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {answers[index] === question.correct_answer ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">Question {index + 1}</span>
                  </div>
                  <p className="text-sm mb-2">{question.question}</p>
                  <p className="text-sm text-green-600">
                    Correct answer: {question.options[question.correct_answer]}
                  </p>
                  {question.explanation && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      {question.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-4">
              <Button onClick={() => startQuiz(currentQuiz)} className="flex-1">
                Retake Quiz
              </Button>
              <Button variant="outline" onClick={resetQuiz} className="flex-1">
                Choose Another Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Eco Knowledge Quiz</h2>
      <p className="text-muted-foreground">Test your environmental knowledge and earn points!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {quiz.title}
                </CardTitle>
                <Badge variant="outline">{quiz.difficulty}</Badge>
              </div>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {quiz.questions.length} questions • {quiz.points_reward} points
                </div>
                <Button onClick={() => startQuiz(quiz)}>
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizComponent;