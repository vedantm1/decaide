import { useMemo } from 'react';
import { AreaClosed, LinePath, Bar } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataPoint {
  date: Date;
  value: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
  title: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  className?: string;
}

export default function PerformanceChart({
  data,
  title,
  width = 500,
  height = 300,
  margin = { top: 20, right: 20, bottom: 40, left: 40 },
  className,
}: PerformanceChartProps) {
  const isMobile = useIsMobile();
  
  // If no data or empty data, show placeholder message
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <p className="text-muted-foreground">No performance data available yet</p>
        </CardContent>
      </Card>
    );
  }

  // Adjust dimensions for mobile
  if (isMobile) {
    width = window.innerWidth - 48; // full width minus padding
    height = 220;
    margin = { top: 20, right: 10, bottom: 40, left: 30 };
  }

  // Bound calculations
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales and accessors
  const xAccessor = (d: DataPoint) => d.date;
  const yAccessor = (d: DataPoint) => d.value;

  // Create scales
  const xScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, innerWidth],
        domain: [Math.min(...data.map(d => d.date.getTime())), Math.max(...data.map(d => d.date.getTime()))],
      }),
    [innerWidth, data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [innerHeight, 0],
        domain: [0, Math.max(...data.map(yAccessor)) * 1.1], // Add 10% padding to the top
        nice: true,
      }),
    [innerHeight, data]
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <svg width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            <GridRows
              scale={yScale}
              width={innerWidth}
              strokeOpacity={0.2}
              stroke="currentColor"
            />
            <GridColumns
              scale={xScale}
              height={innerHeight}
              strokeOpacity={0.2}
              stroke="currentColor"
            />
            <AreaClosed<DataPoint>
              data={data}
              x={d => xScale(xAccessor(d))}
              y={d => yScale(yAccessor(d))}
              yScale={yScale}
              strokeWidth={2}
              curve={curveMonotoneX}
              fill="url(#area-gradient)"
              opacity={0.5}
            />
            <LinePath<DataPoint>
              data={data}
              x={d => xScale(xAccessor(d))}
              y={d => yScale(yAccessor(d))}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              curve={curveMonotoneX}
            />
            {data.map((d, i) => (
              <motion.circle
                key={`dot-${i}`}
                cx={xScale(xAccessor(d))}
                cy={yScale(yAccessor(d))}
                r={5}
                fill="hsl(var(--primary))"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              />
            ))}
            
            {/* X-axis labels */}
            {data.map((d, i) => (
              <text
                key={`x-label-${i}`}
                x={xScale(xAccessor(d))}
                y={innerHeight + 20}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
                opacity={isMobile && i % 2 !== 0 ? 0 : 0.7} // Skip every other label on mobile
              >
                {d.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </text>
            ))}
            
            {/* Y-axis labels */}
            {yScale.ticks(5).map((tick, i) => (
              <text
                key={`y-label-${i}`}
                x={-10}
                y={yScale(tick)}
                textAnchor="end"
                fontSize={10}
                fill="currentColor"
                opacity={0.7}
                dy="0.3em"
              >
                {tick}
              </text>
            ))}
          </Group>
          
          {/* Gradient for area */}
          <defs>
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </svg>
      </CardContent>
    </Card>
  );
}