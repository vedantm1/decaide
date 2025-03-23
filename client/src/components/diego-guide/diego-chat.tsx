import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import DiegoAvatar from './diego-avatar';

interface DiegoChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const containerVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.9,
    transformOrigin: 'bottom right'
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    scale: 0.9,
    transformOrigin: 'bottom right',
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

// Message types
type MessageType = 'user' | 'diego';

interface Message {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
}

// Initial intro messages from Diego
const introMessages: Message[] = [
  {
    id: '1',
    type: 'diego',
    text: "Hi there! 👋 I'm Diego, your DECA training assistant. How can I help you today?",
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'diego',
    text: "You can ask me about DECA events, performance indicators, or how to prepare for your competition!",
    timestamp: new Date(Date.now() + 500),
  }
];

// Common DECA-related questions that Diego can quickly answer
const quickQuestions = [
  "What are performance indicators?",
  "How do I prepare for a roleplay?",
  "Explain the Business Management cluster",
  "What's the format of DECA exams?",
  "How are written events scored?",
  "Tell me about international events"
];

export default function DiegoChat({ isOpen, onClose }: DiegoChatProps) {
  const [messages, setMessages] = useState<Message[]>(introMessages);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { triggerAnimation } = useMicroInteractions();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Small animation when sending
    triggerAnimation('popIn');
    
    try {
      // Basic fallback responses for development
      const localResponses: Record<string, string> = {
        "What are performance indicators?": 
          "Performance Indicators are specific knowledge or skills that you need to demonstrate in DECA competitive events. They serve as a checklist of what judges will be looking for during your presentation.",
        
        "How do I prepare for a roleplay?": 
          "To prepare for a roleplay, familiarize yourself with your event's Performance Indicators, practice quick thinking, study business concepts relevant to your event, use the STAR approach (Situation, Task, Action, Result), and role-play with peers for feedback.",
        
        "Explain the Business Management cluster": 
          "The Business Management & Administration cluster prepares students for careers in planning, organizing, directing and evaluating business functions. Events include Business Management and Administration Series, Human Resources Management Series, and more.",
        
        "What's the format of DECA exams?": 
          "DECA exams typically consist of 100 multiple-choice questions covering business administration core performance indicators and your specific competitive event area. You have 100 minutes to complete the exam.",
        
        "How are written events scored?": 
          "Written events are scored using a rubric that evaluates executive summary, strategic planning, implementation, and presentation skills. Judges assess content knowledge, critical thinking, communication, and professionalism.",
        
        "Tell me about international events": 
          "DECA's International Career Development Conference (ICDC) brings together over 20,000 students from around the world. It's the culmination of competitive events, featuring championships for all DECA event categories."
      };

      // Try API call first
      try {
        const response = await apiRequest('POST', '/api/chat/diego', {
          message: userMessage.text,
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Add Diego's response from API
          const diegoResponse: Message = {
            id: `diego-${Date.now()}`,
            type: 'diego',
            text: data.message,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, diegoResponse]);
          return;
        }
      } catch (e) {
        console.log("API call failed, falling back to local responses");
      }
      
      // If API call fails, use local fallback
      let responseText = localResponses[userMessage.text] || "";
      
      // If no exact match, provide a helpful default response
      if (!responseText) {
        if (userMessage.text.toLowerCase().includes("performance indicator") || userMessage.text.toLowerCase().includes("pi")) {
          responseText = "Performance Indicators are essential elements in DECA competitions. They guide what judges are looking for in your presentation and solutions.";
        } else if (userMessage.text.toLowerCase().includes("roleplay") || userMessage.text.toLowerCase().includes("role play")) {
          responseText = "Role plays are simulated business scenarios where you demonstrate your business knowledge and problem-solving skills. Practice is key to success!";
        } else if (userMessage.text.toLowerCase().includes("exam") || userMessage.text.toLowerCase().includes("test")) {
          responseText = "DECA exams test your knowledge of business concepts and principles. Regular study of business terminology and practices will help you succeed.";
        } else if (userMessage.text.toLowerCase().includes("written") || userMessage.text.toLowerCase().includes("write")) {
          responseText = "Written events require thorough research, strategic thinking, and professional presentation. Start early and seek feedback on your work.";
        } else {
          responseText = "I'm here to help with your DECA preparation! You can ask me about performance indicators, role plays, exam strategies, or written events.";
        }
      }
      
      // Add Diego's response
      const diegoResponse: Message = {
        id: `diego-${Date.now()}`,
        type: 'diego',
        text: responseText,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, diegoResponse]);
    } catch (error) {
      // Fallback response if everything fails
      const fallbackResponse: Message = {
        id: `diego-${Date.now()}`,
        type: 'diego',
        text: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick question click
  const handleQuickQuestionClick = (question: string) => {
    setInputValue(question);
    // Wait for state update, then send
    setTimeout(() => {
      handleSendMessage();
    }, 10);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-20 right-6 w-[350px] sm:w-[400px] max-h-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200 dark:border-gray-800"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Chat header */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
            <div className="flex items-center gap-2">
              <DiegoAvatar size="small" />
              <div>
                <h3 className="font-semibold">Diego</h3>
                <p className="text-xs text-white/80">DECA Training Assistant</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white"
              aria-label="Close chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          {/* Messages container */}
          <div className="p-4 overflow-y-auto h-[320px] bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}
              >
                <div 
                  className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {message.text}
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="mb-4">
                <div className="inline-block px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800">
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            )}
            
            {/* Invisible element for scrolling to bottom */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Quick questions */}
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-x-auto whitespace-nowrap">
            <div className="flex gap-2">
              {quickQuestions.map((question, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickQuestionClick(question)}
                  className="flex-shrink-0"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Input area */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ask Diego something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              size="icon"
              disabled={!inputValue.trim() || isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                <path d="M12 5V19M12 5L6 11M12 5L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}