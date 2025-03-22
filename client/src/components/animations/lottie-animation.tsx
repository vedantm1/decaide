import { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  onComplete?: () => void;
  playOnHover?: boolean;
}

export default function LottieAnimation({
  animationData,
  loop = true,
  autoplay = true,
  className,
  style,
  width,
  height,
  onComplete,
  playOnHover = false,
}: LottieAnimationProps) {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (!lottieRef.current) return;
    
    // Set up completion callback if provided
    if (onComplete && !loop) {
      // Use the onComplete prop from lottie-react instead of event listeners
      // The component will handle passing completion events to this callback
    }
  }, [onComplete, loop]);

  // Mouse interaction handlers
  const handleMouseEnter = () => {
    if (playOnHover && lottieRef.current) {
      lottieRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (playOnHover && lottieRef.current) {
      lottieRef.current.stop();
    }
  };

  return (
    <div 
      className={cn("inline-block", className)}
      style={{ 
        ...style,
        width: width,
        height: height
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={playOnHover ? false : autoplay}
        onComplete={!loop ? onComplete : undefined}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}