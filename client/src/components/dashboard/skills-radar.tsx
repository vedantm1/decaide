import { useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Line, LineRadial } from '@visx/shape';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { PI_CATEGORIES } from '@shared/schema';

interface SkillData {
  category: string;
  score: number;
}

interface SkillsRadarProps {
  data: SkillData[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  className?: string;
}

// Utility function to convert polar to cartesian coordinates
const polarToCartesian = (angle: number, radius: number) => {
  return {
    x: radius * Math.cos(angle - Math.PI / 2),
    y: radius * Math.sin(angle - Math.PI / 2),
  };
};

export default function SkillsRadar({
  data,
  width = 400,
  height = 400,
  margin = { top: 40, right: 40, bottom: 40, left: 40 },
  className,
}: SkillsRadarProps) {
  const isMobile = useIsMobile();
  
  // Fallback if no data or empty data
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Skills Proficiency</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[280px]">
          <p className="text-muted-foreground">No skills data available yet</p>
        </CardContent>
      </Card>
    );
  }

  // Adjust dimensions for mobile
  if (isMobile) {
    width = Math.min(300, window.innerWidth - 48);
    height = width;
    margin = { top: 20, right: 20, bottom: 20, left: 20 };
  }

  // Define the maximum radar radius
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right, margin.bottom, margin.left);

  // Create radial scale
  const radiusScale = scaleLinear({
    domain: [0, 5], // Assuming scores are from 0-5
    range: [0, radius],
  });

  // Calculate angles for each category
  const angleStep = (2 * Math.PI) / data.length;

  // Prepare data for radar shape
  const radarPoints = data.map((d, i) => {
    const angle = i * angleStep;
    const radiusValue = radiusScale(d.score);
    return {
      x: centerX + radiusValue * Math.cos(angle - Math.PI / 2),
      y: centerY + radiusValue * Math.sin(angle - Math.PI / 2),
      category: d.category,
      score: d.score,
    };
  });

  // Prepare circles for the radar grid
  const circles = [1, 2, 3, 4, 5].map(level => ({
    level,
    radius: radiusScale(level),
  }));

  // Prepare lines from center to each vertex
  const spokes = data.map((_, i) => {
    const angle = i * angleStep;
    return {
      angle,
      x2: centerX + radius * Math.cos(angle - Math.PI / 2),
      y2: centerY + radius * Math.sin(angle - Math.PI / 2),
    };
  });

  // Prepare label positions
  const labels = data.map((d, i) => {
    const angle = i * angleStep;
    const labelRadius = radius + 15;
    return {
      category: d.category,
      x: centerX + labelRadius * Math.cos(angle - Math.PI / 2),
      y: centerY + labelRadius * Math.sin(angle - Math.PI / 2),
      angle,
    };
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Skills Proficiency</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <svg width={width} height={height}>
          <Group top={0} left={0}>
            {/* Radar grid circles */}
            {circles.map((circle, i) => (
              <circle
                key={`circle-${i}`}
                cx={centerX}
                cy={centerY}
                r={circle.radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                strokeOpacity={0.2}
              />
            ))}

            {/* Radar grid spokes */}
            {spokes.map((spoke, i) => (
              <Line
                key={`spoke-${i}`}
                from={{ x: centerX, y: centerY }}
                to={{ x: spoke.x2, y: spoke.y2 }}
                stroke="currentColor"
                strokeWidth={1}
                strokeOpacity={0.2}
              />
            ))}

            {/* Radar value shape */}
            <motion.path
              d={`M ${radarPoints.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')} Z`}
              fill="url(#radar-gradient)"
              fillOpacity={0.5}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* Data points */}
            {radarPoints.map((point, i) => (
              <motion.circle
                key={`point-${i}`}
                cx={point.x}
                cy={point.y}
                r={4}
                fill="hsl(var(--primary))"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
              />
            ))}

            {/* Category labels */}
            {labels.map((label, i) => {
              const textAnchor = 
                label.angle === 0 ? "middle" :
                label.angle < Math.PI ? "start" : 
                label.angle === Math.PI ? "middle" : "end";
              
              const dy = 
                label.angle === 0 ? "-0.5em" :
                label.angle < Math.PI ? "0.3em" : 
                label.angle === Math.PI ? "1em" : "0.3em";
              
              return (
                <text
                  key={`label-${i}`}
                  x={label.x}
                  y={label.y}
                  dy={dy}
                  textAnchor={textAnchor}
                  fontSize={isMobile ? 9 : 12}
                  fill="currentColor"
                >
                  {label.category}
                </text>
              );
            })}

            {/* Circle level labels (only show on non-mobile) */}
            {!isMobile && circles.map((circle) => (
              <text
                key={`level-${circle.level}`}
                x={centerX + 5}
                y={centerY - circle.radius + 2}
                fontSize={9}
                fill="currentColor"
                opacity={0.7}
              >
                {circle.level}
              </text>
            ))}
          </Group>

          {/* Gradient for radar fill */}
          <defs>
            <radialGradient id="radar-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
            </radialGradient>
          </defs>
        </svg>
      </CardContent>
    </Card>
  );
}