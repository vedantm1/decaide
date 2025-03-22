import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { DECA_CATEGORIES, EVENT_TYPE_GROUPS, PI_CATEGORIES } from '@shared/schema';

// Types for game structure
interface Card {
  id: number;
  term: string;
  definition: string;
  matched: boolean;
  flipped: boolean;
  category: string;
}

// Difficulty levels
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Get DECA glossary terms based on system data
const getTerms = () => {
  // Create cards from performance indicators and DECA terms
  const terms: Array<{term: string, definition: string, category: string}> = [
    // Marketing terms
    { term: 'Market Segmentation', definition: 'Dividing a market into distinct groups', category: 'marketing' },
    { term: 'SWOT Analysis', definition: 'Strengths, Weaknesses, Opportunities, Threats', category: 'strategy' },
    { term: 'ROI', definition: 'Return on Investment', category: 'finance' },
    { term: 'B2B', definition: 'Business to Business', category: 'marketing' },
    { term: 'B2C', definition: 'Business to Consumer', category: 'marketing' },
    { term: 'KPI', definition: 'Key Performance Indicator', category: 'management' },
    { term: 'CRM', definition: 'Customer Relationship Management', category: 'marketing' },
    { term: 'AIDA', definition: 'Attention, Interest, Desire, Action', category: 'marketing' },
    { term: 'Target Market', definition: 'Specific customer group a business aims to reach', category: 'marketing' },
    { term: 'USP', definition: 'Unique Selling Proposition', category: 'marketing' },
    { term: 'Revenue', definition: 'Income from business activities', category: 'finance' },
    { term: 'Break-even', definition: 'Point where revenue equals costs', category: 'finance' },
    // Add DECA-specific terms
    { term: 'Role Play', definition: 'Interactive scenario with judges', category: 'competition' },
    { term: 'Performance Indicators', definition: 'Key skills being evaluated', category: 'competition' },
    { term: 'Written Event', definition: 'Detailed business proposal or plan', category: 'competition' },
    { term: 'ICDC', definition: 'International Career Development Conference', category: 'competition' },
    { term: 'Presentation', definition: 'Verbal communication of ideas', category: 'skills' },
    { term: 'Business Plan', definition: 'Document outlining business goals', category: 'entrepreneurship' },
    { term: 'Venture Capital', definition: 'Funding for early-stage companies', category: 'finance' },
    { term: 'Elevator Pitch', definition: 'Brief persuasive speech', category: 'entrepreneurship' },
  ];
  
  return terms;
};

// Confetti animation for successful completion
const triggerConfetti = () => {
  const duration = 2000;
  const end = Date.now() + duration;
  
  const colors = ['#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4'];
  
  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });
    
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('beginner');
  const [showTip, setShowTip] = useState(true);
  const [learningPoints, setLearningPoints] = useState(0);
  
  const { toast } = useToast();
  
  // Initialize game based on difficulty
  const initializeGame = useCallback((difficulty: DifficultyLevel) => {
    setGameOver(false);
    setMatchedPairs(0);
    setMoves(0);
    setFlippedIndexes([]);
    
    const allTerms = getTerms();
    let selectedTerms: typeof allTerms = [];
    
    // Select number of pairs based on difficulty
    const pairsCount = 
      difficulty === 'beginner' ? 6 : 
      difficulty === 'intermediate' ? 8 : 
      10;
    
    // Randomly select terms based on difficulty
    const shuffledTerms = [...allTerms].sort(() => 0.5 - Math.random());
    selectedTerms = shuffledTerms.slice(0, pairsCount);
    
    // Create pairs of cards (term + definition)
    const cardPairs: Card[] = [];
    
    selectedTerms.forEach((item, index) => {
      // Term card
      cardPairs.push({
        id: index * 2,
        term: item.term,
        definition: item.definition,
        matched: false,
        flipped: false,
        category: item.category
      });
      
      // Definition card
      cardPairs.push({
        id: index * 2 + 1,
        term: item.term,
        definition: item.definition,
        matched: false,
        flipped: false,
        category: item.category
      });
    });
    
    // Shuffle cards
    const shuffledCards = [...cardPairs].sort(() => 0.5 - Math.random());
    setCards(shuffledCards);
    setTotalPairs(pairsCount);
    setDifficultyLevel(difficulty);
    setShowTip(true);
  }, []);
  
  // Initialize on mount
  useEffect(() => {
    initializeGame('beginner');
  }, [initializeGame]);
  
  // Handle card click
  const handleCardClick = (index: number) => {
    // Prevent clicking if already flipped or matched
    if (cards[index].flipped || cards[index].matched) return;
    
    // Prevent more than 2 cards being flipped
    if (flippedIndexes.length === 2) return;
    
    // Flip the card
    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    
    // Track flipped card indexes
    const newFlippedIndexes = [...flippedIndexes, index];
    setFlippedIndexes(newFlippedIndexes);
    
    // Check for matches if two cards are flipped
    if (newFlippedIndexes.length === 2) {
      setMoves(moves + 1);
      
      const [firstIndex, secondIndex] = newFlippedIndexes;
      const firstCard = newCards[firstIndex];
      const secondCard = newCards[secondIndex];
      
      // Check if term matches
      if (firstCard.term === secondCard.term) {
        // It's a match!
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[firstIndex].matched = true;
          updatedCards[secondIndex].matched = true;
          
          setCards(updatedCards);
          setFlippedIndexes([]);
          setMatchedPairs(matchedPairs + 1);
          setStreak(streak + 1);
          setLearningPoints(learningPoints + 10);
          
          // Show toast for streak milestones
          if ((streak + 1) % 3 === 0) {
            toast({
              title: `${streak + 1} Match Streak!`,
              description: "You're on fire! Keep it up!",
            });
          }
          
          // Display educational toast about the matched term
          toast({
            title: firstCard.term,
            description: firstCard.definition,
            duration: 3000,
          });
          
          // Check if game completed
          if (matchedPairs + 1 === totalPairs) {
            setGameOver(true);
            triggerConfetti();
            toast({
              title: "🏆 Game Complete!",
              description: `You completed the ${difficultyLevel} level in ${moves + 1} moves!`,
              variant: "default",
            });
          }
        }, 800);
      } else {
        // Not a match
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[firstIndex].flipped = false;
          updatedCards[secondIndex].flipped = false;
          setCards(updatedCards);
          setFlippedIndexes([]);
          setStreak(0);
        }, 1000);
      }
    }
  };
  
  // Card rendering
  const renderCard = (card: Card, index: number) => {
    const isFlipped = card.flipped || card.matched;
    
    return (
      <motion.div
        key={card.id}
        className="relative"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: isFlipped ? 1 : 1.05 }}
        onClick={() => handleCardClick(index)}
      >
        {/* Front of card (hidden when flipped) */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 border-2 border-primary-300 rounded-lg shadow-md flex items-center justify-center text-primary-700 cursor-pointer ${
            isFlipped ? 'hidden' : 'block'
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="font-bold text-2xl">?</div>
          <div className="absolute bottom-2 right-2 text-xs text-primary-500">DECA</div>
        </motion.div>
        
        {/* Back of card (visible when flipped) */}
        <motion.div
          className={`absolute inset-0 bg-white rounded-lg shadow-md border-2 ${
            card.matched ? 'border-green-500' : 'border-primary-500'
          } p-2 flex items-center justify-center text-center ${
            isFlipped ? 'block' : 'hidden'
          }`}
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            {/* Show term or definition based on card type */}
            <div className="font-medium text-sm">
              {index % 2 === 0 ? card.term : card.definition}
            </div>
            <Badge className="absolute bottom-1 text-[9px]" variant="outline">
              {card.category}
            </Badge>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  // Game statistics display
  const renderGameStats = () => (
    <div className="flex justify-between items-center mb-3 text-sm">
      <div className="flex gap-4">
        <div>
          <span className="text-muted-foreground">Pairs:</span>{' '}
          <span className="font-medium">{matchedPairs}/{totalPairs}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Moves:</span>{' '}
          <span className="font-medium">{moves}</span>
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-muted-foreground mr-1">Streak:</span>{' '}
        <motion.span 
          key={streak}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="font-medium"
        >
          {streak}
        </motion.span>
        {streak >= 3 && <span className="text-yellow-500 ml-1">🔥</span>}
      </div>
    </div>
  );
  
  return (
    <div className="h-full flex flex-col">
      {/* Game header */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-center text-primary-700">DECA Memory Match</h3>
        <p className="text-xs text-center text-muted-foreground">
          Match terms with definitions to build your DECA knowledge!
        </p>
      </div>
      
      {/* Game difficulty controls */}
      <div className="flex justify-center gap-2 mb-3">
        <Button 
          size="sm" 
          variant={difficultyLevel === 'beginner' ? 'default' : 'outline'}
          onClick={() => initializeGame('beginner')}
        >
          Beginner
        </Button>
        <Button 
          size="sm" 
          variant={difficultyLevel === 'intermediate' ? 'default' : 'outline'}
          onClick={() => initializeGame('intermediate')}
        >
          Intermediate
        </Button>
        <Button 
          size="sm" 
          variant={difficultyLevel === 'advanced' ? 'default' : 'outline'}
          onClick={() => initializeGame('advanced')}
        >
          Advanced
        </Button>
      </div>
      
      {/* Game stats */}
      {renderGameStats()}
      
      {/* Game tip */}
      <AnimatePresence>
        {showTip && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 text-blue-800 rounded-md p-2 mb-3 text-xs"
          >
            <div className="flex justify-between items-center">
              <p>Tip: Match the terms with their definitions!</p>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-5 w-5 p-0" 
                onClick={() => setShowTip(false)}
              >
                ✕
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Game board */}
      <div className="flex-1 grid grid-cols-4 gap-2 max-h-[220px]">
        {cards.map((card, index) => renderCard(card, index))}
      </div>
      
      {/* Game completion screen */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 bg-white/95 rounded-lg flex flex-col items-center justify-center p-4"
          >
            <div className="text-2xl font-bold text-primary-700 mb-2">Excellent Work!</div>
            <div className="text-muted-foreground text-center mb-4">
              You completed the {difficultyLevel} level in {moves} moves and earned {learningPoints} learning points!
            </div>
            <Button onClick={() => initializeGame(difficultyLevel)}>Play Again</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}