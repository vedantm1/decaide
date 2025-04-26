import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated, config } from '@react-spring/three';
import { Text, Float } from '@react-three/drei';
import { Color, MeshStandardMaterial } from 'three';

interface InteractiveCardProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  title?: string;
  content?: string;
  onClick?: () => void;
  isActive?: boolean;
  isDarkMode?: boolean;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 4,
  height = 3,
  depth = 0.1,
  color = '#3b82f6',
  title = '',
  content = '',
  onClick,
  isActive = false,
  isDarkMode = false,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Convert hex color to Three.js color
  const themeColor = new Color(color);
  
  // Springs for smooth animations
  const [springs, api] = useSpring(() => ({
    scale: scale,
    rotation: rotation,
    position: position,
    color: themeColor.getStyle(),
    config: config.gentle
  }));
  
  // Update spring when props change
  useEffect(() => {
    api.start({
      position,
      rotation,
      scale,
      color: themeColor.getStyle(),
      config: { ...config.gentle, friction: 60 }
    });
  }, [position, rotation, scale, color, api]);
  
  // Hover and click effects
  useEffect(() => {
    api.start({
      scale: hovered ? scale * 1.05 : clicked ? scale * 0.95 : isActive ? scale * 1.1 : scale,
      rotation: [
        rotation[0] + (hovered ? 0.1 : 0),
        rotation[1] + (hovered ? 0.1 : 0),
        rotation[2]
      ],
      config: config.wobbly
    });
  }, [hovered, clicked, isActive, scale, rotation, api]);
  
  // Gentle floating animation
  useFrame((state) => {
    if (!meshRef.current || clicked || isActive) return;
    
    const t = state.clock.getElapsedTime() * 0.4;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.05;
  });
  
  // Handle interactions
  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    setClicked(!clicked);
    if (onClick) onClick();
    
    // Visual feedback animation
    api.start({
      scale: scale * 0.95,
      config: { ...config.wobbly, friction: 12 }
    });
    
    setTimeout(() => {
      api.start({
        scale: isActive ? scale * 1.1 : scale,
        config: config.gentle
      });
      setClicked(false);
    }, 150);
  };

  return (
    <Float 
      speed={1} 
      rotationIntensity={0.1} 
      floatIntensity={0.2}
      enabled={!clicked && !isActive}
    >
      <animated.mesh
        ref={meshRef}
        position={springs.position}
        rotation={springs.rotation.to((x, y, z) => [x, y, z])}
        scale={springs.scale}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        {/* Card body */}
        <boxGeometry args={[width, height, depth]} />
        <animated.meshStandardMaterial
          color={springs.color}
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={0.9}
        />
        
        {/* Card title */}
        {title && (
          <Text
            position={[0, height / 2 - 0.5, depth / 2 + 0.01]}
            fontSize={0.3}
            color={isDarkMode ? "#ffffff" : "#000000"}
            anchorX="center"
            anchorY="top"
            maxWidth={width - 0.4}
            lineHeight={1.2}
            font="/fonts/inter-bold.woff"
          >
            {title}
          </Text>
        )}
        
        {/* Card content */}
        {content && (
          <Text
            position={[0, 0, depth / 2 + 0.01]}
            fontSize={0.2}
            color={isDarkMode ? "#e2e8f0" : "#334155"}
            anchorX="center"
            anchorY="middle"
            maxWidth={width - 0.6}
            lineHeight={1.4}
          >
            {content}
          </Text>
        )}
      </animated.mesh>
    </Float>
  );
};

export default InteractiveCard;