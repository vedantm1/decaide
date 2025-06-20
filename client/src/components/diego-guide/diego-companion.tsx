import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import DiegoAvatar from './diego-avatar';
import { apiRequest } from '@/lib/queryClient';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
// import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function DiegoCompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [diegoEmotion, setDiegoEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'excited' | 'confused'>('neutral');
  const [unrelatedCount, setUnrelatedCount] = useState(0);
  const [hasClosed, setHasClosed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting when the chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasClosed) {
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hi there! I'm Diego, your friendly DECA guide. 🐬 Need help with roleplays, performance indicators, or have questions about DECA competitions? I'm here to make a splash with answers! How can I assist you today?",
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      setDiegoEmotion('happy');
    }
  }, [isOpen, messages.length, hasClosed]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessageId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setDiegoEmotion('thinking');
    
    try {
      const response = await apiRequest('POST', '/api/chat/diego', {
        message: userMessage.content
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from Diego');
      }
      
      const data = await response.json();
      
      // Set emotion based on response type
      if (data.shouldExit) {
        setDiegoEmotion('excited');
        setTimeout(() => {
          setIsOpen(false);
          setHasClosed(true);
        }, 3000);
      } else if (data.isUnrelated) {
        setDiegoEmotion('confused');
        setUnrelatedCount(prev => prev + 1);
      } else {
        setDiegoEmotion('happy');
        setUnrelatedCount(0);
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
    } catch (error: any) {
      console.error('Error sending message to Diego:', error);
      toast({
        title: 'Communication Error',
        description: 'Sorry, I had trouble connecting to Diego. Please try again later.',
        variant: 'destructive'
      });
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I seem to be having trouble with my underwater internet connection. Could you try again in a moment?",
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setDiegoEmotion('confused');
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setMinimized(false);
    }
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimized(prev => !prev);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setHasClosed(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat bubble button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer"
          onClick={toggleChat}
        >
          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg flex items-center space-x-2">
            <DiegoAvatar size="md" emotion={hasClosed ? 'neutral' : 'happy'} />
            <div className="pr-3">
              <span className="font-medium">Chat with Diego</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 h-auto"
          >
            <Card className="shadow-xl border-primary/20">
              <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0 gap-2">
                <div className="flex items-center space-x-2">
                  <DiegoAvatar size="sm" emotion={diegoEmotion} />
                  <CardTitle className="text-base">Diego the Guide</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleMinimize}
                  >
                    {minimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <AnimatePresence>
                {!minimized && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="p-3 h-72 overflow-y-auto">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex",
                              message.role === "user" ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[80%] rounded-lg p-3",
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}
                            >
                              {message.role === "assistant" && (
                                <Badge variant="outline" className="mb-2">Diego</Badge>
                              )}
                              <div className="whitespace-pre-wrap text-sm">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                              <Badge variant="outline" className="mb-2">Diego</Badge>
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </CardContent>

                    <CardFooter className="p-3 pt-0">
                      <div className="flex w-full space-x-2">
                        <Textarea
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask Diego a question..."
                          className="min-h-10 resize-none"
                          disabled={isLoading}
                        />
                        <Button 
                          onClick={sendMessage} 
                          disabled={isLoading || !inputValue.trim()}
                          size="icon"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}