# DecA(I)de Micro-Interaction System Documentation

This document provides comprehensive documentation for the micro-interaction system in DecA(I)de, covering implementation details, usage guides, and technical specifications.

## Overview

The micro-interaction system is a core component of DecA(I)de's engagement layer, designed to create an addictive, game-like experience without being an actual game. The system includes animations, timers, mascot guidance, and reward mechanisms to maintain user engagement and reinforce learning behaviors.

## Key Components

### 1. Global Context Provider

The `MicroInteractionsProvider` serves as a central orchestrator for all micro-interactions across the application.

**Implementation Files:**
- `client/src/hooks/use-micro-interactions.tsx` - Context provider and hook
- `client/src/App.tsx` - Provider integration at app root

**Features:**
- Centralized state management for all micro-interaction components
- Context-aware interaction triggering based on user actions
- Responsive design adaptation using mobile detection
- Easy access through the `useMicroInteractions()` hook

**API:**

```typescript
// Type definitions
type AnimationType = 'confetti' | 'stars' | 'circles' | 'fireworks' | 'random';
type MascotPosition = 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';

// Hook interface
interface MicroInteractionsContextType {
  triggerAnimation: (type?: AnimationType, message?: string) => void;
  showBreakTimer: () => void;
  hideBreakTimer: () => void;
  showMascot: (message: string, position?: MascotPosition) => void;
  hideMascot: () => void;
}
```

### 2. Success Animation System

Visual celebration animations triggered on achievements or milestones.

**Implementation Files:**
- `client/src/components/animations/success-animation.tsx` - Core animation component
- `client/src/hooks/use-micro-interactions.tsx` - Animation triggering logic

**Technical Details:**
- Uses canvas-confetti library for particle generation
- Support for multiple animation types with different visual effects
- Optional message overlay with customizable text
- Automatic cleanup to prevent memory leaks
- Performance optimizations for mobile devices

**Properties:**

```typescript
interface SuccessAnimationProps {
  trigger: boolean;
  onComplete?: () => void;
  type?: 'confetti' | 'stars' | 'circles' | 'fireworks' | 'random';
  message?: string;
  duration?: number; // milliseconds
}
```

**Animation Types:**

| Type | Description | Visual Effect |
|------|-------------|---------------|
| `confetti` | Colorful paper-like particles | Multi-colored squares that fall with gravity |
| `stars` | Star-shaped particles | Golden stars that fade out gradually |
| `circles` | Circular particles | Colored circles that bounce and disappear |
| `fireworks` | Exploding particle effect | Bursts of color radiating outward |
| `random` | Randomly selects an effect | Random selection from the above types |

**Usage Example:**

```jsx
const { triggerAnimation } = useMicroInteractions();

// On completing a milestone or achievement
const handleCompleteMilestone = () => {
  triggerAnimation('fireworks', 'Congratulations on your 5-day streak!');
};
```

### 3. Break Timer System

A timed break system with mini-games to prevent burnout and improve retention.

**Implementation Files:**
- `client/src/components/break-timer.tsx` - Main timer component
- `client/src/components/break-timer/break-game-modal.tsx` - Game selection modal
- `client/src/components/break-timer/games/` - Individual game implementations

**Technical Details:**
- Default duration: 5 minutes (300 seconds)
- Countdown timer with visual progress indicator
- Three mini-game options to choose from
- Memory-efficient game implementations
- Responsive design for all screen sizes

**Break Timer Props:**

```typescript
interface BreakTimerProps {
  onClose: () => void;
  duration?: number; // seconds, defaults to 300
}
```

**Mini-Games:**

1. **Relax Break**
   - Implementation: `client/src/components/break-timer/games/relax-break.tsx`
   - Features: Guided breathing exercise with animated circle that expands and contracts
   - Technical: Uses CSS animations and SVG circles for smooth animation

2. **Memory Game**
   - Implementation: `client/src/components/break-timer/games/memory-game.tsx`
   - Features: Card matching game using DECA terminology and concepts
   - Technical: 
     - Uses React state for card flipping logic
     - Customizable difficulty levels (beginner, intermediate, advanced)
     - Time tracking and scoring system
     - Data structure for cards:
       ```typescript
       interface Card {
         id: number;
         term: string;
         definition: string;
         matched: boolean;
         flipped: boolean;
         category: string;
       }
       ```

3. **Block Blast**
   - Implementation: `client/src/components/break-timer/games/block-blast.tsx`
   - Features: Match-3 style puzzle game with business-themed powerups
   - Technical:
     - Grid-based game mechanics with block matching algorithms
     - Special powerup blocks with unique effects
     - Score multiplier system
     - Data structure for blocks:
       ```typescript
       interface Block {
         id: string;
         color: string;
         selected: boolean;
         matched: boolean;
         powerup: string | null;
       }
       ```

**Usage Example:**

```jsx
const { showBreakTimer, hideBreakTimer } = useMicroInteractions();

// After 25 minutes of focused work
const startBreakTimer = () => {
  showBreakTimer();
};

// To manually close the timer
const closeBreakTimer = () => {
  hideBreakTimer();
};
```

### 4. Diego the Mascot

A friendly dolphin mascot that provides contextual guidance and personalization.

**Implementation Files:**
- `client/src/hooks/use-micro-interactions.tsx` - Mascot state and rendering logic

**Technical Details:**
- Position customization for different screen locations
- Animated entrance and exit using Framer Motion
- Dismissible interface with click handlers
- Adaptive sizing for different screen dimensions

**Mascot API:**

```typescript
showMascot: (message: string, position?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left') => void;
hideMascot: () => void;
```

**Usage Example:**

```jsx
const { showMascot, hideMascot } = useMicroInteractions();

// Show contextual guidance
const showHelpTip = () => {
  showMascot("Try focusing on these performance indicators before your next practice.", "bottom-right");
};

// Hide the mascot
const dismissMascot = () => {
  hideMascot();
};
```

### 5. Streak Counter & Reward System

A gamified tracking system for consistent usage and learning streaks.

**Implementation Files:**
- `client/src/components/micro-interactions/interaction-showcase.tsx` - Example implementation

**Technical Details:**
- Streak counting with persistent storage
- Badge awarding at milestone achievements
- Visual feedback with animations at key milestones
- Responsive design with animated transitions

**Data Structure:**

```typescript
interface UserStreak {
  count: number;
  lastActivity: Date;
  badges: string[];
}
```

**Badge System:**
- Commitment Champion: 10-day streak
- Study Master: 30-day streak
- PI Expert: Complete all PIs in a category
- Test Ace: Score 90%+ on 5 practice tests
- Roleplay Pro: Complete 20 roleplay scenarios

**Usage Example:**

```jsx
const incrementStreak = () => {
  // Update streak count
  const newStreak = streakCount + 1;
  setStreakCount(newStreak);
  
  // Handle milestone achievements
  if (newStreak % 5 === 0) {
    // Trigger celebratory animation
    triggerAnimation('fireworks', `${newStreak} Day Streak! Keep it up!`);
  }
  
  // Award badges at specific milestones
  if (newStreak === 10) {
    awardBadge('commitment-champion');
  }
};
```

## Mobile Responsiveness

The micro-interaction system is fully responsive across all device sizes.

**Implementation Files:**
- `client/src/hooks/use-mobile.tsx` - Mobile detection utility

**Technical Details:**
- Breakpoint detection at 768px width
- Event listeners for window resize
- Performance optimizations for animations on mobile
- Touch-friendly interactions for all game components

**Usage Example:**

```jsx
import { useIsMobile } from '@/hooks/use-mobile';

function ResponsiveComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
      {/* Responsive content */}
    </div>
  );
}
```

## Integration Guidelines

### Adding New Animations

To add a new animation type:

1. Update the `AnimationType` type in `use-micro-interactions.tsx`
2. Add the new animation logic in `success-animation.tsx`
3. Test across different device sizes
4. Document in this file

### Creating New Mini-Games

To add a new break timer mini-game:

1. Create a new component in `client/src/components/break-timer/games/`
2. Add the game option to the selection modal in `break-game-modal.tsx`
3. Implement game mechanics with responsive design
4. Test performance on low-end devices
5. Document in this file

### Best Practices

- Limit particle count in animations for better performance
- Use CSS transitions/animations where possible instead of JavaScript
- Implement proper cleanup to prevent memory leaks
- Test all interactions on mobile devices
- Balance frequency of animations to prevent animation fatigue
- Keep mascot messages concise and contextually relevant
- Ensure all games are accessible with keyboard controls

## Performance Considerations

**Animation Performance:**
- Reduce animation complexity on mobile devices
- Use requestAnimationFrame for smooth animations
- Implement throttling for particle-heavy effects
- Consider device capability detection

**Memory Management:**
- Clean up event listeners when components unmount
- Dispose of canvas elements properly
- Use weak references for non-critical caches
- Monitor for memory leaks during development

## Future Enhancements

Planned improvements to the micro-interaction system:

1. Add more animation types (bubbles, spotlight, etc.)
2. Implement adaptive timing based on user behavior
3. Create additional mini-games with DECA-specific content
4. Add sound effects with volume control and mute option
5. Implement accessibility improvements (ARIA roles, keyboard navigation)
6. Create an analytics system to track engagement metrics