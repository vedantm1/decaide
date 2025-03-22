import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { DECA_CATEGORIES } from '@shared/schema';

// Constants for game configuration
const GRID_SIZE = 8;
const COLORS = [
  { name: 'marketing', color: '#ef4444' },
  { name: 'finance', color: '#3b82f6' }, 
  { name: 'management', color: '#10b981' },
  { name: 'entrepreneurship', color: '#8b5cf6' },
  { name: 'hospitality', color: '#f59e0b' }
];

// Business powerups - each tied to a DECA concept
const POWERUPS = [
  { name: 'Market Research', effect: 'Clears a random row', icon: '📊', category: 'marketing' },
  { name: 'Strategic Planning', effect: 'Clears a random column', icon: '📈', category: 'management' },
  { name: 'Venture Capital', effect: 'Clears blocks of one color', icon: '💰', category: 'finance' },
  { name: 'Innovation', effect: 'Turns nearby blocks to same color', icon: '💡', category: 'entrepreneurship' },
  { name: 'Customer Service', effect: 'Extra points for next move', icon: '🤝', category: 'hospitality' }
];

// Game block structure
interface Block {
  id: string;
  color: typeof COLORS[number];
  selected: boolean;
  matched: boolean;
  powerup: typeof POWERUPS[number] | null;
}

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Business concept tooltips to show during gameplay
const BUSINESS_TIPS = [
  "Target market segmentation increases conversion rates",
  "ROI = (Net Profit / Cost of Investment) × 100",
  "SWOT analysis helps identify competitive advantages",
  "USP differentiates your product from competitors",
  "The 4Ps: Product, Price, Place, and Promotion",
  "Customer acquisition cost is a key metric for growth",
  "Effective communication is essential for leadership",
  "Cash flow management ensures business sustainability",
  "Break-even analysis determines profitability threshold",
  "Market penetration requires competitive pricing"
];

export default function BlockBlast() {
  const [grid, setGrid] = useState<Block[][]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<{row: number, col: number}[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [activePowerup, setActivePowerup] = useState<typeof POWERUPS[number] | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [remainingMoves, setRemainingMoves] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [businessTip, setBusinessTip] = useState('');
  
  const { toast } = useToast();
  
  // Initialize game grid
  const initializeGrid = useCallback(() => {
    const newGrid: Block[][] = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        // Random color
        const randomColorIndex = Math.floor(Math.random() * COLORS.length);
        
        // Occasionally add a powerup (10% chance)
        const hasPowerup = Math.random() < 0.1;
        let powerup = null;
        if (hasPowerup) {
          const randomPowerupIndex = Math.floor(Math.random() * POWERUPS.length);
          powerup = POWERUPS[randomPowerupIndex];
        }
        
        newGrid[row][col] = {
          id: generateId(),
          color: COLORS[randomColorIndex],
          selected: false,
          matched: false,
          powerup: powerup
        };
      }
    }
    
    return newGrid;
  }, []);
  
  // Start a new game
  const startNewGame = useCallback(() => {
    setGrid(initializeGrid());
    setScore(0);
    setCombo(1);
    setSelectedBlocks([]);
    setActivePowerup(null);
    setGameStarted(true);
    setRemainingMoves(15);
    setGameOver(false);
    showRandomBusinessTip();
  }, [initializeGrid]);
  
  // Show random business tip
  const showRandomBusinessTip = () => {
    const randomTip = BUSINESS_TIPS[Math.floor(Math.random() * BUSINESS_TIPS.length)];
    setBusinessTip(randomTip);
    
    // Clear tip after a delay
    setTimeout(() => {
      setBusinessTip('');
    }, 5000);
  };
  
  // Initialize on mount
  useEffect(() => {
    startNewGame();
    
    // Set initial high score from localStorage if available
    const savedHighScore = localStorage.getItem('blockBlastHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, [startNewGame]);
  
  // Save high score when it changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('blockBlastHighScore', score.toString());
    }
  }, [score, highScore]);
  
  // Check if game is over
  useEffect(() => {
    if (gameStarted && remainingMoves <= 0) {
      setGameOver(true);
      
      if (score > highScore) {
        // Trigger confetti for new high score
        const duration = 3000;
        const end = Date.now() + duration;
        
        (function frame() {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: COLORS.map(c => c.color),
          });
          
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: COLORS.map(c => c.color),
          });
          
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
        
        toast({
          title: "New High Score: " + score,
          description: "You've set a new personal best!",
          variant: "default",
        });
      }
    }
  }, [remainingMoves, gameStarted, score, highScore, toast]);
  
  // Handle block selection
  const handleBlockSelect = (row: number, col: number) => {
    if (!gameStarted || gameOver || remainingMoves <= 0) return;
    
    const newGrid = [...grid];
    const block = newGrid[row][col];
    
    // If different color than first selection, deselect all
    if (selectedBlocks.length > 0) {
      const firstBlock = newGrid[selectedBlocks[0].row][selectedBlocks[0].col];
      if (firstBlock.color.name !== block.color.name) {
        // Deselect all blocks
        clearSelection(newGrid);
        return;
      }
    }
    
    // Toggle selection
    if (block.selected) {
      // If this is not the last block in selection, deselect all after this one
      const index = selectedBlocks.findIndex(pos => pos.row === row && pos.col === col);
      if (index < selectedBlocks.length - 1) {
        const newSelectedBlocks = selectedBlocks.slice(0, index + 1);
        
        // Deselect the rest
        for (let i = index + 1; i < selectedBlocks.length; i++) {
          const pos = selectedBlocks[i];
          newGrid[pos.row][pos.col].selected = false;
        }
        
        setSelectedBlocks(newSelectedBlocks);
      }
    } else {
      // Only allow selection if it's adjacent to the last selected block
      if (selectedBlocks.length === 0 || isAdjacent(row, col, selectedBlocks[selectedBlocks.length - 1])) {
        block.selected = true;
        setSelectedBlocks([...selectedBlocks, { row, col }]);
      }
    }
    
    setGrid(newGrid);
  };
  
  // Check if two positions are adjacent
  const isAdjacent = (
    row1: number, 
    col1: number, 
    pos2: {row: number, col: number}
  ) => {
    const { row: row2, col: col2 } = pos2;
    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) || 
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
  };
  
  // Clear all selections
  const clearSelection = (gridData: Block[][]) => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        gridData[row][col].selected = false;
      }
    }
    setSelectedBlocks([]);
  };
  
  // Complete the current selection
  const completeSelection = () => {
    if (selectedBlocks.length < 3) {
      // Need at least 3 blocks to match
      clearSelection([...grid]);
      return;
    }
    
    // Calculate points based on blocks and combo
    const points = selectedBlocks.length * 10 * combo;
    
    // Apply powerup bonus if active
    let bonusPoints = 0;
    if (activePowerup && activePowerup.name === 'Customer Service') {
      bonusPoints = Math.floor(points * 0.5); // 50% bonus
      setActivePowerup(null); // Consume powerup
    }
    
    // Update score
    setScore(score + points + bonusPoints);
    
    // Increase combo for consecutive matches
    setCombo(combo + 1);
    
    // Check for powerups in selection
    const selectedPowerups = selectedBlocks
      .map(pos => grid[pos.row][pos.col].powerup)
      .filter(Boolean) as typeof POWERUPS[number][];
    
    if (selectedPowerups.length > 0) {
      // Activate the first powerup
      const powerup = selectedPowerups[0];
      setActivePowerup(powerup);
      
      toast({
        title: `${powerup.icon} ${powerup.name} Activated!`,
        description: powerup.effect,
        duration: 3000,
      });
    }
    
    // Mark matched blocks
    const newGrid = [...grid];
    selectedBlocks.forEach(pos => {
      newGrid[pos.row][pos.col].matched = true;
    });
    
    setGrid(newGrid);
    setSelectedBlocks([]);
    
    // Decrease remaining moves
    setRemainingMoves(prev => prev - 1);
    
    // After a delay, remove matched blocks and drop new ones
    setTimeout(() => {
      dropBlocksAndFill();
    }, 300);
  };
  
  // Drop blocks and fill empty spaces
  const dropBlocksAndFill = () => {
    const newGrid = [...grid];
    
    // Process columns one by one
    for (let col = 0; col < GRID_SIZE; col++) {
      // Find matched blocks and shift blocks down
      let emptySpaces = 0;
      
      // Process from bottom to top
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (newGrid[row][col].matched) {
          // Mark as empty space
          emptySpaces++;
          newGrid[row][col].matched = false;
        } else if (emptySpaces > 0) {
          // Shift block down by emptySpaces
          const targetRow = row + emptySpaces;
          if (targetRow < GRID_SIZE) {
            newGrid[targetRow][col] = { ...newGrid[row][col] };
          }
        }
      }
      
      // Fill top with new blocks
      for (let row = 0; row < emptySpaces; row++) {
        const randomColorIndex = Math.floor(Math.random() * COLORS.length);
        const hasPowerup = Math.random() < 0.1;
        let powerup = null;
        
        if (hasPowerup) {
          const randomPowerupIndex = Math.floor(Math.random() * POWERUPS.length);
          powerup = POWERUPS[randomPowerupIndex];
        }
        
        newGrid[row][col] = {
          id: generateId(),
          color: COLORS[randomColorIndex],
          selected: false,
          matched: false,
          powerup: powerup
        };
      }
    }
    
    setGrid(newGrid);
    
    // Apply any active powerup effects
    if (activePowerup) {
      applyPowerupEffect(activePowerup);
    }
    
    // Show a business tip occasionally
    if (Math.random() < 0.2) {
      showRandomBusinessTip();
    }
  };
  
  // Apply powerup effects
  const applyPowerupEffect = (powerup: typeof POWERUPS[number]) => {
    const newGrid = [...grid];
    
    switch (powerup.name) {
      case 'Market Research': {
        // Clear a random row
        const mrRandomRow = Math.floor(Math.random() * GRID_SIZE);
        for (let col = 0; col < GRID_SIZE; col++) {
          newGrid[mrRandomRow][col].matched = true;
        }
        break;
      }
        
      case 'Strategic Planning': {
        // Clear a random column
        const spRandomCol = Math.floor(Math.random() * GRID_SIZE);
        for (let row = 0; row < GRID_SIZE; row++) {
          newGrid[row][spRandomCol].matched = true;
        }
        break;
      }
        
      case 'Venture Capital': {
        // Clear blocks of one random color
        const vcRandomColorIndex = Math.floor(Math.random() * COLORS.length);
        const vcTargetColor = COLORS[vcRandomColorIndex].name;
        
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            if (newGrid[row][col].color.name === vcTargetColor) {
              newGrid[row][col].matched = true;
            }
          }
        }
        break;
      }
        
      case 'Innovation': {
        // Pick a random position
        const innRandomRow = Math.floor(Math.random() * GRID_SIZE);
        const innRandomCol = Math.floor(Math.random() * GRID_SIZE);
        const innTargetColor = newGrid[innRandomRow][innRandomCol].color;
        
        // Change adjacent blocks to same color
        for (let r = Math.max(0, innRandomRow - 1); r <= Math.min(GRID_SIZE - 1, innRandomRow + 1); r++) {
          for (let c = Math.max(0, innRandomCol - 1); c <= Math.min(GRID_SIZE - 1, innRandomCol + 1); c++) {
            newGrid[r][c].color = innTargetColor;
          }
        }
        break;
      }
        
      // Customer Service powerup is applied during completeSelection
    }
    
    setGrid(newGrid);
    setActivePowerup(null);
    
    // Process matched blocks after a delay
    if (powerup.name !== 'Customer Service' && powerup.name !== 'Innovation') {
      setTimeout(() => {
        dropBlocksAndFill();
      }, 300);
    }
    
    // Award bonus points for powerup use
    setScore(prev => prev + 50);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Game header */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-center text-primary-700">Business Block Blast</h3>
        <p className="text-xs text-center text-muted-foreground">
          Connect 3+ blocks of the same color to earn points!
        </p>
      </div>
      
      {/* Game stats */}
      <div className="flex justify-between items-center mb-2 text-sm">
        <div>
          <span className="text-muted-foreground">Score:</span>{' '}
          <motion.span 
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="font-bold"
          >
            {score}
          </motion.span>
        </div>
        <div>
          <span className="text-muted-foreground">High:</span>{' '}
          <span className="font-medium">{highScore}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Moves:</span>{' '}
          <span className="font-medium">{remainingMoves}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Combo:</span>{' '}
          <motion.span 
            key={combo}
            initial={{ scale: 1.3, color: '#3b82f6' }}
            animate={{ scale: 1, color: '#64748b' }}
            className="font-medium"
          >
            {combo}x
          </motion.span>
        </div>
      </div>
      
      {/* Business tip */}
      <AnimatePresence>
        {businessTip && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 text-amber-800 rounded-md p-2 mb-2 text-xs"
          >
            <div className="flex items-center">
              <span className="mr-1">💡</span>
              <p>{businessTip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Active powerup */}
      <AnimatePresence>
        {activePowerup && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary-50 text-primary-800 rounded-md p-2 mb-2 text-xs flex items-center"
          >
            <span className="mr-2 text-lg">{activePowerup.icon}</span>
            <div>
              <div className="font-medium">{activePowerup.name}</div>
              <div className="text-xs text-primary-600">{activePowerup.effect}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Game grid */}
      <div className="flex-1 aspect-square relative">
        <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full">
          {grid.map((row, rowIndex) => 
            row.map((block, colIndex) => (
              <motion.div
                key={block.id}
                className={`relative rounded-md cursor-pointer ${
                  block.selected ? 'ring-2 ring-white ring-opacity-70' : ''
                }`}
                style={{ 
                  backgroundColor: block.color.color,
                  opacity: block.matched ? 0.5 : 1
                }}
                whileHover={{ scale: 1.05 }}
                animate={{
                  scale: block.selected ? 1.1 : 1,
                }}
                onClick={() => handleBlockSelect(rowIndex, colIndex)}
              >
                {block.powerup && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-90 font-bold">
                    {block.powerup.icon}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
        
        {/* Game over overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 rounded-md flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center p-4 bg-white rounded-lg shadow-lg"
              >
                <h3 className="text-xl font-bold mb-2">Game Over</h3>
                <p className="mb-3">Final Score: <span className="font-bold">{score}</span></p>
                <Button onClick={startNewGame}>Play Again</Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Actions */}
      <div className="mt-3 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => clearSelection([...grid])}
          disabled={selectedBlocks.length === 0 || gameOver}
        >
          Clear Selection
        </Button>
        
        <Button 
          size="sm"
          onClick={completeSelection}
          disabled={selectedBlocks.length < 3 || gameOver}
          className={selectedBlocks.length >= 3 ? 'animate-pulse' : ''}
        >
          Complete {selectedBlocks.length >= 3 ? `(${selectedBlocks.length * 10 * combo} pts)` : ''}
        </Button>
      </div>
    </div>
  );
}