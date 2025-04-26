import React from 'react';

interface AnimatedBackgroundProps {
  colorScheme?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  colorScheme = 'aquaBlue'
}) => {
  // Get color based on scheme
  const getColor = () => {
    const colors: Record<string, {primary: string, secondary: string}> = {
      'aquaBlue': { primary: '#3b82f6', secondary: '#1e3a8a' },
      'coralPink': { primary: '#ec4899', secondary: '#831843' },
      'mintGreen': { primary: '#22c55e', secondary: '#14532d' },
      'royalPurple': { primary: '#8b5cf6', secondary: '#581c87' },
    };
    return colors[colorScheme] || colors.aquaBlue;
  };
  
  const { primary, secondary } = getColor();
  
  return (
    <div className="animated-background">
      <div className="gradient-bg" style={{
        background: `radial-gradient(ellipse at center, ${primary}15 0%, ${secondary}05 70%)`
      }}></div>
      
      {/* Animated floating circles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div 
          key={i}
          className="floating-circle"
          style={{
            backgroundColor: primary,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 40 + 10}px`,
            height: `${Math.random() * 40 + 10}px`,
            opacity: Math.random() * 0.2 + 0.05,
            animationDuration: `${Math.random() * 20 + 10}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      
      {/* CSS is added through the global stylesheet */}
    </div>
  );
};

export default AnimatedBackground;