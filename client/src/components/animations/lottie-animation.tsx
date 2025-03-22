import { useRef, useEffect } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
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
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (!lottieRef.current) return;
    
    // Set up completion callback if provided
    if (onComplete && !loop) {
      lottieRef.current.addEventListener('complete', onComplete);
      
      return () => {
        lottieRef.current?.removeEventListener('complete', onComplete);
      };
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
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}