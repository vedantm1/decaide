import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';

// Define card interface
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

// DECA terminology for the memory game
const decaTerms = [
  // Marketing concepts
  { term: 'Marketing Mix', definition: 'Product, Price, Place, Promotion', category: 'marketing' },
  { term: 'Target Market', definition: 'Specific group of consumers', category: 'marketing' },
  { term: 'SWOT Analysis', definition: 'Strengths, Weaknesses, Opportunities, Threats', category: 'marketing' },
  { term: 'Market Segmentation', definition: 'Dividing market into groups', category: 'marketing' },
  { term: 'Brand Equity', definition: 'Value of a brand name', category: 'marketing' },
  { term: 'Market Share', definition: 'Percentage of total market sales', category: 'marketing' },
  
  // Finance concepts
  { term: 'ROI', definition: 'Return On Investment', category: 'finance' },
  { term: 'P&L', definition: 'Profit and Loss statement', category: 'finance' },
  { term: 'Cash Flow', definition: 'Money moving in and out', category: 'finance' },
  { term: 'Depreciation', definition: 'Decrease in asset value', category: 'finance' },
  { term: 'Break-even', definition: 'Point of zero profit/loss', category: 'finance' },
  { term: 'Gross Margin', definition: 'Revenue minus COGS', category: 'finance' },
  
  // Management concepts
  { term: 'KPI', definition: 'Key Performance Indicator', category: 'management' },
  { term: 'Org Chart', definition: 'Organizational structure diagram', category: 'management' },
  { term: 'Delegation', definition: 'Assigning tasks to others', category: 'management' },
  { term: 'Performance Indicator', definition: 'Measurable skill standard', category: 'management' },
  { term: 'Critical Thinking', definition: 'Objective analysis for decisions', category: 'management' },
  { term: 'Leadership', definition: 'Ability to guide a team', category: 'management' },
  
  // Business operations
  { term: 'Supply Chain', definition: 'Product flow from supplier to customer', category: 'operations' },
  { term: 'Inventory', definition: 'Goods available for sale', category: 'operations' },
  { term: 'Quality Control', definition: 'Maintaining standards', category: 'operations' },
  { term: 'B2B', definition: 'Business-to-Business', category: 'operations' },
  { term: 'B2C', definition: 'Business-to-Consumer', category: 'operations' },
  { term: 'JIT', definition: 'Just-In-Time inventory', category: 'operations' }
];

export default function MemoryGame() {
  // Use try-catch to handle potential context errors
  let triggerAnimation = (_type?: any, _message?: any) => {};
  let showAchievement = (_title: string, _description: string, _points?: number) => {};
  
  try {
    const microInteractions = useMicroInteractions();
    triggerAnimation = microInteractions.triggerAnimation;
    showAchievement = microInteractions.showAchievement;
  } catch (error) {
    console.warn('MicroInteractions context not available, using fallback');
  }
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [score, setScore] = useState(0);
  
  // Initialize the game based on difficulty
  const initializeGame = useCallback((difficulty: DifficultyLevel) => {
    // Select number of pairs based on difficulty
    const pairsCount = 
      difficulty === 'beginner' ? 6 : 
      difficulty === 'intermediate' ? 8 : 12;
    
    // Randomly select terms
    const shuffledTerms = [...decaTerms].sort(() => Math.random() - 0.5).slice(0, pairsCount);
    
    // Create card pairs (term and definition)
    const cardPairs: Card[] = [];
    shuffledTerms.forEach((item, index) => {
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
    
    // Shuffle the cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameOver(false);
    setScore(0);
  }, []);
  
  // Start a new game on mount
  useEffect(() => {
    initializeGame(difficulty);
  }, [difficulty, initializeGame]);
  
  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstIndex, secondIndex] = flippedCards;
      
      // Increment moves
      setMoves(prev => prev + 1);
      
      // Check if the two cards match (same term)
      if (cards[firstIndex].term === cards[secondIndex].term) {
        // Mark cards as matched
        setCards(prevCards => 
          prevCards.map((card, index) => 
            index === firstIndex || index === secondIndex
              ? { ...card, matched: true }
              : card
          )
        );
        
        // Increment matched pairs
        setMatchedPairs(prev => {
          const newValue = prev + 1;
          
          // Add points to score
          setScore(prevScore => prevScore + 
            (difficulty === 'beginner' ? 10 : 
             difficulty === 'intermediate' ? 15 : 20)
          );
          
          // Check if game is over
          if (newValue === cards.length / 2) {
            setGameOver(true);
            
            // Calculate final score with bonus based on fewer moves
            const baseScore = 
              difficulty === 'beginner' ? 60 : 
              difficulty === 'intermediate' ? 120 : 240;
            
            const movesBonus = Math.max(0, 
              difficulty === 'beginner' ? 30 - moves : 
              difficulty === 'intermediate' ? 40 - moves : 50 - moves
            ) * 5;
            
            const finalScore = baseScore + movesBonus;
            setScore(finalScore);
            
            // Show success animation
            setTimeout(() => {
              triggerAnimation('stars');
              showAchievement(
                'Memory Master!', 
                `You completed the ${difficulty} memory game with ${moves} moves.`, 
                finalScore
              );
            }, 500);
          }
          
          return newValue;
        });
        
        // Reset flipped cards
        setFlippedCards([]);
      } else {
        // If no match, flip cards back after a delay
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map((card, index) => 
              index === firstIndex || index === secondIndex
                ? { ...card, flipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards, moves, difficulty, triggerAnimation, showAchievement]);
  
  // Handle card click
  const handleCardClick = (index: number) => {
    // Ignore if card is already flipped or matched
    if (cards[index].flipped || cards[index].matched || flippedCards.length >= 2) {
      return;
    }
    
    // Flip the card
    setCards(prevCards => 
      prevCards.map((card, i) => 
        i === index ? { ...card, flipped: true } : card
      )
    );
    
    // Add to flipped cards
    setFlippedCards(prev => [...prev, index]);
  };
  
  // Render a card
  const renderCard = (card: Card, index: number) => {
    const isDefinition = index % 2 === 1; // Odd indices are definitions
    
    return (
      <motion.div
        key={card.id}
        className={`relative aspect-[3/4] cursor-pointer ${
          difficulty === 'beginner' ? 'w-[120px]' : 
          difficulty === 'intermediate' ? 'w-[110px]' : 'w-[100px]'
        }`}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onClick={() => handleCardClick(index)}
      >
        {/* Card back */}
        <div 
          className={`absolute inset-0 flex items-center justify-center rounded-lg border-2 
            ${card.flipped || card.matched ? 'opacity-0' : 'opacity-100'}
            ${card.category === 'marketing' ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/40 dark:border-blue-700' : 
              card.category === 'finance' ? 'bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700' :
              card.category === 'management' ? 'bg-purple-100 border-purple-300 dark:bg-purple-900/40 dark:border-purple-700' :
              'bg-amber-100 border-amber-300 dark:bg-amber-900/40 dark:border-amber-700'
            }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="font-bold text-xl">DECA</div>
        </div>
        
        {/* Card front */}
        <div 
          className={`absolute inset-0 flex items-center justify-center p-2 rounded-lg border-2
            ${card.matched ? 'bg-emerald-100 border-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-700' : 
              'bg-white border-gray-300 dark:bg-slate-800 dark:border-slate-600'} 
            ${card.flipped || card.matched ? 'opacity-100' : 'opacity-0'}
            text-center`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-sm font-medium">
            {isDefinition ? card.definition : card.term}
            <div className="text-xs font-normal mt-1 text-muted-foreground">
              {isDefinition ? 'Definition' : 'Term'}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="h-full flex flex-col items-center p-4 overflow-y-auto">
      {/* Game header */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h3 className="font-medium">DECA Memory Game</h3>
          <p className="text-xs text-muted-foreground">Match DECA terms with their definitions</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="text-xs text-muted-foreground mr-2">
            Moves: <span className="font-medium text-foreground">{moves}</span>
          </div>
          <div className="text-xs text-primary mr-2">
            Score: <span className="font-medium">{score}</span>
          </div>
        </div>
      </div>
      
      {/* Difficulty selector */}
      <div className="flex gap-2 mb-4">
        <Button 
          size="sm" 
          variant={difficulty === 'beginner' ? 'default' : 'outline'}
          onClick={() => setDifficulty('beginner')}
        >
          Beginner
        </Button>
        <Button 
          size="sm" 
          variant={difficulty === 'intermediate' ? 'default' : 'outline'}
          onClick={() => setDifficulty('intermediate')}
        >
          Intermediate
        </Button>
        <Button 
          size="sm" 
          variant={difficulty === 'advanced' ? 'default' : 'outline'}
          onClick={() => setDifficulty('advanced')}
        >
          Advanced
        </Button>
      </div>
      
      {/* Game board */}
      <div className="flex-1 w-full flex items-center justify-center">
        <div className={`grid gap-3 
          ${difficulty === 'beginner' ? 'grid-cols-3 grid-rows-4' : 
            difficulty === 'intermediate' ? 'grid-cols-4 grid-rows-4' : 
            'grid-cols-4 grid-rows-6'}`}
        >
          {cards.map((card, index) => renderCard(card, index))}
        </div>
      </div>
      
      {/* Game controls */}
      <div className="w-full flex justify-end pt-4">
        <Button onClick={() => initializeGame(difficulty)}>
          New Game
        </Button>
      </div>
    </div>
  );
}