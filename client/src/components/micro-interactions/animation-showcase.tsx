import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
// Import the playAnimation function from animation engine
import { playAnimation } from '@/lib/animation-engine';
// Import useMicroInteractions hook and AnimationType from our context
import { useMicroInteractions, AnimationType } from '@/hooks/use-micro-interactions';

// Animation categories for organization
const ANIMATION_CATEGORIES = {
  'Entry & Exit': [
    'fadeIn', 'fadeInUp', 'fadeInDown', 'zoomIn', 'slideInUp',
    'slideInDown', 'lightSpeedIn', 'rotateIn', 'rollIn', 'jackInTheBox'
  ],
  'Attention Grabbers': [
    'bounce', 'pulse', 'flash', 'tada', 'jello', 'rubber',
    'swing', 'wobble', 'shake', 'heartbeat'
  ],
  'Celebrations': [
    'confetti', 'stars', 'circles', 'fireworks', 'sparkles',
    'achievement', 'celebrate', 'success', 'levelUp', 'rewardUnlocked'
  ],
  'Playful': [
    'bubbles', 'waves', 'dolphin', 'tropical', 'rainbowTrail',
    'glitter', 'paperPlane', 'floatingNumbers', 'flipCard', 'rotate3D'
  ],
  'Micro Feedback': [
    'popIn', 'fadeScale', 'slideSwing', 'blinkFade', 'wiggle',
    'tremble', 'flipInX', 'flipInY', 'flip'
  ]
};

// Flatten all animations for dropdown
const ALL_ANIMATIONS = Object.values(ANIMATION_CATEGORIES).flat();

export default function AnimationShowcase() {
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType>('confetti');
  const [particleCount, setParticleCount] = useState(100);
  const [duration, setDuration] = useState(3000);
  const [useMessage, setUseMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('Great job!');
  const { triggerAnimation } = useMicroInteractions();

  const handleAnimationSelect = (value: string) => {
    setSelectedAnimation(value as AnimationType);
  };

  const playSelectedAnimation = () => {
    // Use both methods of playing animations
    
    // Method 1: Animation engine directly
    playAnimation({
      type: selectedAnimation as AnimationType,
      particleCount,
      duration,
      message: useMessage ? customMessage : undefined,
    });
    
    // Method 2: Through micro-interactions hook
    // This will trigger both legacy and new animations
    triggerAnimation(selectedAnimation as any, useMessage ? customMessage : undefined);
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Animation Showcase</h2>
      
      {/* Animation Selection Card */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Animation Controls</h3>
          <p className="text-sm text-muted-foreground">
            Select and customize animations to see them in action
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Animation Selection */}
          <div className="space-y-2">
            <Label htmlFor="animation-select">Animation Type</Label>
            <Select onValueChange={handleAnimationSelect} defaultValue={selectedAnimation}>
              <SelectTrigger id="animation-select">
                <SelectValue placeholder="Select an animation" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ANIMATION_CATEGORIES).map(([category, animations]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-sm font-semibold bg-muted/50">
                      {category}
                    </div>
                    {animations.map(animation => (
                      <SelectItem key={animation} value={animation}>
                        {animation}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Particle Count */}
          <div className="space-y-2">
            <Label htmlFor="particle-count">Particle Count: {particleCount}</Label>
            <Slider
              id="particle-count"
              min={10}
              max={300}
              step={10}
              value={[particleCount]}
              onValueChange={values => setParticleCount(values[0])}
            />
          </div>
          
          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration: {duration}ms</Label>
            <Slider
              id="duration"
              min={500}
              max={5000}
              step={100}
              value={[duration]}
              onValueChange={values => setDuration(values[0])}
            />
          </div>
          
          {/* Message Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="message-toggle">Show Message</Label>
              <p className="text-sm text-muted-foreground">Display a message with the animation</p>
            </div>
            <Switch
              id="message-toggle"
              checked={useMessage}
              onCheckedChange={setUseMessage}
            />
          </div>
        </div>
        
        {/* Custom Message Input */}
        {useMessage && (
          <div className="space-y-2">
            <Label htmlFor="custom-message">Custom Message</Label>
            <input
              id="custom-message"
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your custom message"
            />
          </div>
        )}
        
        {/* Play Button */}
        <Button 
          size="lg" 
          className="w-full mt-4"
          onClick={playSelectedAnimation}
        >
          Play {selectedAnimation} Animation
        </Button>
      </Card>
      
      {/* Animation Categories */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Animation Categories</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(ANIMATION_CATEGORIES).map(([category, animations]) => (
            <Card key={category} className="p-4 overflow-hidden">
              <h4 className="text-lg font-medium mb-2">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {animations.map(animation => (
                  <Button
                    key={animation}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setSelectedAnimation(animation as AnimationType);
                      playAnimation({ type: animation as AnimationType });
                    }}
                  >
                    {animation}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* CSS Animation Classes */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">CSS Animation Classes</h3>
        <p className="text-muted-foreground">
          Click on elements to see CSS animations in action
        </p>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div 
            className="p-4 bg-primary/10 rounded-lg text-center cursor-pointer hover:animate-bounce"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-primary/10 rounded-lg text-center cursor-pointer animate-bounce")}
          >
            Bounce
          </div>
          <div 
            className="p-4 bg-secondary/10 rounded-lg text-center cursor-pointer hover:animate-pulse"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-secondary/10 rounded-lg text-center cursor-pointer animate-pulse")}
          >
            Pulse
          </div>
          <div 
            className="p-4 bg-accent/10 rounded-lg text-center cursor-pointer hover:animate-spin"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-accent/10 rounded-lg text-center cursor-pointer animate-spin")}
          >
            Spin
          </div>
          <div 
            className="p-4 bg-muted rounded-lg text-center cursor-pointer"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-muted rounded-lg text-center cursor-pointer bounceIn")}
          >
            Bounce In
          </div>
          <div 
            className="p-4 bg-primary/10 rounded-lg text-center cursor-pointer"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-primary/10 rounded-lg text-center cursor-pointer fadeInUp")}
          >
            Fade In Up
          </div>
          <div 
            className="p-4 bg-secondary/10 rounded-lg text-center cursor-pointer"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-secondary/10 rounded-lg text-center cursor-pointer zoomIn")}
          >
            Zoom In
          </div>
          <div 
            className="p-4 bg-accent/10 rounded-lg text-center cursor-pointer"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-accent/10 rounded-lg text-center cursor-pointer flip")}
          >
            Flip
          </div>
          <div 
            className="p-4 bg-muted rounded-lg text-center cursor-pointer"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-muted rounded-lg text-center cursor-pointer jello")}
          >
            Jello
          </div>
          <div 
            className="p-4 bg-primary/10 rounded-lg text-center cursor-pointer"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-primary/10 rounded-lg text-center cursor-pointer tada")}
          >
            Tada
          </div>
          <div 
            className="p-4 bg-secondary/10 rounded-lg text-center cursor-pointer"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-secondary/10 rounded-lg text-center cursor-pointer swing")}
          >
            Swing
          </div>
          <div 
            className="p-4 bg-accent/10 rounded-lg text-center cursor-pointer"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-accent/10 rounded-lg text-center cursor-pointer heartbeat")}
          >
            Heartbeat
          </div>
          <div 
            className="p-4 bg-muted rounded-lg text-center cursor-pointer"
            onClick={(e) => (e.currentTarget.className = "p-4 bg-muted rounded-lg text-center cursor-pointer tremble")}
          >
            Tremble
          </div>
        </div>
      </div>
    </div>
  );
}