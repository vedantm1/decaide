import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Float, Text } from '@react-three/drei';
import { useSpring, animated, config } from '@react-spring/three';
import { Color, Group, Vector3 } from 'three';

interface DiegoCharacterProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  colorScheme?: string;
  isDarkMode?: boolean;
  isNewUser?: boolean;
  isChatOpen?: boolean;
  onDiegoClick?: () => void;
  emotionState?: 'idle' | 'happy' | 'excited' | 'thinking' | 'confused';
}

// Create Diego character as a simple stylized 3D model
// Note: In a production system we'd import a proper GLB model here
const DiegoCharacter: React.FC<DiegoCharacterProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  colorScheme = 'aquaBlue',
  isDarkMode = false,
  isNewUser = false,
  isChatOpen = false,
  onDiegoClick,
  emotionState = 'idle'
}) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(null);
  const time = useRef(0);
  
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
  const diegoColor = new Color(primaryColor);
  
  // Springs for animations
  const [springs, api] = useSpring(() => ({
    position: position,
    rotation: rotation,
    scale: scale,
    config: config.gentle
  }));
  
  // Different emotion states control the animation parameters
  useEffect(() => {
    // Get animation parameters based on emotion
    const getEmotionAnimParams = () => {
      switch (emotionState) {
        case 'happy':
          return {
            rotationAmplitude: 0.1,
            positionAmplitude: 0.1,
            speed: 0.8
          };
        case 'excited':
          return {
            rotationAmplitude: 0.2,
            positionAmplitude: 0.2,
            speed: 1.5
          };
        case 'thinking':
          return {
            rotationAmplitude: 0.05,
            positionAmplitude: 0.05,
            speed: 0.3
          };
        case 'confused':
          return {
            rotationAmplitude: 0.15,
            positionAmplitude: 0.07,
            speed: 0.5
          };
        case 'idle':
        default:
          return {
            rotationAmplitude: 0.07,
            positionAmplitude: 0.07,
            speed: 0.5
          };
      }
    };
    
    // Set speech bubble text based on emotion
    const getSpeechText = () => {
      if (isNewUser) {
        return "Hi there! I'm Diego, your AI guide!";
      }
      
      switch (emotionState) {
        case 'happy':
          return "Great job on your progress!";
        case 'excited':
          return "Wow! That's impressive!";
        case 'thinking':
          return "Hmm, let me think about that...";
        case 'confused':
          return "I'm not sure I understand...";
        case 'idle':
        default:
          return null;
      }
    };
    
    setSpeechBubbleText(getSpeechText());
    
    // Apply spring animation based on emotion
    const params = getEmotionAnimParams();
    api.start({
      scale: hovered ? scale * 1.1 : scale,
      config: { 
        tension: emotionState === 'excited' ? 300 : 170,
        friction: emotionState === 'thinking' ? 40 : 25
      }
    });
    
  }, [emotionState, isNewUser, scale, hovered, api]);

  // Handle hover and click
  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
    setSpeechBubbleText("Click to chat with me!");
  };
  
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
    
    // Reset to emotion-based text
    const getSpeechText = () => {
      if (isNewUser) {
        return "Hi there! I'm Diego, your AI guide!";
      }
      
      switch (emotionState) {
        case 'happy':
          return "Great job on your progress!";
        case 'excited':
          return "Wow! That's impressive!";
        case 'thinking':
          return "Hmm, let me think about that...";
        case 'confused':
          return "I'm not sure I understand...";
        case 'idle':
        default:
          return null;
      }
    };
    
    setSpeechBubbleText(getSpeechText());
  };
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    setClicked(true);
    if (onDiegoClick) onDiegoClick();
    
    // Visual feedback animation
    api.start({
      scale: scale * 0.9,
      config: { ...config.wobbly, friction: 15 }
    });
    
    setTimeout(() => {
      api.start({
        scale: scale,
        config: config.gentle
      });
      setClicked(false);
    }, 200);
  };

  // Swimming animation
  useFrame((state) => {
    if (!groupRef.current) return;
    
    time.current += state.clock.getDelta();
    
    // Get animation parameters based on emotion
    const getEmotionAnimParams = () => {
      switch (emotionState) {
        case 'happy':
          return {
            rotationAmplitude: 0.1,
            positionAmplitude: 0.1,
            speed: 0.8
          };
        case 'excited':
          return {
            rotationAmplitude: 0.2,
            positionAmplitude: 0.2,
            speed: 1.5
          };
        case 'thinking':
          return {
            rotationAmplitude: 0.05,
            positionAmplitude: 0.05,
            speed: 0.3
          };
        case 'confused':
          return {
            rotationAmplitude: 0.15,
            positionAmplitude: 0.07,
            speed: 0.5
          };
        case 'idle':
        default:
          return {
            rotationAmplitude: 0.07,
            positionAmplitude: 0.07,
            speed: 0.5
          };
      }
    };
    
    const params = getEmotionAnimParams();
    const t = time.current * params.speed;
    
    // Swimming motion
    groupRef.current.rotation.z = rotation[2] + Math.sin(t) * params.rotationAmplitude;
    groupRef.current.rotation.x = rotation[0] + Math.sin(t * 0.5) * params.rotationAmplitude * 0.3;
    groupRef.current.rotation.y = rotation[1] + Math.cos(t * 0.3) * params.rotationAmplitude * 0.2;
    
    // Up and down motion
    groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * params.positionAmplitude;
    
    // Subtle side to side motion
    groupRef.current.position.x = position[0] + Math.sin(t * 0.3) * params.positionAmplitude * 0.5;
  });

  return (
    <animated.group
      ref={groupRef}
      position={springs.position}
      rotation={springs.rotation.to((x, y, z) => [x, y, z])}
      scale={springs.scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Stylized dolphin body - would be replaced by proper model in production */}
      <group>
        {/* Dolphin body */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.4, 1, 8, 16]} />
          <meshStandardMaterial
            color={diegoColor.getStyle()}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        
        {/* Dolphin head */}
        <mesh position={[0, 0.3, 0.6]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color={diegoColor.getStyle()}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        
        {/* Dolphin nose */}
        <mesh position={[0, 0.2, 1]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color={diegoColor.getStyle()}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[0.2, 0.4, 0.7]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.2, 0.4, 0.7]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Pupils */}
        <mesh position={[0.2, 0.4, 0.78]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[-0.2, 0.4, 0.78]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Fins */}
        <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial
            color={diegoColor.getStyle()}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[-0.4, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial
            color={diegoColor.getStyle()}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        
        {/* Tail */}
        <mesh position={[0, -0.1, -0.9]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.3, 0.1, 8, 16]} />
          <meshStandardMaterial
            color={diegoColor.getStyle()}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      </group>
      
      {/* Speech bubble */}
      {speechBubbleText && (
        <Float
          position={[0, 1, 0]}
          speed={2}
          rotationIntensity={0.1}
          floatIntensity={0.3}
        >
          <mesh position={[0, 0.3, 0]}>
            <planeGeometry args={[2.5, 0.8]} />
            <meshStandardMaterial
              color={isDarkMode ? "#1e293b" : "#ffffff"}
              transparent
              opacity={0.9}
            />
          </mesh>
          
          {/* Speech bubble pointer */}
          <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshStandardMaterial
              color={isDarkMode ? "#1e293b" : "#ffffff"}
              transparent
              opacity={0.9}
            />
          </mesh>
          
          <Text
            position={[0, 0.3, 0.01]}
            fontSize={0.15}
            maxWidth={2.3}
            lineHeight={1.3}
            color={isDarkMode ? "#ffffff" : "#000000"}
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-medium.woff"
          >
            {speechBubbleText}
          </Text>
        </Float>
      )}
    </animated.group>
  );
};

export default DiegoCharacter;