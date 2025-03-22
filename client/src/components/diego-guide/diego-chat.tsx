import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, Loader2 } from 'lucide-react';
import DiegoAvatar from './diego-avatar';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DiegoChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiegoChat({ isOpen, onClose }: DiegoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { triggerAnimation } = useMicroInteractions();
  
  // Track the number of questions asked in the current session
  const [questionCount, setQuestionCount] = useState(0);
  const [unrelatedCount, setUnrelatedCount] = useState(0);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    
    // Add initial greeting from Diego when opened
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hey there${user?.username ? ', ' + user.username : ''}! I'm Diego, your friendly DECA AI assistant. How can I help you with DecA(I)de today?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, user]);
  
  useEffect(() => {
    // Scroll to bottom of messages when new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
    
    try {
      // Increment question count
      const newQuestionCount = questionCount + 1;
      setQuestionCount(newQuestionCount);
      
      // Check if we've reached the limit of questions
      if (newQuestionCount >= 10) {
        const farewellMessage = await getFarewellMessage();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: farewellMessage,
          timestamp: new Date()
        }]);
        
        // After the farewell message, reset the counter but keep the chat history
        setQuestionCount(0);
        setIsLoading(false);
        return;
      }
      
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
      
      // Check if the AI flagged this as an unrelated question
      if (data.isUnrelated) {
        const newUnrelatedCount = unrelatedCount + 1;
        setUnrelatedCount(newUnrelatedCount);
        
        // If we've had too many unrelated questions, provide a witty exit
        if (newUnrelatedCount >= 3) {
          const farewellMessage = await getBoredMessage();
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: farewellMessage,
            timestamp: new Date()
          }]);
          
          // Reset unrelated count after delivering the message
          setUnrelatedCount(0);
          setIsLoading(false);
          return;
        }
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);
      
      // Add a small animation when Diego responds
      triggerAnimation('stars', 'Diego answered!');
      
    } catch (error) {
      console.error('Error sending message to Diego:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting to my dolphin brain right now. Try asking me again in a moment!",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  // Function to get a random farewell message after 10 questions
  const getFarewellMessage = async (): Promise<string> => {
    const farewellMessages = [
      "Whew! I've answered quite a few questions now, and my dolphin brain needs a break. EEEEE-EEEEEE (that's dolphin for 'come back later')! 🐬",
      "Do dolphins hibernate? ... Umm, I think so... Wait, that's not right. Anyway, I need a break! Swim back later with fresh questions!",
      "My fin is getting tired from all this typing. I'm going to take a quick dip in the virtual ocean. Check back in a bit!",
      "Ten questions already? Time flies when you're having fun! I need to recharge my blowhole. Talk to you soon!",
      "Did you know dolphins sleep with one eye open? I need to catch some Z's with both eyes closed. TTYL!",
      "I've reached my question limit for now. Even AI dolphins need breaks! Going to do some underwater somersaults and be back soon.",
      "Dolphins have 100 teeth, but I've used about 1000 words answering your questions! Time for a short break.",
      "Enough questions to fill the ocean! Let me catch my breath before diving back in. See ya soon!",
      "My echolocation needs recalibrating after all these great questions. Be back after a quick system reset!",
      "Phew! That's a lot of knowledge sharing! This dolphin needs to refuel with some virtual fish. Back in a splash!",
      "Dolphins can hold their breath for 7 minutes, but I've been chatting for much longer! Need to resurface for some air.",
      "Just like real DECA competitions, I need a break between events! Let's pick this up again soon!",
    ];
    
    return farewellMessages[Math.floor(Math.random() * farewellMessages.length)];
  };
  
  // Function to get a random "I'm bored" message after 3 unrelated questions
  const getBoredMessage = async (): Promise<string> => {
    const boredMessages = [
      "Hmm, seems we're drifting away from DECA and DecA(I)de topics. I'm a business-focused dolphin! Let's swim back to relevant waters, shall we?",
      "As much as I'd love to discuss that, my specialty is DECA competitions and business concepts. Let's refocus our conversation!",
      "Even dolphins get distracted sometimes! But I'm here to help with DECA and DecA(I)de topics. Let's get back on track!",
      "That's a bit outside my ocean of expertise. I'm most helpful with DECA-related questions!",
      "I'm getting that 'fish out of water' feeling with these questions. I thrive in the business and DECA ecosystem!",
      "Just like dolphins stick to their migration patterns, I prefer to stay in the lane of DECA and business topics!",
      "My fin is tapping impatiently... I'm eager to help with DECA and DecA(I)de questions!",
      "I'd make a terrible comedian with my fish jokes, but I'm a great assistant for DECA topics! Let's focus there!",
      "Why don't fish play basketball? Because they're afraid of the net! Speaking of nets, let's get back to the net benefits of proper DECA preparation.",
      "What do dolphins and good businesspeople have in common? They're both excellent communicators! Now, let's communicate about DECA topics.",
      "I'm a one-trick dolphin, and that trick is helping with DECA! Let's swim back to those waters.",
      "What did the ocean say to the beach? Nothing, it just waved! Now that I've got that joke out of my system, let's wave goodbye to off-topic questions.",
    ];
    
    return boredMessages[Math.floor(Math.random() * boredMessages.length)];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 w-80 md:w-96 z-50 shadow-xl">
      <Card className="border border-primary/20">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <DiegoAvatar size="sm" emotion="happy" />
            <span className="font-medium text-sm">Chat with Diego</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-80 p-3">
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-start gap-2 mb-1">
                      <DiegoAvatar size="sm" emotion="happy" />
                      <span className="text-xs font-medium">Diego</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <DiegoAvatar size="sm" emotion="thinking" />
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-xs">Diego is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <CardContent className="p-3 border-t">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask Diego a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              size="icon"
              disabled={isLoading || input.trim() === ''}
              onClick={handleSend}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-center mt-2 text-muted-foreground">
            <p>Diego can answer questions about DecA(I)de and DECA competitions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}