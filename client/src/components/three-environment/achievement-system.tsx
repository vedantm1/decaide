import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useGLTF, Float } from '@react-three/drei';
import { useSpring, animated, config } from '@react-spring/three';
import { Color, Group, Vector3 } from 'three';

interface AchievementProps {
  title: string;
  description: string;
  points: number;
  color?: string;
  isVisible: boolean;
  onComplete: () => void;
  position?: [number, number, number];
  isDarkMode?: boolean;
}

// 3D Achievement animation component
const AchievementSystem: React.FC<AchievementProps> = ({
  title,
  description,
  points,
  color = '#3b82f6',
  isVisible,
  onComplete,
  position = [0, 0, 5],
  isDarkMode = false
}) => {
  const groupRef = useRef<Group>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const particlesRef = useRef<Group>(null);
  const themeColor = new Color(color);
  
  // Particle system
  const particleCount = 30;
  const particles = Array.from({ length: particleCount }).map(() => ({
    position: [
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4
    ],
    velocity: [
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2 + 0.1, // Bias upward
      (Math.random() - 0.5) * 0.2
    ],
    size: 0.1 + Math.random() * 0.2,
    color: themeColor.clone().multiplyScalar(0.5 + Math.random() * 0.5).getStyle()
  }));
  
  // Springs for animations
  const [springs, api] = useSpring(() => ({
    position: [0, -10, 5], // Start below the screen
    scale: 0,
    rotation: [0, 0, 0],
    opacity: 0,
    config: { ...config.wobbly, duration: 1000 }
  }));
  
  // Trophy rotation
  const [trophySprings, trophyApi] = useSpring(() => ({
    rotation: [0, 0, 0],
    config: { tension: 50, friction: 15 }
  }));
  
  // Start animation when achievement becomes visible
  useEffect(() => {
    if (isVisible) {
      // Reset animation state
      setAnimationComplete(false);
      
      // Animate in
      api.start({
        position,
        scale: 1,
        opacity: 1,
        rotation: [0, 0, 0],
        config: { ...config.wobbly, duration: 800 }
      });
      
      // Trophy spin
      trophyApi.start({
        rotation: [0, Math.PI * 4, 0],
        config: { tension: 70, friction: 10, duration: 2000 }
      });
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        api.start({
          position: [0, 10, 5], // Move above the screen
          scale: 0.5,
          opacity: 0,
          config: { ...config.gentle, duration: 800 }
        });
        
        setTimeout(() => {
          setAnimationComplete(true);
          onComplete();
        }, 1000);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, api, trophyApi, position, onComplete]);
  
  // Skip rendering if not visible and animation completed
  if (!isVisible && animationComplete) {
    return null;
  }
  
  // Particle animation
  useFrame(() => {
    if (!particlesRef.current || !isVisible) return;
    
    // Update particle positions
    Array.from(particlesRef.current.children).forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const particle = particles[i];
      
      // Update position based on velocity
      mesh.position.x += particle.velocity[0];
      mesh.position.y += particle.velocity[1];
      mesh.position.z += particle.velocity[2];
      
      // Slow down over time (drag)
      particle.velocity[0] *= 0.98;
      particle.velocity[1] *= 0.98;
      particle.velocity[2] *= 0.98;
      
      // Apply gravity
      particle.velocity[1] -= 0.003;
      
      // Fade out based on distance
      const opacity = 1 - Math.min(1, mesh.position.length() / 10);
      (mesh.material as THREE.MeshStandardMaterial).opacity = opacity;
    });
  });
  
  return (
    <animated.group
      ref={groupRef}
      position={springs.position}
      rotation={springs.rotation.to((x, y, z) => [x, y, z])}
      scale={springs.scale.to((s) => [s, s, s])}
      visible={springs.opacity.to((o) => o > 0.01)}
    >
      {/* Achievement Card */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5, 2.5, 0.2]} />
        <animated.meshStandardMaterial
          color={isDarkMode ? "#1e293b" : "#ffffff"}
          roughness={0.3}
          metalness={0.5}
          transparent
          opacity={springs.opacity}
        />
      </mesh>
      
      {/* Achievement title */}
      <Text
        position={[0, 0.7, 0.11]}
        fontSize={0.35}
        font="/fonts/inter-bold.woff"
        color={isDarkMode ? "#ffffff" : "#000000"}
        anchorX="center"
        anchorY="middle"
        maxWidth={4.5}
      >
        {title}
      </Text>
      
      {/* Achievement description */}
      <Text
        position={[0, 0, 0.11]}
        fontSize={0.25}
        color={isDarkMode ? "#e2e8f0" : "#334155"}
        anchorX="center"
        anchorY="middle"
        maxWidth={4.5}
      >
        {description}
      </Text>
      
      {/* Points */}
      <Text
        position={[0, -0.7, 0.11]}
        fontSize={0.3}
        font="/fonts/inter-medium.woff"
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {`+${points} Points`}
      </Text>
      
      {/* 3D Trophy */}
      <Float 
        position={[-1.8, 0, 0.3]} 
        speed={2}
        rotationIntensity={0.2}
        floatIntensity={0.5}
      >
        <animated.group rotation={trophySprings.rotation.to((x, y, z) => [x, y, z])}>
          {/* Trophy base */}
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 0.2, 16]} />
            <meshStandardMaterial
              color={isDarkMode ? "#d4af37" : "#ffd700"}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
          
          {/* Trophy stem */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
            <meshStandardMaterial
              color={isDarkMode ? "#d4af37" : "#ffd700"}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
          
          {/* Trophy cup */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.3, 0.15, 0.5, 16]} />
            <meshStandardMaterial
              color={isDarkMode ? "#d4af37" : "#ffd700"}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
          
          {/* Trophy handles */}
          <mesh position={[0.3, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.15, 0.04, 8, 16, Math.PI]} />
            <meshStandardMaterial
              color={isDarkMode ? "#d4af37" : "#ffd700"}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
          <mesh position={[-0.3, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.15, 0.04, 8, 16, Math.PI]} />
            <meshStandardMaterial
              color={isDarkMode ? "#d4af37" : "#ffd700"}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </animated.group>
      </Float>
      
      {/* Particle system */}
      <group ref={particlesRef}>
        {particles.map((particle, i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <sphereGeometry args={[particle.size, 8, 8]} />
            <meshStandardMaterial
              color={particle.color}
              transparent
              opacity={1}
              emissive={particle.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
    </animated.group>
  );
};

export default AchievementSystem;