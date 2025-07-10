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
import { Sparkles, Settings, Target, Brain, Zap, ChevronRight, Loader2, Award } from 'lucide-react';

interface RoleplaySettings {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  scenarioType: 'customer' | 'employee' | 'vendor' | 'partner' | 'random';
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
}

export function EnhancedRoleplayGenerator() {
  const [settings, setSettings] = useState<RoleplaySettings>({
    difficulty: 'medium',
    scenarioType: 'customer',
    duration: 15,
    includeObjections: true,
    realTimeMode: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenario, setGeneratedScenario] = useState<GeneratedScenario | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const { toast } = useToast();
  const { addNotification } = useNotifications();

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

  const handleGenerateScenario = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/roleplay/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          customInstructions: customInstructions.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate scenario');
      }

      const scenario = await response.json();
      setGeneratedScenario(scenario);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Scenario Generated!',
        message: `${scenario.title} is ready to practice`,
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

      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Scenario Settings
          </CardTitle>
          <CardDescription>
            Customize your roleplay experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            {/* Basic Settings */}
            <TabsContent value="basic" className="space-y-6">
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <RadioGroup 
                  value={settings.difficulty} 
                  onValueChange={(value) => setSettings({...settings, difficulty: value as any})}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {(['easy', 'medium', 'hard', 'expert'] as const).map((level) => (
                      <motion.div
                        key={level}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <label 
                          htmlFor={level}
                          className={`
                            flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${settings.difficulty === level ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                          `}
                        >
                          <RadioGroupItem value={level} id={level} className="sr-only" />
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize">{level}</span>
                            <Badge className={difficultyColors[level]} variant="secondary">
                              {level === 'easy' ? '★' : level === 'medium' ? '★★' : level === 'hard' ? '★★★' : '★★★★'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {difficultyDescriptions[level]}
                          </p>
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Scenario Type</Label>
                <RadioGroup 
                  value={settings.scenarioType} 
                  onValueChange={(value) => setSettings({...settings, scenarioType: value as any})}
                  className="grid grid-cols-3 gap-3"
                >
                  {(['customer', 'employee', 'vendor', 'partner', 'random'] as const).map((type) => (
                    <label
                      key={type}
                      htmlFor={type}
                      className={`
                        flex items-center justify-center p-3 rounded-md border cursor-pointer transition-all
                        ${settings.scenarioType === type ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                      `}
                    >
                      <RadioGroupItem value={type} id={type} className="sr-only" />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Duration (minutes)</Label>
                  <span className="text-sm font-medium">{settings.duration} min</span>
                </div>
                <Slider
                  value={[settings.duration]}
                  onValueChange={([value]) => setSettings({...settings, duration: value})}
                  min={5}
                  max={30}
                  step={5}
                  className="w-full"
                />
              </div>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Objections</Label>
                    <p className="text-sm text-muted-foreground">
                      Add realistic customer objections and concerns
                    </p>
                  </div>
                  <Switch
                    checked={settings.includeObjections}
                    onCheckedChange={(checked) => setSettings({...settings, includeObjections: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Real-Time Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Dynamic responses that adapt to your choices
                    </p>
                  </div>
                  <Switch
                    checked={settings.realTimeMode}
                    onCheckedChange={(checked) => setSettings({...settings, realTimeMode: checked})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Focus Area (Optional)</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.focusArea || ''}
                    onChange={(e) => setSettings({...settings, focusArea: e.target.value || undefined})}
                  >
                    <option value="">No specific focus</option>
                    <option value="negotiation">Negotiation Skills</option>
                    <option value="objection-handling">Objection Handling</option>
                    <option value="closing">Closing Techniques</option>
                    <option value="relationship-building">Relationship Building</option>
                    <option value="problem-solving">Problem Solving</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            {/* Custom Instructions */}
            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <Label>Custom Instructions</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add specific requirements or context for your scenario
                </p>
                <Textarea
                  placeholder="E.g., 'Focus on B2B sales in the tech industry' or 'Include sustainability concerns'"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Generate Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6"
          >
            <Button
              onClick={handleGenerateScenario}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Scenario...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Scenario
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Generated Scenario */}
      <AnimatePresence>
        {generatedScenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{generatedScenario.title}</CardTitle>
                  <Badge className={difficultyColors[generatedScenario.difficulty as keyof typeof difficultyColors]}>
                    {generatedScenario.difficulty}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {generatedScenario.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Objectives */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objectives
                  </h4>
                  <ul className="space-y-1">
                    {generatedScenario.objectives.map((objective, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Character Profile */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Character Profile
                  </h4>
                  <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                    <p><strong>Name:</strong> {generatedScenario.character.name}</p>
                    <p><strong>Role:</strong> {generatedScenario.character.role}</p>
                    <p><strong>Personality:</strong> {generatedScenario.character.personality}</p>
                    <p><strong>Background:</strong> {generatedScenario.character.background}</p>
                  </div>
                </div>

                {/* Context */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Scenario Context
                  </h4>
                  <div className="space-y-2">
                    <p><strong>Company:</strong> {generatedScenario.context.company}</p>
                    <p><strong>Industry:</strong> {generatedScenario.context.industry}</p>
                    <p><strong>Situation:</strong> {generatedScenario.context.situation}</p>
                    <div>
                      <strong>Key Challenges:</strong>
                      <ul className="mt-1 space-y-1">
                        {generatedScenario.context.challenges.map((challenge, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground ml-4">
                            • {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.location.href = `/roleplay/session/${generatedScenario.id}`}
                >
                  Start Roleplay Session
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}