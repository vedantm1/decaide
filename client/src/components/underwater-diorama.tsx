import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Define colors
const DIEGO_COLOR = '#1AB7EA'; // Teal
const DIEGO_LIGHT_COLOR = '#7BE3F4'; // Light aqua
const WATER_COLOR = '#58CCE5'; // Bright aqua blue
const SAND_COLOR = '#F5DEB3'; // Wheat/sand color
const CORAL_COLORS = ['#FF6B6B', '#48CFAD', '#FFCE54', '#FC8EAC', '#AC92EC'];

// Define the Bubble component
const Bubble = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  // Random speed for each bubble
  const speed = useMemo(() => Math.random() * 0.02 + 0.01, []);
  
  // Animate bubbles rising
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y += speed;
      
      // Reset position when bubble goes offscreen
      if (ref.current.position.y > 5) {
        ref.current.position.y = -2;
        ref.current.position.x = position[0] + (Math.random() * 0.5 - 0.25);
        ref.current.position.z = position[2] + (Math.random() * 0.5 - 0.25);
      }
    }
  });
  
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.05 + Math.random() * 0.05, 8, 8]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
    </mesh>
  );
};

// Define the Fish component
const Fish = ({ color, position, speed = 0.01, direction = 1, size = 1 }: { 
  color: string; 
  position: [number, number, number]; 
  speed?: number;
  direction?: number;
  size?: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const initialX = useMemo(() => position[0], [position]);
  
  // Animate fish swimming
  useFrame((state) => {
    if (ref.current) {
      // Move the fish
      ref.current.position.x += speed * direction;
      
      // Wiggle the tail
      if (tailRef.current) {
        tailRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 5) * 0.3;
      }
      
      // When fish goes offscreen, reset to other side
      if (direction > 0 && ref.current.position.x > 6) {
        ref.current.position.x = -6;
      } else if (direction < 0 && ref.current.position.x < -6) {
        ref.current.position.x = 6;
      }
    }
  });
  
  return (
    <group ref={ref} position={position} scale={[size, size, size]} rotation={[0, direction > 0 ? 0 : Math.PI, 0]}>
      {/* Fish body */}
      <mesh>
        <tetrahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Fish tail */}
      <mesh ref={tailRef} position={[-0.2, 0, 0]}>
        <coneGeometry args={[0.1, 0.2, 3]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// Define the Seaweed component
const Seaweed = ({ position, height = 1, color = '#48CFAD' }: { 
  position: [number, number, number]; 
  height?: number;
  color?: string;
}) => {
  const ref = useRef<THREE.Group>(null);
  const segments = useMemo(() => Math.floor(height * 5), [height]);
  const segmentRefs = useRef<THREE.Mesh[]>([]);
  
  // Initialize segment refs array
  useEffect(() => {
    segmentRefs.current = Array(segments).fill(null);
  }, [segments]);
  
  // Animate seaweed swaying
  useFrame((state) => {
    segmentRefs.current.forEach((segment, index) => {
      if (segment) {
        // Apply progressive sway with delay based on segment index
        segment.rotation.z = Math.sin(state.clock.getElapsedTime() + index * 0.2) * 0.1;
      }
    });
  });
  
  return (
    <group ref={ref} position={position}>
      {Array.from({ length: segments }).map((_, i) => (
        <mesh 
          key={i}
          ref={(el) => { if (el) segmentRefs.current[i] = el; }}
          position={[0, (i * height) / segments, 0]}
        >
          <cylinderGeometry args={[0.03, 0.05, height / segments, 5]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
};

// Define the Coral component
const Coral = ({ position, color = '#FF6B6B', type = 'branch' }: {
  position: [number, number, number];
  color?: string;
  type?: 'branch' | 'fan' | 'brain';
}) => {
  const branchCount = useMemo(() => Math.floor(Math.random() * 5) + 3, []);
  
  // Different coral types
  if (type === 'fan') {
    return (
      <group position={position}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 8, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  }
  
  if (type === 'brain') {
    return (
      <group position={position}>
        <mesh>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Brain-like ridges */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, 0.05 + i * 0.05, 0]} rotation={[0, (i * Math.PI) / 2.5, 0]}>
            <torusGeometry args={[0.2, 0.03, 8, 8, Math.PI]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
      </group>
    );
  }
  
  // Default branch coral
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.1, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Branches */}
      {Array.from({ length: branchCount }).map((_, i) => {
        const angle = (i / branchCount) * Math.PI * 2;
        const height = 0.2 + Math.random() * 0.3;
        const bend = Math.random() * 0.5 - 0.25;
        
        return (
          <mesh key={i} position={[
            Math.sin(angle) * 0.1,
            0,
            Math.cos(angle) * 0.1
          ]} rotation={[
            bend,
            angle,
            Math.PI / 2 - 0.2
          ]}>
            <coneGeometry args={[0.04, height, 5]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
};

// Define the TreasureChest component
const TreasureChest = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Mesh>(null);
  const isOpen = useRef(false);
  
  // Animate chest opening on click
  const handleClick = () => {
    isOpen.current = !isOpen.current;
  };
  
  useFrame((state) => {
    if (lidRef.current) {
      // Animate chest lid
      if (isOpen.current) {
        lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, -Math.PI / 2, 0.1);
      } else {
        lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, 0, 0.1);
      }
    }
  });
  
  return (
    <group ref={ref} position={position} onClick={handleClick}>
      {/* Chest base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.4]} />
        <meshStandardMaterial color="#A0522D" />
      </mesh>
      
      {/* Chest lid */}
      <mesh ref={lidRef} position={[0, 0.2, 0.2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Decorative elements */}
      <mesh position={[0, 0.1, 0.21]}>
        <boxGeometry args={[0.5, 0.04, 0.01]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Gold coins */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 0.4,
          0.25,
          (Math.random() - 0.5) * 0.2
        ]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

// Define the Starfish component
const Starfish = ({ position, color = '#FF6B6B', size = 1 }: {
  position: [number, number, number];
  color?: string;
  size?: number;
}) => {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, Math.random() * Math.PI * 2]} scale={[size, size, size]}>
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        
        return (
          <mesh key={i} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.3, 0.1, 0.05]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
};

// Define the Anchor component
const Anchor = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position} rotation={[0, Math.random() * Math.PI * 2, 0]}>
      {/* Anchor ring */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[0.1, 0.03, 8, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Anchor shaft */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Anchor arms */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Anchor flukes */}
      <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
};

// Define the Diego dolphin component
const DiegoDolphin = () => {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const finRef = useRef<THREE.Mesh>(null);
  
  // Diego's swimming animation
  useFrame((state) => {
    if (groupRef.current) {
      // Move Diego in a gentle arc
      const time = state.clock.getElapsedTime();
      groupRef.current.position.x = Math.sin(time * 0.5) * 2;
      groupRef.current.position.y = Math.sin(time * 0.3) * 0.5 + 1;
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.2 + Math.PI * 0.75;
      groupRef.current.rotation.z = Math.sin(time * 0.3) * 0.1;
      
      // Animate tail
      if (tailRef.current) {
        tailRef.current.rotation.y = Math.sin(time * 5) * 0.3;
      }
      
      // Animate fin
      if (finRef.current) {
        finRef.current.rotation.z = Math.sin(time * 3) * 0.1;
      }
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      {/* Diego's body */}
      <mesh>
        <capsuleGeometry args={[0.3, 1, 8, 16]} />
        <meshStandardMaterial color={DIEGO_COLOR} />
      </mesh>
      
      {/* Diego's tail */}
      <mesh ref={tailRef} position={[0, -0.7, 0]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial color={DIEGO_COLOR} />
      </mesh>
      
      {/* Diego's fins */}
      <mesh ref={finRef} position={[0, 0, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color={DIEGO_LIGHT_COLOR} />
      </mesh>
      <mesh position={[0, 0, -0.3]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color={DIEGO_LIGHT_COLOR} />
      </mesh>
      
      {/* Diego's head */}
      <mesh position={[0.35, 0.2, 0]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color={DIEGO_COLOR} />
      </mesh>
      
      {/* Diego's snout */}
      <mesh position={[0.55, 0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial color={DIEGO_LIGHT_COLOR} />
      </mesh>
      
      {/* Diego's eyes */}
      <mesh position={[0.45, 0.25, 0.15]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.45, 0.25, -0.15]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Diego's pupils */}
      <mesh position={[0.5, 0.25, 0.15]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.5, 0.25, -0.15]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* Diego's belly */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 1.4]} />
        <meshStandardMaterial color={DIEGO_LIGHT_COLOR} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Define the underwater scene component
const UnderwaterScene = () => {
  const { scene } = useThree();
  
  // Setup scene
  useEffect(() => {
    // Set background color
    scene.background = new THREE.Color(WATER_COLOR);
    scene.fog = new THREE.FogExp2(WATER_COLOR, 0.05);
  }, [scene]);
  
  // Create random objects for the scene
  const seaweedPositions = useMemo(() => {
    return Array.from({ length: 20 }).map(() => [
      (Math.random() - 0.5) * 10,
      Math.random() * 0.5,
      (Math.random() - 0.5) * 10
    ] as [number, number, number]);
  }, []);
  
  const coralPositions = useMemo(() => {
    return Array.from({ length: 15 }).map(() => [
      (Math.random() - 0.5) * 10,
      Math.random() * 0.2,
      (Math.random() - 0.5) * 10
    ] as [number, number, number]);
  }, []);
  
  const fishPositions = useMemo(() => {
    return Array.from({ length: 25 }).map(() => [
      (Math.random() - 0.5) * 10,
      0.5 + Math.random() * 2,
      (Math.random() - 0.5) * 10
    ] as [number, number, number]);
  }, []);
  
  const bubblePositions = useMemo(() => {
    return Array.from({ length: 50 }).map(() => [
      (Math.random() - 0.5) * 10,
      -2 + Math.random() * 4,
      (Math.random() - 0.5) * 10
    ] as [number, number, number]);
  }, []);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#ffa95c" />
      <hemisphereLight color="#88ccff" groundColor="#444444" intensity={0.5} />
      
      {/* Set camera */}
      <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={60} />
      
      {/* Water surface with caustics */}
      <mesh position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20, 32, 32]} />
        <meshStandardMaterial 
          color={WATER_COLOR} 
          transparent 
          opacity={0.5} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Sand floor */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial color={SAND_COLOR} />
      </mesh>
      
      {/* Diego the dolphin */}
      <DiegoDolphin />
      
      {/* Fish schools */}
      {fishPositions.map((position, i) => (
        <Fish 
          key={i} 
          position={position} 
          color={CORAL_COLORS[i % CORAL_COLORS.length]} 
          speed={0.01 + Math.random() * 0.03} 
          direction={Math.random() > 0.5 ? 1 : -1}
          size={0.5 + Math.random() * 1}
        />
      ))}
      
      {/* Seaweed */}
      {seaweedPositions.map((position, i) => (
        <Seaweed 
          key={i} 
          position={position} 
          height={0.5 + Math.random() * 1.5} 
          color={CORAL_COLORS[(i + 2) % CORAL_COLORS.length]} 
        />
      ))}
      
      {/* Coral */}
      {coralPositions.map((position, i) => {
        // Determine coral type safely with TypeScript
        const coralTypes: Array<'branch' | 'fan' | 'brain'> = ['branch', 'fan', 'brain'];
        const randomType = coralTypes[Math.floor(Math.random() * coralTypes.length)];
        
        return (
          <Coral 
            key={i} 
            position={position} 
            color={CORAL_COLORS[i % CORAL_COLORS.length]} 
            type={randomType} 
          />
        );
      })}
      
      {/* Treasure chest */}
      <TreasureChest position={[2, 0, 1]} />
      
      {/* Anchor */}
      <Anchor position={[-3, 0, -2]} />
      
      {/* Starfish */}
      <Starfish position={[1, -0.4, 3]} color="#FF6347" />
      <Starfish position={[-2, -0.4, 2]} color="#FFA500" size={0.7} />
      <Starfish position={[3, -0.4, -1]} color="#FF69B4" size={1.2} />
      
      {/* Bubbles */}
      {bubblePositions.map((position, i) => (
        <Bubble key={i} position={position} />
      ))}
      
      {/* Controls with limits */}
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={15}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

// Main component
export interface UnderwaterDioramaProps {
  className?: string;
}

const UnderwaterDiorama: React.FC<UnderwaterDioramaProps> = ({ className }) => {
  return (
    <div className={`fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10 ${className || ''}`}>
      <motion.div 
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <Canvas shadows gl={{ antialias: true, alpha: false }}>
          <UnderwaterScene />
        </Canvas>
      </motion.div>
    </div>
  );
};

export default UnderwaterDiorama;