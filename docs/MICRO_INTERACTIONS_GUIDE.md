# Micro-Interactions System Technical Guide

This document provides a comprehensive guide to the micro-interaction system implemented in DecA(I)de.

## Overview

The micro-interactions system is designed to create an engaging, game-like experience throughout the platform. By incorporating subtle visual feedback, animations, and rewards, we enhance user engagement and create a more enjoyable learning experience.

## Core Components

### 1. MicroInteractionsProvider

The central component that provides animation and notification capabilities throughout the application:

```tsx
// client/src/hooks/use-micro-interactions.tsx

export function MicroInteractionsProvider({ children }: { children: ReactNode }) {
  // State for various interactions and animations
  const [animationProps, setAnimationProps] = useState<{
    trigger: boolean,
    type: AnimationType,
    message?: string
  }>({
    trigger: false,
    type: 'random'
  });
  
  // Other state variables for various interactions...
  
  // Trigger animation function
  const triggerAnimation = useCallback((type: AnimationType = 'random', message?: string) => {
    setAnimationProps({
      trigger: true,
      type,
      message
    });
    
    // Reset after animation completes
    setTimeout(() => {
      setAnimationProps(prev => ({ ...prev, trigger: false }));
    }, 3000);
  }, []);
  
  // Other interaction functions...
  
  // Provide context to children
  return (
    <MicroInteractionsContext.Provider value={{
      triggerAnimation,
      showBreakTimer,
      hideBreakTimer,
      showBreakGame,
      hideBreakGame,
      showAchievement,
      startOnboarding
    }}>
      {children}
      
      {/* Animation components */}
      <SuccessAnimation
        trigger={animationProps.trigger}
        type={animationProps.type}
        message={animationProps.message}
      />
      
      {/* Other modal components */}
    </MicroInteractionsContext.Provider>
  );
}
```

### 2. Success Animations

Several types of animations for celebrating achievements:

```tsx
// client/src/components/animations/success-animation.tsx

export default function SuccessAnimation({ 
  trigger, 
  onComplete,
  type = 'random',
  message,
  duration = 3000
}: SuccessAnimationProps) {
  // Implementation details
}
```

### 3. ConfettiExplosion

A reusable confetti animation component:

```tsx
// client/src/components/animations/confetti-explosion.tsx

export default function ConfettiExplosion({
  duration = 3000,
  particleCount = 200,
  spread = 360,
  origin = { x: 0.5, y: 0.5 },
  colors,
  onComplete,
}: ConfettiExplosionProps) {
  // Implementation details
}
```

### 4. LottieAnimation

A wrapper for Lottie animations:

```tsx
// client/src/components/animations/lottie-animation.tsx

export default function LottieAnimation({
  animationData,
  loop = true,
  autoplay = true,
  className,
  style,
  width,
  height,
  onComplete,
  playOnHover = false
}: LottieAnimationProps) {
  // Implementation details
}
```

### 5. Break Timer System

A system to encourage healthy study breaks:

```tsx
// client/src/components/break-timer.tsx

export default function BreakTimer({ onClose, duration = 300 }: BreakTimerProps) {
  // Implementation details
}
```

### 6. Break Games

Educational mini-games for break time:

```tsx
// Memory Game for DECA terms
// client/src/components/break-timer/games/memory-game.tsx

// Block Blast puzzle game
// client/src/components/break-timer/games/block-blast.tsx

// Relaxation exercise
// client/src/components/break-timer/games/relax-break.tsx
```

### 7. Achievement System

```tsx
// Triggered via showAchievement function in MicroInteractionsProvider
```

## Animation Types

1. **Confetti**: Colorful particle explosion
2. **Stars**: Animated star bursts
3. **Circles**: Rippling circle animations
4. **Fireworks**: More dramatic particle effects
5. **Random**: Randomly selects one of the above

## Implementation Guide

### Adding Animations to New Components

1. Import the `useMicroInteractions` hook:

```tsx
import { useMicroInteractions } from '@/hooks/use-micro-interactions';
```

2. Extract the needed functions:

```tsx
const { triggerAnimation, showAchievement } = useMicroInteractions();
```

3. Trigger animations at appropriate moments:

```tsx
// On successful submission
const handleSubmit = async (data) => {
  try {
    await submitData(data);
    triggerAnimation('confetti', 'Successfully submitted!');
  } catch (error) {
    // Handle error
  }
};

// For achievements
const completeTask = () => {
  // Task logic
  showAchievement("Achievement Unlocked", "You completed your first task!", 20);
};
```

### Demonstration Component 

The `InteractionShowcase` component demonstrates all available micro-interactions:

```tsx
// client/src/components/micro-interactions/interaction-showcase.tsx
```

## Best Practices

1. **Use Sparingly**: Don't overwhelm users with too many animations at once
2. **Keep Lightweight**: Ensure animations don't impact performance
3. **Accessible**: Provide options to reduce motion for accessibility needs
4. **Meaningful**: Use animations to provide feedback on user actions
5. **Consistent**: Maintain consistent animation styles throughout the app

## Technical Details

### Animation Libraries

- Framer Motion: For component animations
- React Spring: For physics-based animations
- Lottie: For complex pre-designed animations
- Canvas Confetti: For confetti effects

### Performance Considerations

- Use `will-change` CSS property for GPU acceleration
- Lazy load animation data
- Use lightweight alternatives for lower-end devices

## Adding New Animation Types

1. Create new animation component in `client/src/components/animations/`
2. Add the type to the `AnimationType` union in `use-micro-interactions.tsx`
3. Update the `SuccessAnimation` component to handle the new type
4. Add to the `InteractionShowcase` component for testing

## Testing Animations

Use the `InteractionShowcase` page to test all available animations and interactions.

---

By following this guide, you can effectively use and extend the micro-interactions system to create engaging user experiences throughout the DecA(I)de platform.