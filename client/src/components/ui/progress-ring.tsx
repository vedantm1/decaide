import { useEffect, useRef } from "react";

interface ProgressRingProps {
  radius?: number;
  stroke?: number;
  progress: number;
  className?: string;
  strokeColor?: string;
  bgColor?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  radius = 42,
  stroke = 4,
  progress = 0,
  className = "",
  strokeColor = "hsl(var(--primary))",
  bgColor = "hsl(var(--muted))",
  children
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = strokeDashoffset.toString();
    }
  }, [strokeDashoffset]);

  return (
    <div className={`relative ${className}`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke={bgColor}
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          ref={circleRef}
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.35s" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export default ProgressRing;
