import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useSpring, animated, config } from '@react-spring/three';
import { Text, Float, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Color, Euler, Quaternion } from 'three';
import InteractiveCard from './interactive-card';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  description: string;
  position: [number, number, number];
}

interface NavigationSystemProps {
  colorScheme: string;
  isDarkMode: boolean;
}

const NavigationSystem: React.FC<NavigationSystemProps> = ({ 
  colorScheme,
  isDarkMode 
}) => {
  const [location, navigate] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [hoverItem, setHoverItem] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Get color based on scheme
  const getPrimaryColor = () => {
    const colors: Record<string, string> = {
      'aquaBlue': '#3b82f6',
      'coralPink': '#ec4899',
      'mintGreen': '#22c55e',
      'royalPurple': '#8b5cf6',
    };
    return colors[colorScheme] || colors.aquaBlue;
  };

  const primaryColor = getPrimaryColor();
  
  // Define menu items and their 3D positions
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊',
      path: '/',
      description: 'View your progress and stats',
      position: [-4, 2, 0]
    },
    {
      id: 'roleplay',
      title: 'Roleplay',
      icon: '🎭',
      path: '/roleplay',
      description: 'Practice roleplay scenarios',
      position: [-2, 1, 0]
    },
    {
      id: 'performance-indicators',
      title: 'Performance',
      icon: '📈',
      path: '/performance-indicators',
      description: 'Master performance indicators',
      position: [0, 0, 0]
    },
    {
      id: 'tests',
      title: 'Tests',
      icon: '📝',
      path: '/tests',
      description: 'Take practice tests',
      position: [2, 1, 0]
    },
    {
      id: 'written-events',
      title: 'Written Events',
      icon: '📄',
      path: '/written-events',
      description: 'Prepare your written submissions',
      position: [4, 2, 0]
    }
  ];
  
  // Find current active item based on location
  useEffect(() => {
    const currentPath = location === '/' ? 'dashboard' : 
      location.substring(1).split('/')[0];
    
    const matchedItem = menuItems.find(item => {
      if (item.id === 'dashboard' && location === '/') return true;
      return location.startsWith(item.path) && item.path !== '/';
    });
    
    setSelectedItem(matchedItem?.id || null);
  }, [location]);
  
  // Animation for expanding/collapsing menu
  const [springs, api] = useSpring(() => ({
    scale: 1,
    opacity: 1,
    config: { ...config.gentle, duration: 500 }
  }));
  
  // Expand menu on hover
  const handleExpandMenu = () => {
    setExpanded(true);
    api.start({
      scale: 1.2,
      opacity: 1,
      config: { ...config.wobbly, friction: 20 }
    });
  };
  
  // Collapse menu when not hovering
  const handleCollapseMenu = () => {
    setExpanded(false);
    api.start({
      scale: 1,
      opacity: 0.8,
      config: config.gentle
    });
  };
  
  // Handle menu item click
  const handleItemClick = (path: string) => {
    navigate(path);
    
    // Visual feedback animation
    api.start({
      scale: 0.95,
      config: { ...config.wobbly, friction: 12 }
    });
    
    setTimeout(() => {
      api.start({
        scale: 1,
        config: config.gentle
      });
    }, 150);
  };
  
  // Gentle floating animation for the entire menu
  useFrame((state) => {
    if (!groupRef.current || expanded) return;
    
    const t = state.clock.getElapsedTime() * 0.3;
    groupRef.current.position.y = Math.sin(t) * 0.05;
    groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.01;
  });
  
  return (
    <animated.group
      ref={groupRef}
      position={[-8, 0, 2]}
      scale={springs.scale}
      onPointerEnter={handleExpandMenu}
      onPointerLeave={handleCollapseMenu}
    >
      <group>
        {/* Menu background */}
        <mesh position={[0, 0, -0.5]} rotation={[0, 0, 0]}>
          <planeGeometry args={[12, 6]} />
          <meshStandardMaterial 
            color={isDarkMode ? "#1e293b" : "#f8fafc"}
            transparent
            opacity={0.1}
          />
        </mesh>
        
        {/* Menu items */}
        {menuItems.map((item) => (
          <InteractiveCard
            key={item.id}
            position={item.position}
            rotation={[0, 0, 0]}
            scale={0.8}
            width={2.5}
            height={1.5}
            color={item.id === selectedItem ? primaryColor : isDarkMode ? "#334155" : "#e2e8f0"}
            title={item.title}
            content={`${item.icon} ${item.description}`}
            onClick={() => handleItemClick(item.path)}
            isActive={item.id === selectedItem}
            isDarkMode={isDarkMode}
          />
        ))}
        
        {/* Menu title */}
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          <Text
            position={[0, 3, 0]}
            fontSize={0.5}
            color={isDarkMode ? "#ffffff" : "#0f172a"}
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-bold.woff"
          >
            DecA(I)de
          </Text>
        </Float>
      </group>
    </animated.group>
  );
};

export default NavigationSystem;