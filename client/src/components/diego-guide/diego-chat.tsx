import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, Loader2, Info, Star, BookOpen, Award, Sparkles } from 'lucide-react';
import DiegoAvatar from './diego-avatar';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// Define available chat message types
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: 'happy' | 'excited' | 'thinking' | 'neutral';
  isExitMessage?: boolean;
}

interface DiegoChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// Quick prompt suggestions
const PROMPT_SUGGESTIONS = [
  { icon: <Info className="h-3 w-3" />, text: "What is DecA(I)de?", value: "What is DecA(I)de and how does it help with DECA competitions?" },
  { icon: <Star className="h-3 w-3" />, text: "Subscription tiers", value: "Can you explain the different subscription tiers in DecA(I)de?" },
  { icon: <BookOpen className="h-3 w-3" />, text: "DECA events", value: "What are the main DECA event categories I can prepare for?" },
  { icon: <Award className="h-3 w-3" />, text: "Performance Indicators", value: "What are Performance Indicators in DECA and why are they important?" },
  { icon: <Sparkles className="h-3 w-3" />, text: "Study tips", value: "What are your top 3 tips for DECA competition success?" },
];

export default function DiegoChat({ isOpen, onClose }: DiegoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [diegoEmotion, setDiegoEmotion] = useState<'happy' | 'excited' | 'thinking' | 'neutral'>('happy');
  const [shouldExitChat, setShouldExitChat] = useState(false);
  const [exitCountdown, setExitCountdown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { triggerAnimation } = useMicroInteractions();
  const { toast } = useToast();
  
  // Track the number of questions asked in the current session
  const [questionCount, setQuestionCount] = useState(0);
  const [unrelatedCount, setUnrelatedCount] = useState(0);
  
  // Load chat history from localStorage
  useEffect(() => {
    if (isOpen) {
      const savedMessages = localStorage.getItem('diegoChat');
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(parsedMessages);
        } catch (e) {
          console.error('Error parsing saved messages:', e);
          // If there's an error, start fresh
          addInitialGreeting();
        }
      } else {
        // No saved messages, add initial greeting
        addInitialGreeting();
      }
    }
  }, [isOpen]);

  // Add initial greeting if there are no messages
  const addInitialGreeting = () => {
    const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
    
    setMessages([
      {
        role: 'assistant',
        content: `Good ${timeOfDay}${user?.username ? ', ' + user.username : ''}! 🐬 I'm Diego, your friendly dolphin assistant for DecA(I)de. How can I help you with your DECA preparation today?`,
        timestamp: new Date(),
        emotion: 'excited'
      }
    ]);
  };
  
  // Save chat history to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('diegoChat', JSON.stringify(messages));
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  useEffect(() => {
    // Scroll to bottom of messages when new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle exit countdown
  useEffect(() => {
    if (shouldExitChat && exitCountdown > 0) {
      const timer = setTimeout(() => {
        setExitCountdown(exitCountdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (shouldExitChat && exitCountdown === 0) {
      onClose();
      setShouldExitChat(false);
    }
  }, [shouldExitChat, exitCountdown, onClose]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    if (isLoading) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setDiegoEmotion('thinking');
    
    try {
      // Increment question count
      const newQuestionCount = questionCount + 1;
      setQuestionCount(newQuestionCount);
      
      // Send message to API
      const response = await apiRequest('POST', '/api/chat/diego', {
        message: input,
        questionCount: newQuestionCount,
        unrelatedCount
      });
      
      if (!response.ok) {
        throw new Error('Failed to get a response from Diego');
      }
      
      const data = await response.json();
      
      // Check if the server indicates we should exit
      if (data.shouldExit) {
        const exitMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          emotion: 'neutral',
          isExitMessage: true
        };
        
        setMessages(prev => [...prev, exitMessage]);
        triggerAnimation('stars');
        setDiegoEmotion('neutral');
        
        // Set a timer to close the chat after 5 seconds
        setShouldExitChat(true);
        setExitCountdown(5);
        
        setIsLoading(false);
        return;
      }
      
      // Check if the AI flagged this as an unrelated question
      if (data.isUnrelated) {
        const newUnrelatedCount = unrelatedCount + 1;
        setUnrelatedCount(newUnrelatedCount);
        setDiegoEmotion('neutral');
      } else {
        setDiegoEmotion('happy');
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        emotion: data.isUnrelated ? 'neutral' : 'happy'
      }]);
      
      // Animation disabled for chat messages
      
    } catch (error) {
      console.error('Error sending message to Diego:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting to my dolphin brain right now. Try asking me again in a moment!",
        timestamp: new Date(),
        emotion: 'neutral'
      }]);
      setDiegoEmotion('neutral');
      
      toast({
        title: "Connection Issue",
        description: "Diego is having trouble accessing the AI service. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };
  
  const handleClearChat = () => {
    // Keep only the initial greeting
    const initialGreeting = messages.length > 0 ? [messages[0]] : [];
    setMessages(initialGreeting);
    setQuestionCount(0);
    setUnrelatedCount(0);
    localStorage.setItem('diegoChat', JSON.stringify(initialGreeting));
    
    toast({
      title: "Chat Cleared",
      description: "Your conversation with Diego has been reset.",
      variant: "default"
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-20 right-4 w-80 md:w-96 z-50 shadow-xl"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="border border-primary/20 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <DiegoAvatar size="sm" emotion={diegoEmotion} />
              <div>
                <span className="font-medium text-sm">Chat with Diego</span>
                {shouldExitChat && (
                  <span className="block text-xs text-muted-foreground">
                    Closing in {exitCountdown}s...
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearChat} 
                aria-label="Clear chat"
                title="Clear chat history"
                className="h-8 w-8 p-0"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                aria-label="Close"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-80 p-3 bg-background/80">
            <div className="flex flex-col gap-3">
              {messages.map((message, index) => (
                <motion.div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : message.isExitMessage
                          ? 'bg-accent/30'
                          : 'bg-muted'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-start gap-2 mb-1">
                        <DiegoAvatar 
                          size="sm" 
                          emotion={message.emotion || 'happy'} 
                        />
                        <span className="text-xs font-medium">Diego</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div 
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <DiegoAvatar size="sm" emotion="thinking" />
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-xs">Diego is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Quick prompts suggestions */}
          {messages.length <= 3 && (
            <div className="p-2 border-t flex gap-1 overflow-x-auto no-scrollbar">
              {PROMPT_SUGGESTIONS.map((suggestion, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs flex items-center gap-1 whitespace-nowrap py-1 h-auto"
                  onClick={() => handleSuggestionClick(suggestion.value)}
                >
                  {suggestion.icon}
                  {suggestion.text}
                </Button>
              ))}
            </div>
          )}
          
          <CardContent className="p-3 border-t">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                placeholder="Ask Diego a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || shouldExitChat}
                className="flex-1"
              />
              <Button 
                size="icon"
                disabled={isLoading || input.trim() === '' || shouldExitChat}
                onClick={handleSend}
                aria-label="Send message"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-center mt-2 text-muted-foreground">
              <p>Diego can answer questions about DECA and business concepts</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}