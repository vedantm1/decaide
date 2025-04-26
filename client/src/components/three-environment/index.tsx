import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, MeshReflectorMaterial, Text, Float } from '@react-three/drei';
import { Color, Vector3, Group } from 'three';
import * as THREE from 'three';
import { useSpring, animated, config } from '@react-spring/three';

// Main ThreeJS environment wrapper
const ThreeEnvironment: React.FC<{
  colorScheme: string;
  eventType?: string;
  children?: React.ReactNode;
}> = ({ colorScheme, eventType = 'default', children }) => {
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
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden -z-10">
      <Canvas
        dpr={[1, 2]} // Dynamic resolution scaling
        camera={{ position: [0, 0, 15], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        style={{ background: 'transparent' }}
      >
        {/* Camera setup with subtle movement */}
        <DynamicCamera isDarkMode={isDarkMode} />
        
        {/* Environment lighting */}
        <ambientLight intensity={isDarkMode ? 0.2 : 0.5} />
        <directionalLight 
          position={[10, 10, 10]} 
          intensity={isDarkMode ? 0.5 : 1} 
          color={isDarkMode ? "#6b7280" : "#ffffff"} 
        />
        <Environment preset={isDarkMode ? "night" : "sunset"} />
        
        {/* Business-themed 3D environment based on event type */}
        <BusinessEnvironment 
          primaryColor={primaryColor}
          eventType={eventType}
          isDarkMode={isDarkMode}
        />
        
        {/* Interactive floating elements */}
        <FloatingElements 
          primaryColor={primaryColor}
          isDarkMode={isDarkMode}
        />
        
        {/* Ground reflective surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
          <planeGeometry args={[100, 100]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={2048}
            mixBlur={1}
            mixStrength={isDarkMode ? 0.1 : 0.05}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color={isDarkMode ? "#0f172a" : "#f8fafc"}
            metalness={0.1}
            mirror={0.5}
          />
        </mesh>

        {children}
      </Canvas>
    </div>
  );
};

// Dynamic camera with subtle movement
const DynamicCamera = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const { camera } = useThree();
  const time = useRef(0);
  
  useFrame((state) => {
    time.current += 0.01;
    // Very subtle camera movement
    camera.position.x = Math.sin(time.current * 0.2) * 0.5;
    camera.position.y = Math.sin(time.current * 0.1) * 0.5 + 1;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
};

// Business environment based on DECA event type
const BusinessEnvironment = ({ 
  primaryColor, 
  eventType,
  isDarkMode 
}: { 
  primaryColor: string, 
  eventType: string,
  isDarkMode: boolean
}) => {
  // Different environments based on event type
  const environments: Record<string, React.ReactNode> = {
    'finance': <FinanceEnvironment primaryColor={primaryColor} isDarkMode={isDarkMode} />,
    'marketing': <MarketingEnvironment primaryColor={primaryColor} isDarkMode={isDarkMode} />,
    'hospitality': <HospitalityEnvironment primaryColor={primaryColor} isDarkMode={isDarkMode} />,
    'default': <DefaultEnvironment primaryColor={primaryColor} isDarkMode={isDarkMode} />
  };
  
  return <>{environments[eventType] || environments.default}</>;
};

// Default business environment
const DefaultEnvironment = ({ primaryColor, isDarkMode }: { primaryColor: string, isDarkMode: boolean }) => {
  // Convert hex color to Three.js color
  const color = new Color(primaryColor);
  
  // Animated grid parameters with react-spring
  const [spring, api] = useSpring(() => ({
    scale: 1,
    rotation: [0, 0, 0],
    color: isDarkMode ? color.clone().multiplyScalar(0.3).getStyle() : primaryColor,
    config: { mass: 2, tension: 200, friction: 40 }
  }));
  
  // Update spring when props change
  useEffect(() => {
    api.start({
      color: isDarkMode ? color.clone().multiplyScalar(0.3).getStyle() : primaryColor,
      config: config.gentle
    });
  }, [primaryColor, isDarkMode, api]);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.1;
    api.start({
      rotation: [Math.sin(t) * 0.1, Math.cos(t) * 0.1, 0]
    });
  });
  
  return (
    <group position={[0, 0, -10]}>
      {/* Animated grid */}
      <animated.mesh
        position={[0, 0, -10]}
        rotation={spring.rotation.to((x, y, z) => [x, y, z])}
        scale={spring.scale}
      >
        <planeGeometry args={[50, 50, 25, 25]} />
        <animated.meshStandardMaterial
          color={spring.color}
          wireframe
          opacity={0.2}
          transparent
        />
      </animated.mesh>
      
      {/* Abstract business shapes */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Float key={i} speed={i * 0.1 + 0.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10,
            -5 - Math.random() * 10
          ]}>
            {i % 3 === 0 ? (
              <boxGeometry args={[2, 2, 2]} />
            ) : i % 3 === 1 ? (
              <sphereGeometry args={[1, 16, 16]} />
            ) : (
              <torusGeometry args={[1, 0.3, 16, 32]} />
            )}
            <meshStandardMaterial
              color={color.clone().multiplyScalar(isDarkMode ? 0.5 : 0.8 + Math.random() * 0.4).getStyle()}
              roughness={0.5}
              metalness={0.8}
              opacity={0.7}
              transparent
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// Finance-specific environment with stock charts and financial elements
const FinanceEnvironment = ({ primaryColor, isDarkMode }: { primaryColor: string, isDarkMode: boolean }) => {
  const color = new Color(primaryColor);
  
  return (
    <group position={[0, 0, -10]}>
      {/* Stock chart visualization */}
      <StockChart 
        position={[0, 0, -10]} 
        color={color} 
        isDarkMode={isDarkMode} 
      />
      
      {/* 3D financial symbols */}
      <group position={[5, 3, -5]}>
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <Text
            fontSize={5}
            position={[0, 0, 0]}
            color={isDarkMode ? "#e2e8f0" : "#334155"}
            anchorX="center"
            anchorY="middle"
          >
            $
          </Text>
        </Float>
      </group>
    </group>
  );
};

// Marketing-specific environment
const MarketingEnvironment = ({ primaryColor, isDarkMode }: { primaryColor: string, isDarkMode: boolean }) => {
  return (
    <group>
      {/* Add marketing-specific elements here */}
      <DefaultEnvironment primaryColor={primaryColor} isDarkMode={isDarkMode} />
    </group>
  );
};

// Hospitality-specific environment
const HospitalityEnvironment = ({ primaryColor, isDarkMode }: { primaryColor: string, isDarkMode: boolean }) => {
  return (
    <group>
      {/* Add hospitality-specific elements here */}
      <DefaultEnvironment primaryColor={primaryColor} isDarkMode={isDarkMode} />
    </group>
  );
};

// Stock chart visualization component
const StockChart = ({ 
  position, 
  color, 
  isDarkMode 
}: { 
  position: [number, number, number], 
  color: Color,
  isDarkMode: boolean
}) => {
  // Generate random stock data
  const generateStockData = () => {
    const points = 20;
    const data = [];
    let value = 50 + Math.random() * 50;
    
    for (let i = 0; i < points; i++) {
      value += (Math.random() - 0.5) * 10;
      data.push({ x: i, y: value });
    }
    
    return data;
  };
  
  const stockData = generateStockData();
  
  return (
    <group position={position}>
      {/* Chart lines */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={stockData.length}
            array={new Float32Array(
              stockData.flatMap((point, i) => [
                (point.x / 20) * 20 - 10,
                (point.y / 100) * 10 - 5,
                0
              ])
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          attach="material"
          color={color.clone().multiplyScalar(isDarkMode ? 0.7 : 1).getStyle()}
          linewidth={2}
          linecap="round"
          linejoin="round"
        />
      </line>
    </group>
  );
};

// Interactive floating elements that respond to user movement
const FloatingElements = ({ 
  primaryColor, 
  isDarkMode 
}: { 
  primaryColor: string,
  isDarkMode: boolean
}) => {
  const color = new Color(primaryColor);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ mouse, viewport }) => {
    if (!groupRef.current) return;
    
    // Convert mouse position to 3D space
    const x = (mouse.x * viewport.width) / 2;
    const y = (mouse.y * viewport.height) / 2;
    
    // Subtle movement following the mouse
    groupRef.current.position.x += (x - groupRef.current.position.x) * 0.02;
    groupRef.current.position.y += (y - groupRef.current.position.y) * 0.02;
  });
  
  return (
    <group ref={groupRef}>
      {Array.from({ length: 15 }).map((_, i) => (
        <Float 
          key={i} 
          speed={i * 0.1 + 0.3} 
          rotationIntensity={0.2} 
          floatIntensity={0.8}
          position={[
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 15,
            -5 - Math.random() * 15
          ]}
        >
          <mesh>
            {i % 4 === 0 ? (
              <boxGeometry args={[0.5, 0.5, 0.5]} />
            ) : i % 4 === 1 ? (
              <sphereGeometry args={[0.3, 16, 16]} />
            ) : i % 4 === 2 ? (
              <torusGeometry args={[0.3, 0.1, 16, 32]} />
            ) : (
              <octahedronGeometry args={[0.4]} />
            )}
            <meshStandardMaterial
              color={color.clone().lerp(new Color(isDarkMode ? "#ffffff" : "#000000"), Math.random() * 0.2).getStyle()}
              roughness={0.5}
              metalness={0.8}
              opacity={isDarkMode ? 0.6 : 0.3}
              transparent
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

export default ThreeEnvironment;