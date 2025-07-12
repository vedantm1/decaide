import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/components/notifications/notification-provider';
import { Sparkles, Settings, Target, Brain, Zap, ChevronRight, Loader2, Award, BookOpen, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getRandomPIsForRoleplay, isTeamEvent, PIWithArea, getInstructionalAreasForCluster, getClusterFromEvent } from '@shared/deca-utils';

interface RoleplaySettings {
  duration: number;
  includeObjections: boolean;
  realTimeMode: boolean;
  focusArea?: string;
}

interface GeneratedScenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: number;
  objectives: string[];
  character: {
    name: string;
    role: string;
    personality: string;
    background: string;
  };
  context: {
    company: string;
    industry: string;
    situation: string;
    challenges: string[];
  };
  evaluationCriteria: string[];
  performanceIndicators?: PIWithArea[];
}

export function EnhancedRoleplayGenerator() {
  const [settings, setSettings] = useState<RoleplaySettings>({
    duration: 15,
    includeObjections: true,
    realTimeMode: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenario, setGeneratedScenario] = useState<GeneratedScenario | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedPIs, setSelectedPIs] = useState<PIWithArea[]>([]);
  const [isGeneratingPIs, setIsGeneratingPIs] = useState(false);
  const [selectedInstructionalArea, setSelectedInstructionalArea] = useState<string>('');
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // Fetch user data to get selected event
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800'
  };

  const difficultyDescriptions = {
    easy: 'Perfect for beginners. Simple scenarios with clear objectives.',
    medium: 'Balanced challenge. Moderate complexity with some curveballs.',
    hard: 'Advanced scenarios. Complex situations requiring strategic thinking.',
    expert: 'Competition-level difficulty. Multiple stakeholders and high stakes.'
  };

  const handleGeneratePIs = async () => {
    if (!user?.selectedEvent) {
      toast({
        title: 'No Event Selected',
        description: 'Please complete the tutorial to select your DECA event first.',
        variant: 'destructive'
      });
      return;
    }

    setIsGeneratingPIs(true);
    
    try {
      console.log('Generating PIs for event:', user.selectedEvent);
      console.log('Selected instructional area:', selectedInstructionalArea);
      
      const pis = getRandomPIsForRoleplay(user.selectedEvent, selectedInstructionalArea || undefined);
      console.log('Generated PIs:', pis);
      
      setSelectedPIs(pis);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'PIs Generated!',
        message: `${pis.length} Performance Indicators selected for ${user.selectedEvent}`,
        duration: 5000
      });
      
    } catch (error) {
      console.error('Error generating PIs:', error);
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate PIs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPIs(false);
    }
  };

  const handleGenerateScenario = async () => {
    if (!user?.selectedEvent) {
      toast({
        title: 'No Event Selected',
        description: 'Please complete the tutorial to select your DECA event first.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // First generate PIs if none are selected
      let pisToUse = selectedPIs;
      if (pisToUse.length === 0) {
        pisToUse = getRandomPIsForRoleplay(user.selectedEvent, selectedInstructionalArea || undefined);
        setSelectedPIs(pisToUse);
      }

      const response = await fetch('/api/roleplay/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          customInstructions: customInstructions.trim() || undefined,
          performanceIndicators: pisToUse.map(pi => pi.pi),
          userEvent: user?.selectedEvent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate scenario');
      }

      const scenario = await response.json();
      // If the scenario has PIs, update the selected PIs state
      if (scenario.performanceIndicators && scenario.performanceIndicators.length > 0) {
        setSelectedPIs(scenario.performanceIndicators);
      }
      setGeneratedScenario(scenario);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Scenario Generated!',
        message: `${scenario.title} is ready to practice with ${pisToUse.length} Performance Indicators`,
        duration: 5000
      });
      
      // Check for achievements
      checkAchievements();
      
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate scenario. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const checkAchievements = async () => {
    try {
      const response = await fetch('/api/user/achievements/check', {
        method: 'POST'
      });
      
      if (response.ok) {
        const newAchievements = await response.json();
        newAchievements.forEach((achievement: any) => {
          addNotification({
            type: 'achievement',
            title: `Achievement Unlocked!`,
            message: `${achievement.name}: ${achievement.description}`,
            icon: <Award className="h-5 w-5 text-yellow-500" />,
            duration: 7000,
            action: {
              label: 'View Achievements',
              onClick: () => window.location.href = '/achievements'
            }
          });
        });
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          AI Roleplay Generator
        </h2>
        <p className="text-muted-foreground">
          Create personalized scenarios tailored to your DECA event
        </p>
      </motion.div>

      {/* User Event Info Card */}
      {user?.selectedEvent && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Your Selected Event
            </CardTitle>
            <CardDescription>
              PIs will be generated based on your DECA event selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user.selectedEvent}</p>
                <p className="text-sm text-muted-foreground">
                  {user.selectedCluster} Career Cluster
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {isTeamEvent(user.selectedEvent) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Team Event (7 PIs)
                    </Badge>
                  )}
                  {!isTeamEvent(user.selectedEvent) && (
                    <Badge variant="secondary">
                      Individual Event (5 PIs)
                    </Badge>
                  )}
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      )}



      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            PI Settings
          </CardTitle>
          <CardDescription>
            Select Performance Indicators for your DECA event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Instructional Area (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Choose a specific instructional area, or leave blank for random selection
              </p>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedInstructionalArea}
                onChange={(e) => setSelectedInstructionalArea(e.target.value)}
              >
                <option value="">Random selection</option>
                {user?.selectedEvent && getInstructionalAreasForCluster(getClusterFromEvent(user.selectedEvent)).map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6"
          >
            <Button
              onClick={handleGeneratePIs}
              disabled={isGeneratingPIs}
              size="lg"
              className="w-full"
            >
              {isGeneratingPIs ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PIs...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Generate Performance Indicators
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <AnimatePresence>
        {selectedPIs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Performance Indicators</CardTitle>
                    <CardDescription>
                      {user?.selectedEvent}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPIs.map((piData, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">
                        {idx + 1}
                      </Badge>
                      <span className="text-sm font-medium">{piData.pi}</span>
                    </div>
                    <div className="ml-8">
                      <Badge variant="secondary" className="text-xs">
                        {piData.instructionalArea}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}