import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiExplosionProps {
  duration?: number;
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  onComplete?: () => void;
}

export default function ConfettiExplosion({
  duration = 3000,
  particleCount = 100,
  spread = 70,
  origin = { x: 0.5, y: 0.5 },
  colors,
  onComplete,
}: ConfettiExplosionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiInstance = useRef<confetti.CreateTypes | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Create confetti instance
    confettiInstance.current = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });
    
    // Fire confetti
    const end = Date.now() + duration;
    
    const frame = () => {
      if (!confettiInstance.current) return;
      
      // Options for confetti shot
      const options: confetti.Options = {
        particleCount: particleCount / 10,
        origin,
        spread,
        startVelocity: 30,
        gravity: 1.2,
        ticks: 60,
        zIndex: 1000,
        disableForReducedMotion: true,
      };
      
      // Add colors if provided
      if (colors && colors.length > 0) {
        options.colors = colors;
      }
      
      confettiInstance.current(options);
      
      // Continue animation until duration ends
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        if (onComplete) {
          onComplete();
        }
      }
    };
    
    frame();
    
    // Cleanup
    return () => {
      if (confettiInstance.current) {
        confettiInstance.current.reset();
      }
    };
  }, [duration, particleCount, spread, origin, colors, onComplete]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
}