import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';

// Game colors
const COLORS = ['blue', 'green', 'purple', 'red', 'orange'] as const;
const POWERUPS = ['bomb', 'lightning', 'rainbow'] as const;

// Block interface
interface Block {
  id: string;
  color: typeof COLORS[number];
  selected: boolean;
  matched: boolean;
  powerup: typeof POWERUPS[number] | null;
}

export default function BlockBlast() {
  const { triggerAnimation, showAchievement } = useMicroInteractions();
  const [blocks, setBlocks] = useState<Block[][]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<{ row: number; col: number }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Initialize the game
  const initializeGame = useCallback(() => {
    const rows = 8;
    const cols = 8;
    const initialBlocks: Block[][] = [];
    
    for (let i = 0; i < rows; i++) {
      const row: Block[] = [];
      for (let j = 0; j < cols; j++) {
        // Random color
        const colorIndex = Math.floor(Math.random() * COLORS.length);
        const color = COLORS[colorIndex];
        
        // Random powerup (10% chance)
        const hasPowerup = Math.random() < 0.1;
        const powerupType = hasPowerup 
          ? POWERUPS[Math.floor(Math.random() * POWERUPS.length)]
          : null;
        
        row.push({
          id: `${i}-${j}`,
          color,
          selected: false,
          matched: false,
          powerup: powerupType
        });
      }
      initialBlocks.push(row);
    }
    
    setBlocks(initialBlocks);
    setSelectedBlocks([]);
    setScore(0);
    setGameOver(false);
  }, []);
  
  // Start a new game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  // Check if the game is over (no more valid moves)
  const checkGameOver = useCallback(() => {
    // Check each block
    for (let i = 0; i < blocks.length; i++) {
      for (let j = 0; j < blocks[i].length; j++) {
        const block = blocks[i][j];
        if (block.matched) continue;
        
        // Check adjacent blocks (up, right, down, left)
        const directions = [
          { row: i - 1, col: j }, // up
          { row: i, col: j + 1 }, // right
          { row: i + 1, col: j }, // down
          { row: i, col: j - 1 }  // left
        ];
        
        for (const dir of directions) {
          if (
            dir.row >= 0 && 
            dir.row < blocks.length && 
            dir.col >= 0 && 
            dir.col < blocks[i].length
          ) {
            const adjacent = blocks[dir.row][dir.col];
            if (!adjacent.matched && adjacent.color === block.color) {
              // Found a valid move
              return false;
            }
          }
        }
      }
    }
    
    // No valid moves found
    return true;
  }, [blocks]);
  
  // Handle block selection
  const handleBlockClick = (row: number, col: number) => {
    if (gameOver) return;
    
    const block = blocks[row][col];
    
    // Ignore matched blocks
    if (block.matched) return;
    
    // Check if this is the first block selected or an adjacent block
    if (selectedBlocks.length === 0) {
      // First block selected
      setSelectedBlocks([{ row, col }]);
      
      // Update blocks state
      setBlocks(prev => {
        const newBlocks = [...prev];
        newBlocks[row][col] = { ...block, selected: true };
        return newBlocks;
      });
    } else {
      // Check if it's adjacent to the last selected block
      const lastSelected = selectedBlocks[selectedBlocks.length - 1];
      const isAdjacent = 
        (Math.abs(row - lastSelected.row) === 1 && col === lastSelected.col) ||
        (Math.abs(col - lastSelected.col) === 1 && row === lastSelected.row);
      
      // Check if it has the same color as the first selected block
      const firstSelected = selectedBlocks[0];
      const firstBlock = blocks[firstSelected.row][firstSelected.col];
      const sameColor = block.color === firstBlock.color;
      
      if (isAdjacent && sameColor) {
        // Add to selected blocks
        setSelectedBlocks(prev => [...prev, { row, col }]);
        
        // Update blocks state
        setBlocks(prev => {
          const newBlocks = [...prev];
          newBlocks[row][col] = { ...block, selected: true };
          return newBlocks;
        });
      }
    }
  };
  
  // Handle clearing selected blocks
  const handleClearSelected = () => {
    if (selectedBlocks.length < 2) {
      // Deselect if only one block is selected
      if (selectedBlocks.length === 1) {
        const { row, col } = selectedBlocks[0];
        setBlocks(prev => {
          const newBlocks = [...prev];
          newBlocks[row][col] = { ...newBlocks[row][col], selected: false };
          return newBlocks;
        });
      }
      setSelectedBlocks([]);
      return;
    }
    
    // Calculate points based on length of chain and powerups
    let points = selectedBlocks.length * 10;
    let hasPowerup = false;
    
    // Mark selected blocks as matched
    setBlocks(prev => {
      const newBlocks = [...prev];
      
      selectedBlocks.forEach(({ row, col }) => {
        if (newBlocks[row][col].powerup) {
          hasPowerup = true;
          points += 20;
        }
        newBlocks[row][col] = { 
          ...newBlocks[row][col], 
          selected: false, 
          matched: true 
        };
      });
      
      return newBlocks;
    });
    
    // Add points to score
    setScore(prev => prev + points);
    
    // Show animation based on length of chain
    if (selectedBlocks.length >= 5) {
      triggerAnimation('fireworks');
    } else if (hasPowerup) {
      triggerAnimation('stars');
    } else if (selectedBlocks.length >= 3) {
      triggerAnimation('confetti');
    }
    
    // Clear selected blocks
    setSelectedBlocks([]);
    
    // Apply gravity (blocks fall down)
    setTimeout(() => {
      applyGravity();
    }, 300);
  };
  
  // Apply gravity to blocks (blocks fall down)
  const applyGravity = useCallback(() => {
    setBlocks(prev => {
      const newBlocks = [...prev];
      
      // For each column
      for (let col = 0; col < newBlocks[0].length; col++) {
        // Start from bottom row
        for (let row = newBlocks.length - 1; row >= 0; row--) {
          // If current block is matched, find the first non-matched block above it
          if (newBlocks[row][col].matched) {
            let foundNonMatched = false;
            let sourceRow = row - 1;
            
            // Find the first non-matched block above
            while (sourceRow >= 0 && !foundNonMatched) {
              if (!newBlocks[sourceRow][col].matched) {
                foundNonMatched = true;
              } else {
                sourceRow--;
              }
            }
            
            // If found a non-matched block, move it down
            if (foundNonMatched) {
              newBlocks[row][col] = { ...newBlocks[sourceRow][col] };
              newBlocks[sourceRow][col] = { 
                ...newBlocks[sourceRow][col], 
                matched: true 
              };
            } else {
              // No non-matched blocks above, create a new random block
              const colorIndex = Math.floor(Math.random() * COLORS.length);
              const color = COLORS[colorIndex];
              
              // Random powerup (15% chance)
              const hasPowerup = Math.random() < 0.15;
              const powerupType = hasPowerup 
                ? POWERUPS[Math.floor(Math.random() * POWERUPS.length)]
                : null;
              
              newBlocks[row][col] = {
                id: `${row}-${col}-${Date.now()}`,
                color,
                selected: false,
                matched: false,
                powerup: powerupType
              };
            }
          }
        }
      }
      
      return newBlocks;
    });
    
    // Check if game is over
    setTimeout(() => {
      const isGameOver = checkGameOver();
      if (isGameOver) {
        setGameOver(true);
        
        // Show achievement
        showAchievement(
          'Block Blast Complete!',
          `You scored ${score} points.`,
          score
        );
      }
    }, 500);
  }, [checkGameOver, score, showAchievement, triggerAnimation]);
  
  // Render the game board
  return (
    <div className="h-full flex flex-col items-center p-4">
      {/* Game header */}
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="font-medium">Block Blast</h3>
        <div className="text-sm text-primary font-medium">
          Score: {score}
        </div>
      </div>
      
      {/* Game board */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="grid grid-cols-8 gap-1 mx-auto">
          {blocks.map((row, rowIndex) => 
            row.map((block, colIndex) => (
              <motion.div
                key={block.id}
                className={`w-9 h-9 rounded flex items-center justify-center cursor-pointer
                  ${block.matched ? 'opacity-0' : 'opacity-100'}
                  ${block.selected ? 'ring-2 ring-white ring-opacity-70' : ''}
                  ${block.color === 'blue' ? 'bg-blue-500' : 
                    block.color === 'green' ? 'bg-green-500' : 
                    block.color === 'purple' ? 'bg-purple-500' : 
                    block.color === 'red' ? 'bg-red-500' : 'bg-orange-500'}
                `}
                animate={{
                  scale: block.selected ? 1.1 : 1,
                  opacity: block.matched ? 0 : 1
                }}
                onClick={() => handleBlockClick(rowIndex, colIndex)}
              >
                {block.powerup && (
                  <div className="text-white text-xs">
                    {block.powerup === 'bomb' ? '💣' : 
                      block.powerup === 'lightning' ? '⚡' : '🌈'}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
      
      {/* Game controls */}
      <div className="mt-4 flex justify-between w-full">
        <Button
          variant="outline"
          onClick={initializeGame}
        >
          New Game
        </Button>
        
        <Button
          disabled={selectedBlocks.length < 2}
          onClick={handleClearSelected}
        >
          {selectedBlocks.length < 2 ? 'Select Blocks' : `Clear ${selectedBlocks.length} Blocks`}
        </Button>
      </div>
      
      {/* Game over overlay */}
      {gameOver && (
        <motion.div 
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="bg-card p-6 rounded-lg text-center space-y-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold">Game Over!</h3>
            <p className="text-lg">Your Score: <span className="text-primary font-bold">{score}</span></p>
            <Button onClick={initializeGame}>Play Again</Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}