import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useMicroInteractions } from '@/hooks/use-micro-interactions';

// Game colors with brightness variations for better visuals
const COLORS = ['blue', 'green', 'purple', 'red', 'orange', 'teal'] as const;

// Tile Types
type TileType = 'I' | 'O' | 'L' | 'J' | 'S' | 'Z' | 'T';

// Tile shapes (based on a 3x3 grid for most pieces, except I which is 4x1)
const TILE_SHAPES: Record<TileType, boolean[][]> = {
  'I': [[true, true, true, true]], // straight (horizontal)
  'O': [[true, true], [true, true]], // 2x2 square
  'L': [[true, false], [true, false], [true, true]], // L shape
  'J': [[false, true], [false, true], [true, true]], // J shape (mirrored L)
  'S': [[false, true, true], [true, true, false]], // S shape
  'Z': [[true, true, false], [false, true, true]], // Z shape (mirrored S)
  'T': [[true, true, true], [false, true, false]], // T shape
};

// Tile probabilities - higher numbers mean higher chances
const TILE_PROBABILITIES: Record<TileType, number> = {
  'I': 10, // Easy - straight
  'O': 10, // Easy - block
  'L': 5,  // Medium - L shape
  'J': 5,  // Medium - J shape
  'S': 3,  // Hard - S shape
  'Z': 3,  // Hard - Z shape
  'T': 3,  // Hard - T shape
};

// Grid cell interface
interface Cell {
  filled: boolean;
  color: string;
}

// Tile interface
interface Tile {
  id: string;
  type: TileType;
  shape: boolean[][];
  color: string;
  position?: { x: number, y: number }; // Position when dragging/placing
  width: number;
  height: number;
}

export default function BlockBlast() {
  const { triggerAnimation, showAchievement } = useMicroInteractions();
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [availableTiles, setAvailableTiles] = useState<Tile[]>([]);
  const [activeTile, setActiveTile] = useState<Tile | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const cellSize = 30; // Size of each grid cell in pixels
  const gridSize = 8; // 8x8 grid
  
  // Initialize the game
  const initializeGame = useCallback(() => {
    // Create empty grid
    const emptyGrid: Cell[][] = Array(gridSize).fill(0).map(() => 
      Array(gridSize).fill(0).map(() => ({ filled: false, color: '' }))
    );
    
    setGrid(emptyGrid);
    setScore(0);
    setGameOver(false);
    
    // Generate initial tiles
    generateNewTiles();
  }, []);
  
  // Generate a single new tile
  const generateTile = useCallback((existingTiles: Tile[] = []): Tile => {
    // Get all tile types
    const tileTypes = Object.keys(TILE_SHAPES) as TileType[];
    
    // Weighted random selection based on probabilities
    const totalWeight = tileTypes.reduce((sum, type) => sum + TILE_PROBABILITIES[type], 0);
    let randomWeight = Math.random() * totalWeight;
    let selectedType: TileType = 'I'; // Default
    
    // Find the tile type based on random weight
    for (const type of tileTypes) {
      randomWeight -= TILE_PROBABILITIES[type];
      if (randomWeight <= 0) {
        selectedType = type;
        break;
      }
    }
    
    // Make sure we don't generate the same tile twice in a batch
    if (existingTiles.some(t => t.type === selectedType)) {
      return generateTile(existingTiles);
    }
    
    const shape = TILE_SHAPES[selectedType];
    const colorIndex = Math.floor(Math.random() * COLORS.length);
    
    return {
      id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: selectedType,
      shape: shape,
      color: COLORS[colorIndex],
      width: shape[0].length,
      height: shape.length
    };
  }, []);
  
  // Generate new tiles when needed
  const generateNewTiles = useCallback(() => {
    // Generate 3 new available tiles
    const newTiles: Tile[] = [];
    for (let i = 0; i < 3; i++) {
      newTiles.push(generateTile(newTiles));
    }
    
    // Check if any of the new tiles can be placed
    let canPlace = false;
    for (const tile of newTiles) {
      if (canPlaceTileAnywhere(tile)) {
        canPlace = true;
        break;
      }
    }
    
    // If no tile can be placed, game over
    if (!canPlace) {
      setGameOver(true);
      showAchievement(
        'Block Blast Complete!',
        `You scored ${score} points.`,
        score
      );
    }
    
    setAvailableTiles(newTiles);
  }, [generateTile, score, showAchievement]);
  
  // Check if a tile can be placed anywhere on the grid
  const canPlaceTileAnywhere = useCallback((tile: Tile) => {
    for (let y = 0; y <= gridSize - tile.height; y++) {
      for (let x = 0; x <= gridSize - tile.width; x++) {
        if (canPlaceTile(tile, x, y)) {
          return true;
        }
      }
    }
    return false;
  }, []);
  
  // Check if a tile can be placed at a specific position
  const canPlaceTile = useCallback((tile: Tile, startX: number, startY: number) => {
    // Check each cell of the tile shape
    for (let y = 0; y < tile.height; y++) {
      for (let x = 0; x < tile.width; x++) {
        if (tile.shape[y][x]) {
          // Position on the grid
          const gridX = startX + x;
          const gridY = startY + y;
          
          // Check if out of bounds
          if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) {
            return false;
          }
          
          // Check if cell is already filled
          if (grid[gridY][gridX].filled) {
            return false;
          }
        }
      }
    }
    return true;
  }, [grid]);
  
  // Place a tile on the grid
  const placeTile = useCallback((tile: Tile, startX: number, startY: number) => {
    if (!canPlaceTile(tile, startX, startY)) {
      return false;
    }
    
    // Update the grid
    setGrid(prev => {
      const newGrid = [...prev.map(row => [...row])];
      
      // Place each cell of the tile
      for (let y = 0; y < tile.height; y++) {
        for (let x = 0; x < tile.width; x++) {
          if (tile.shape[y][x]) {
            newGrid[startY + y][startX + x] = {
              filled: true,
              color: tile.color
            };
          }
        }
      }
      
      return newGrid;
    });
    
    return true;
  }, [canPlaceTile]);
  
  // Check and clear rows and columns
  const checkAndClearLines = useCallback(() => {
    let rowsCleared = 0;
    let colsCleared = 0;
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];
    
    // Check rows
    for (let y = 0; y < gridSize; y++) {
      let isRowFull = true;
      for (let x = 0; x < gridSize; x++) {
        if (!grid[y][x].filled) {
          isRowFull = false;
          break;
        }
      }
      if (isRowFull) {
        rowsToClear.push(y);
        rowsCleared++;
      }
    }
    
    // Check columns
    for (let x = 0; x < gridSize; x++) {
      let isColFull = true;
      for (let y = 0; y < gridSize; y++) {
        if (!grid[y][x].filled) {
          isColFull = false;
          break;
        }
      }
      if (isColFull) {
        colsToClear.push(x);
        colsCleared++;
      }
    }
    
    // If we have rows or columns to clear
    if (rowsCleared > 0 || colsCleared > 0) {
      // Calculate points (more points for clearing multiple lines)
      const points = (rowsCleared * 100) + (colsCleared * 100) + 
                     ((rowsCleared + colsCleared > 1) ? 50 * (rowsCleared + colsCleared) : 0);
      
      // Update score
      setScore(prev => prev + points);
      
      // Show animation based on how many lines cleared
      if (rowsCleared + colsCleared >= 3) {
        triggerAnimation('fireworks');
      } else if (rowsCleared + colsCleared === 2) {
        triggerAnimation('stars');
      } else {
        triggerAnimation('confetti');
      }
      
      // Clear the rows and columns
      setGrid(prev => {
        const newGrid = [...prev.map(row => [...row])];
        
        // Clear rows
        rowsToClear.forEach(rowIdx => {
          for (let x = 0; x < gridSize; x++) {
            newGrid[rowIdx][x] = { filled: false, color: '' };
          }
        });
        
        // Clear columns
        colsToClear.forEach(colIdx => {
          for (let y = 0; y < gridSize; y++) {
            newGrid[y][colIdx] = { filled: false, color: '' };
          }
        });
        
        return newGrid;
      });
      
      return true;
    }
    
    return false;
  }, [grid, triggerAnimation]);
  
  // Handle drag start
  const handleDragStart = (tile: Tile) => {
    setActiveTile(tile);
  };
  
  // Handle drag end and attempt to place tile
  const handleDragEnd = () => {
    if (!activeTile || !boardRef.current) return;
    
    // Get board position and dimensions
    const boardRect = boardRef.current.getBoundingClientRect();
    
    // Calculate the grid position
    const gridX = Math.floor((dragPosition.x - boardRect.left) / cellSize);
    const gridY = Math.floor((dragPosition.y - boardRect.top) / cellSize);
    
    // Try to place the tile
    const placed = placeTile(activeTile, gridX, gridY);
    
    if (placed) {
      // Remove the placed tile from available tiles
      setAvailableTiles(prev => prev.filter(t => t.id !== activeTile.id));
      
      // Check if any rows or columns can be cleared
      setTimeout(() => {
        const linesCleared = checkAndClearLines();
        
        // If no tiles remain, generate new ones
        if (availableTiles.length === 1) {
          setTimeout(generateNewTiles, 300);
        }
      }, 100);
    }
    
    setActiveTile(null);
  };
  
  // Handle dragging
  const handleDrag = (e: any, info: any) => {
    setDragPosition({ x: info.point.x, y: info.point.y });
  };
  
  // Start a new game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  // Render the tile preview
  const renderTilePreview = (tile: Tile, index: number) => {
    return (
      <motion.div
        key={tile.id}
        className="relative mb-4 touch-none"
        style={{
          width: `${cellSize * tile.width}px`,
          height: `${cellSize * tile.height}px`,
        }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={1}
        dragMomentum={false}
        onDragStart={() => handleDragStart(tile)}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
        whileDrag={{ scale: 1.05, opacity: 0.8, zIndex: 50 }}
      >
        {tile.shape.map((row, y) =>
          row.map((cell, x) => 
            cell && (
              <div
                key={`${x}-${y}`}
                className="absolute border border-white/30"
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  left: `${x * cellSize}px`,
                  top: `${y * cellSize}px`,
                  backgroundColor: tile.color === 'blue' ? '#3b82f6' : 
                                  tile.color === 'green' ? '#22c55e' : 
                                  tile.color === 'purple' ? '#a855f7' : 
                                  tile.color === 'red' ? '#ef4444' : 
                                  tile.color === 'orange' ? '#f97316' : '#0d9488'
                }}
              />
            )
          )
        )}
      </motion.div>
    );
  };
  
  // Render the game grid
  const renderGrid = () => {
    return (
      <div 
        ref={boardRef}
        className="grid grid-cols-8 gap-0 border-2 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
        style={{ width: `${cellSize * gridSize}px`, height: `${cellSize * gridSize}px` }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`
                border border-gray-200 dark:border-gray-700
                ${cell.filled ? '' : 'bg-gray-50 dark:bg-gray-900/50'}
              `}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: cell.filled ? 
                  (cell.color === 'blue' ? '#3b82f6' : 
                   cell.color === 'green' ? '#22c55e' : 
                   cell.color === 'purple' ? '#a855f7' : 
                   cell.color === 'red' ? '#ef4444' : 
                   cell.color === 'orange' ? '#f97316' : '#0d9488') : ''
              }}
            />
          ))
        )}
      </div>
    );
  };
  
  // Render ghost preview when dragging
  const renderGhostPreview = () => {
    if (!activeTile || !boardRef.current) return null;
    
    const boardRect = boardRef.current.getBoundingClientRect();
    const gridX = Math.floor((dragPosition.x - boardRect.left) / cellSize);
    const gridY = Math.floor((dragPosition.y - boardRect.top) / cellSize);
    
    const canPlace = canPlaceTile(activeTile, gridX, gridY);
    
    return (
      <div 
        className="absolute pointer-events-none"
        style={{ 
          left: `${boardRect.left + gridX * cellSize}px`, 
          top: `${boardRect.top + gridY * cellSize}px`,
          zIndex: 40
        }}
      >
        {activeTile.shape.map((row, y) =>
          row.map((cell, x) => 
            cell && (
              <div
                key={`ghost-${x}-${y}`}
                className="absolute border-2"
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  left: `${x * cellSize}px`,
                  top: `${y * cellSize}px`,
                  backgroundColor: canPlace ? 'rgba(74, 222, 128, 0.3)' : 'rgba(252, 165, 165, 0.3)',
                  borderColor: canPlace ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                }}
              />
            )
          )
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col items-center p-4 relative overflow-hidden">
      {/* Game header */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h3 className="font-medium">Block Blast</h3>
          <p className="text-xs text-muted-foreground">Drag pieces to clear rows & columns</p>
        </div>
        <div className="text-sm text-primary font-medium">
          Score: {score}
        </div>
      </div>
      
      {/* Game layout */}
      <div className="flex flex-col-reverse md:flex-row gap-8 items-center">
        {/* Tile selection area */}
        <div className="flex flex-row md:flex-col items-center justify-center gap-4 mt-4 md:mt-0">
          {availableTiles.map((tile, index) => renderTilePreview(tile, index))}
        </div>
        
        {/* Game board */}
        <div className="relative flex items-start justify-center">
          {renderGrid()}
          {activeTile && renderGhostPreview()}
        </div>
      </div>
      
      {/* Game controls */}
      <div className="mt-6 flex justify-between w-full">
        <Button
          variant="outline"
          onClick={initializeGame}
        >
          New Game
        </Button>
        
        <Button
          variant="outline"
          onClick={generateNewTiles}
          disabled={availableTiles.length > 0}
        >
          Skip Tiles (Game Over)
        </Button>
      </div>
      
      {/* Game over overlay */}
      {gameOver && (
        <motion.div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="bg-card p-6 rounded-lg text-center space-y-6 max-w-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold">Game Over!</h3>
            <p>No more valid moves available.</p>
            <p className="text-lg">Your Score: <span className="text-primary font-bold">{score}</span></p>
            <Button size="lg" onClick={initializeGame}>Play Again</Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}