import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/components/notifications/notification-provider';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { 
  FileText, Upload, Send, CheckCircle, Clock, 
  AlertCircle, Loader2, Award, FileSearch, PenTool,
  ChevronRight, Download
} from 'lucide-react';

interface WrittenEventSettings {
  eventType: 'executive-summary' | 'marketing-plan' | 'business-plan' | 'research-report';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'competition';
  focusArea?: string;
  specificRequirements?: string;
}

interface GeneratedPrompt {
  id: string;
  title: string;
  scenario: string;
  requirements: string[];
  evaluationCriteria: string[];
  tips: string[];
  estimatedTime: number;
  wordCount: { min: number; max: number };
}

interface FeedbackResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: {
    section: string;
    score: number;
    comments: string;
  }[];
  suggestions: string[];
}

export function EnhancedWrittenEventGenerator() {
  const [settings, setSettings] = useState<WrittenEventSettings>({
    eventType: 'executive-summary',
    difficulty: 'intermediate'
  });
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'upload' | 'feedback'>('generate');
  
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  const eventTypeDescriptions = {
    'executive-summary': 'Concise 1-page summary of key business decisions and recommendations',
    'marketing-plan': 'Comprehensive marketing strategy with target audience and tactics',
    'business-plan': 'Complete business plan including financials and operations',
    'research-report': 'In-depth analysis of industry trends and market opportunities'
  };

  const generatePromptMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/written-events/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Failed to generate prompt');
      return response.json();
    },
    onSuccess: (prompt) => {
      setGeneratedPrompt(prompt);
      setActiveTab('upload');
      
      addNotification({
        type: 'success',
        title: 'Prompt Generated!',
        message: 'Your written event scenario is ready',
        duration: 5000
      });
    },
    onError: () => {
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate prompt. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const submitForFeedbackMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (uploadedDocument) {
        formData.append('document', uploadedDocument);
      } else {
        formData.append('content', documentContent);
      }
      formData.append('promptId', generatedPrompt!.id);
      formData.append('eventType', settings.eventType);
      
      const response = await fetch('/api/written-events/feedback', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to get feedback');
      return response.json();
    },
    onSuccess: (feedback) => {
      setFeedbackResult(feedback);
      setActiveTab('feedback');
      
      // Check for achievements
      checkAchievements();
      
      const scoreColor = feedback.overallScore >= 80 ? 'text-green-600' : 
                        feedback.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600';
      
      addNotification({
        type: 'success',
        title: 'Feedback Received!',
        message: (
          <div>
            <p>Your submission has been evaluated</p>
            <p className={`font-bold ${scoreColor}`}>Score: {feedback.overallScore}/100</p>
          </div>
        ),
        duration: 7000,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      });
    },
    onError: () => {
      toast({
        title: 'Submission Failed',
        description: 'Unable to process your document. Please try again.',
        variant: 'destructive'
      });
    }
  });

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
            duration: 7000
          });
        });
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }
      setUploadedDocument(file);
      setDocumentContent(''); // Clear text input if file is uploaded
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
          AI Written Event Assistant
        </h2>
        <p className="text-muted-foreground">
          Generate prompts and get instant feedback on your written events
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">
                <PenTool className="h-4 w-4 mr-2" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="upload" disabled={!generatedPrompt}>
                <Upload className="h-4 w-4 mr-2" />
                Submit
              </TabsTrigger>
              <TabsTrigger value="feedback" disabled={!feedbackResult}>
                <FileSearch className="h-4 w-4 mr-2" />
                Feedback
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {/* Generate Tab */}
            {activeTab === 'generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <RadioGroup 
                    value={settings.eventType} 
                    onValueChange={(value) => setSettings({...settings, eventType: value as any})}
                  >
                    <div className="grid grid-cols-1 gap-3">
                      {(['executive-summary', 'marketing-plan', 'business-plan', 'research-report'] as const).map((type) => (
                        <label
                          key={type}
                          htmlFor={type}
                          className={`
                            flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${settings.eventType === type ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                          `}
                        >
                          <RadioGroupItem value={type} id={type} className="sr-only" />
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">
                              {type.replace('-', ' ')}
                            </span>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {eventTypeDescriptions[type]}
                          </p>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <RadioGroup 
                    value={settings.difficulty} 
                    onValueChange={(value) => setSettings({...settings, difficulty: value as any})}
                    className="grid grid-cols-2 gap-3"
                  >
                    {(['beginner', 'intermediate', 'advanced', 'competition'] as const).map((level) => (
                      <label
                        key={level}
                        htmlFor={`diff-${level}`}
                        className={`
                          flex items-center justify-center p-3 rounded-md border-2 cursor-pointer transition-all
                          ${settings.difficulty === level ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                        `}
                      >
                        <RadioGroupItem value={level} id={`diff-${level}`} className="sr-only" />
                        <span className="capitalize">{level}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Specific Requirements (Optional)</Label>
                  <Textarea
                    placeholder="E.g., 'Focus on digital marketing strategies' or 'Include financial projections'"
                    value={settings.specificRequirements || ''}
                    onChange={(e) => setSettings({...settings, specificRequirements: e.target.value})}
                    className="min-h-[80px]"
                  />
                </div>

                <Button
                  onClick={() => generatePromptMutation.mutate()}
                  disabled={generatePromptMutation.isPending}
                  size="lg"
                  className="w-full"
                >
                  {generatePromptMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Prompt...
                    </>
                  ) : (
                    <>
                      Generate Written Event Prompt
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && generatedPrompt && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Generated Prompt Display */}
                <div className="bg-secondary/20 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg">{generatedPrompt.title}</h3>
                  <p className="text-sm">{generatedPrompt.scenario}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Time Limit:</span>
                      <span className="ml-2 font-medium">{generatedPrompt.estimatedTime} minutes</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Word Count:</span>
                      <span className="ml-2 font-medium">
                        {generatedPrompt.wordCount.min}-{generatedPrompt.wordCount.max} words
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Requirements:</h4>
                    <ul className="space-y-1">
                      {generatedPrompt.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Upload Options */}
                <Tabs defaultValue="upload" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload Document</TabsTrigger>
                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOC, DOCX, or TXT (max 5MB)
                        </p>
                      </label>
                    </div>
                    
                    {uploadedDocument && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          {uploadedDocument.name}
                        </span>
                        <button
                          onClick={() => setUploadedDocument(null)}
                          className="ml-auto text-green-600 hover:text-green-700"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="paste" className="space-y-4">
                    <Textarea
                      placeholder="Paste your written event content here..."
                      value={documentContent}
                      onChange={(e) => {
                        setDocumentContent(e.target.value);
                        setUploadedDocument(null); // Clear file if text is entered
                      }}
                      className="min-h-[200px]"
                    />
                    
                    {documentContent && (
                      <p className="text-sm text-muted-foreground">
                        Word count: {documentContent.split(/\s+/).filter(word => word.length > 0).length}
                      </p>
                    )}
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={() => submitForFeedbackMutation.mutate()}
                  disabled={(!uploadedDocument && !documentContent) || submitForFeedbackMutation.isPending}
                  size="lg"
                  className="w-full"
                >
                  {submitForFeedbackMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit for AI Feedback
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && feedbackResult && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Overall Score */}
                <div className="text-center">
                  <div className={`text-5xl font-bold mb-2 ${
                    feedbackResult.overallScore >= 80 ? 'text-green-600' :
                    feedbackResult.overallScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {feedbackResult.overallScore}/100
                  </div>
                  <Progress 
                    value={feedbackResult.overallScore} 
                    className="h-3 mb-4"
                  />
                  <Badge variant={
                    feedbackResult.overallScore >= 80 ? 'default' :
                    feedbackResult.overallScore >= 60 ? 'secondary' :
                    'destructive'
                  }>
                    {feedbackResult.overallScore >= 80 ? 'Excellent' :
                     feedbackResult.overallScore >= 60 ? 'Good' :
                     'Needs Improvement'}
                  </Badge>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-green-800">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feedbackResult.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-orange-800">Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feedbackResult.improvements.map((improvement, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Section Feedback */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Section Breakdown</h3>
                  {feedbackResult.detailedFeedback.map((section, idx) => (
                    <div key={idx} className="bg-secondary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{section.section}</h4>
                        <Badge variant="outline">{section.score}/100</Badge>
                      </div>
                      <Progress value={section.score} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">{section.comments}</p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveTab('generate');
                      setGeneratedPrompt(null);
                      setFeedbackResult(null);
                      setUploadedDocument(null);
                      setDocumentContent('');
                    }}
                    className="flex-1"
                  >
                    Try Another Prompt
                  </Button>
                  <Button
                    onClick={() => {
                      // Download feedback as PDF (would implement PDF generation)
                      toast({
                        title: 'Coming Soon',
                        description: 'PDF download will be available soon!',
                      });
                    }}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}