import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function RotatingBox(props: any) {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.y += 0.005;
    }
  });
  
  return (
    <Box args={[2, 2, 2]} {...props} ref={mesh}>
      <meshStandardMaterial color={props.color || "#3b82f6"} />
    </Box>
  );
}

function RotatingSphere(props: any) {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.005;
      mesh.current.rotation.y += 0.01;
    }
  });
  
  return (
    <Sphere args={[1, 32, 32]} {...props} ref={mesh}>
      <meshStandardMaterial color={props.color || "#ec4899"} />
    </Sphere>
  );
}

function FloatingElements() {
  return (
    <group>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15
        ]}>
          {i % 2 === 0 ? (
            <boxGeometry args={[0.5, 0.5, 0.5]} />
          ) : (
            <sphereGeometry args={[0.3, 16, 16]} />
          )}
          <meshStandardMaterial 
            color={`hsl(${Math.random() * 360}, 70%, 60%)`}
            emissive={`hsl(${Math.random() * 360}, 70%, 30%)`}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function Grid() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[30, 30, 10, 10]} />
      <meshStandardMaterial 
        color="#1e293b" 
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

const BasicEnvironment: React.FC<{
  colorScheme?: string;
}> = ({ colorScheme = 'aquaBlue' }) => {
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
        camera={{ position: [0, 0, 10] }}
        gl={{ 
          antialias: true,
          alpha: true
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Grid />
        <FloatingElements />
        
        <RotatingBox position={[-3, 0, 0]} color={primaryColor} />
        <RotatingSphere position={[3, 0, 0]} color={isDarkMode ? "#e2e8f0" : "#334155"} />
        
        {/* Add some camera controls for testing */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default BasicEnvironment;